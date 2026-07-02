/**
 * server/importHelper.ts
 * Enhanced import helper for handling all client and policy fields from CSV/Excel/PDF files
 */

import { InsertClient, InsertPolicy } from "../drizzle/schema";

/**
 * Field mapping configuration - maps database field names to possible column header variations
 */
export const FIELD_MAPPINGS = {
  // Client fields
  firstName: ["first name", "firstname", "first", "fname"],
  lastName: ["last name", "lastname", "last", "lname"],
  email: ["email", "email address", "e-mail"],
  phone: ["phone", "phone number", "cell", "mobile", "tel"],
  address: ["address", "street address", "street"],
  city: ["city"],
  state: ["state", "st", "province"],
  zip: ["zip", "zip code", "postal code", "postcode"],
  dateOfBirth: ["dob", "date of birth", "birth date", "birthdate"],
  ssn: ["ssn", "social security number", "social security", "ss#"],
  driverLicense: ["driver license", "drivers license", "dl", "license number"],
  driverLicenseState: ["driver license state", "dl state", "license state"],
  healthConditions: ["health conditions", "medical conditions", "conditions"],
  bankName: ["bank name", "bank"],
  accountNumber: ["account number", "account #", "account"],
  routingNumber: ["routing number", "routing #", "routing"],
  primaryBeneficiary: ["primary beneficiary", "beneficiary", "main beneficiary"],
  primaryBeneficiaryPercent: ["primary beneficiary %", "primary %", "beneficiary %"],
  contingentBeneficiary: ["contingent beneficiary", "secondary beneficiary", "contingent"],
  contingentBeneficiaryPercent: ["contingent beneficiary %", "contingent %", "secondary %"],

  // Policy fields
  policyNumber: ["policy number", "policy #", "policy no", "policy", "policy_number"],
  type: ["type", "coverage type", "policy type", "product", "product type"],
  carrier: ["carrier", "insurance carrier", "company", "insurer"],
  status: ["status", "policy status"],
  premiumAmount: ["premium", "monthly premium", "monthly", "amount", "premium amount"],
  premiumFrequency: ["frequency", "premium frequency", "pay frequency"],
  coverageAmount: ["coverage", "coverage amount", "face amount", "benefit", "death benefit"],
  deductible: ["deductible"],
  effectiveDate: ["effective date", "start date", "issue date", "date issued"],
  expirationDate: ["expiration date", "end date", "maturity date"],
  description: ["description", "notes", "comments"],
};

/**
 * Extract field value from a row using intelligent column detection
 */
export function extractField(
  row: (string | number | null)[],
  fieldName: keyof typeof FIELD_MAPPINGS,
  colMap: Record<string, number> | null,
  defaultIndex: number
): string {
  if (!colMap) {
    // No column map - use positional index
    return (row[defaultIndex] || "").toString().trim();
  }

  // Try to find the field using header names
  const headerVariations = FIELD_MAPPINGS[fieldName];
  for (const headerName of headerVariations) {
    const colIndex = colMap[headerName.toLowerCase()];
    if (colIndex !== undefined && row[colIndex] !== null && row[colIndex] !== undefined) {
      return (row[colIndex] || "").toString().trim();
    }
  }

  return "";
}

/**
 * Parse a date string to UTC timestamp
 */
export function parseDate(dateStr: string): number | undefined {
  if (!dateStr || !dateStr.trim()) return undefined;
  const parsed = new Date(dateStr.trim());
  if (!isNaN(parsed.getTime())) {
    return parsed.getTime();
  }
  return undefined;
}

/**
 * Parse a numeric value, stripping currency symbols and commas
 */
export function parseNumber(value: string, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse a percentage value (0-100)
 */
export function parsePercent(value: string, defaultValue: number = 100): number {
  if (!value) return defaultValue;
  const cleaned = value.replace(/[^0-9-]/g, "");
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? defaultValue : Math.min(100, Math.max(0, parsed));
}

/**
 * Parse client name - handles both "FirstName LastName" in one cell or split across two cells
 */
export function parseName(
  firstNameOrFull: string | undefined,
  lastName: string | undefined
): { firstName: string; lastName: string } | null {
  const first = (firstNameOrFull || "").toString().trim();
  const last = (lastName || "").toString().trim();

  if (!first) return null;

  // If both parts provided and last name doesn't look like a header
  if (last && last !== "") {
    return { firstName: first, lastName: last };
  }

  // Full name in one cell - split by spaces
  const parts = first.split(/\s+/);
  if (parts.length >= 2) {
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }

  return null;
}

/**
 * Build client data from row with all available fields
 */
export function buildClientData(
  firstName: string,
  lastName: string,
  row: (string | number | null)[],
  colMap: Record<string, number> | null,
  pin: string
): Partial<InsertClient> {
  const email = extractField(row, "email", colMap, 4);
  const phone = extractField(row, "phone", colMap, 3);
  const address = extractField(row, "address", colMap, 13);
  const city = extractField(row, "city", colMap, 14);
  const state = extractField(row, "state", colMap, 15);
  const zip = extractField(row, "zip", colMap, 16);

  const dobStr = extractField(row, "dateOfBirth", colMap, 17);
  const dateOfBirth = parseDate(dobStr);

  const primaryBeneficiary = extractField(row, "primaryBeneficiary", colMap, 18);
  const primaryBeneficiaryPercentStr = extractField(row, "primaryBeneficiaryPercent", colMap, 19);
  const primaryBeneficiaryPercent = primaryBeneficiary ? parsePercent(primaryBeneficiaryPercentStr, 100) : undefined;

  const contingentBeneficiary = extractField(row, "contingentBeneficiary", colMap, 20);
  const contingentBeneficiaryPercentStr = extractField(row, "contingentBeneficiaryPercent", colMap, 21);
  const contingentBeneficiaryPercent = contingentBeneficiary ? parsePercent(contingentBeneficiaryPercentStr, 0) : undefined;

  const bankName = extractField(row, "bankName", colMap, 22);
  const accountNumber = extractField(row, "accountNumber", colMap, 23);
  const routingNumber = extractField(row, "routingNumber", colMap, 24);

  return {
    firstName,
    lastName,
    email: email || "",
    pin,
    phone: phone || undefined,
    address: address || undefined,
    city: city || undefined,
    state: state || undefined,
    zip: zip || undefined,
    dateOfBirth,
    primaryBeneficiary: primaryBeneficiary || undefined,
    primaryBeneficiaryPercent,
    contingentBeneficiary: contingentBeneficiary || undefined,
    contingentBeneficiaryPercent,
    bankName: bankName || undefined,
    accountNumber: accountNumber || undefined,
    routingNumber: routingNumber || undefined,
  };
}

/**
 * Build policy data from row with all available fields
 */
export function buildPolicyData(
  clientId: number,
  row: (string | number | null)[],
  colMap: Record<string, number> | null,
  sheetName: string,
  rowIndex: number
): Partial<InsertPolicy> {
  const policyNumber = extractField(row, "policyNumber", colMap, 6) || `IMP-${sheetName}-${rowIndex}`;
  const typeStr = extractField(row, "type", colMap, 10) || "Insurance";
  const carrier = extractField(row, "carrier", colMap, 5);
  const statusStr = extractField(row, "status", colMap, 11).toLowerCase();
  const premiumStr = extractField(row, "premiumAmount", colMap, 7) || "0";
  const coverageStr = extractField(row, "coverageAmount", colMap, 9) || "0";
  const deductibleStr = extractField(row, "deductible", colMap, 25) || "0";

  const effectiveDateStr = extractField(row, "effectiveDate", colMap, 12);
  const effectiveDate = parseDate(effectiveDateStr);

  const expirationDateStr = extractField(row, "expirationDate", colMap, 26);
  const expirationDate = parseDate(expirationDateStr);

  const description = extractField(row, "description", colMap, 27);

  // Map status
  let status: "active" | "pending" | "expired" | "cancelled" = "active";
  if (statusStr.includes("cancel") || statusStr.includes("decline")) {
    status = "cancelled";
  } else if (statusStr.includes("pending") || statusStr === "choose") {
    status = "pending";
  } else if (statusStr.includes("expire")) {
    status = "expired";
  }

  // Map type to policyType enum
  const policyTypeMap: Record<string, string> = {
    'fixed': 'fixed_annuity',
    'variable': 'variable_annuity',
    'indexed': 'indexed_annuity',
    'immediate': 'immediate_annuity',
    'term': 'term_life',
    'whole': 'whole_life',
    'universal': 'universal_life',
    'variable_universal': 'variable_universal_life',
    'disability': 'disability',
    'critical': 'critical_illness',
  };
  const policyType = (policyTypeMap[typeStr.toLowerCase()] ?? 'other') as "term_life" | "whole_life" | "graded_whole_life" | "universal_life" | "variable_universal_life" | "fixed_annuity" | "variable_annuity" | "indexed_annuity" | "immediate_annuity" | "disability" | "critical_illness" | "other";

  return {
    clientId,
    policyNumber,
    type: policyType,
    carrier,
    status,
    premiumAmount: parseNumber(premiumStr).toFixed(2),
    coverageAmount: parseNumber(coverageStr).toFixed(2),
    effectiveDate: effectiveDate ? Math.floor(new Date(effectiveDate).getTime()) : undefined,
    expirationDate: expirationDate ? Math.floor(new Date(expirationDate).getTime()) : undefined,
    notes: description || `Imported from ${sheetName}`,
  };
}

/**
 * Build column map from header row
 */
export function buildColumnMap(headerRow: (string | number | null)[]): Record<string, number> {
  const colMap: Record<string, number> = {};
  headerRow.forEach((header, idx) => {
    const headerStr = (header || "").toString().toLowerCase().trim();
    if (headerStr) {
      colMap[headerStr] = idx;
    }
  });
  return colMap;
}

/**
 * Find the data start row by looking for header row
 */
export function findDataStartRow(
  rows: (string | number | null)[][],
  maxSearchRows: number = 10
): { startRow: number; colMap: Record<string, number> | null } {
  for (let i = 0; i < Math.min(rows.length, maxSearchRows); i++) {
    const row = rows[i];
    if (!row) continue;

    const headerStr = row.map(h => (h || "").toString().toLowerCase());
    const hasCarrier = headerStr.some(h => h.includes("carrier"));
    const hasName = headerStr.some(h => h.includes("name") || h.includes("first") || h.includes("last"));

    if (hasCarrier || hasName) {
      return {
        startRow: i + 1,
        colMap: buildColumnMap(row),
      };
    }
  }

  // No header found - return default
  return { startRow: 0, colMap: null };
}
