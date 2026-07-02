/**
 * Data Validation Utilities
 * Ensures data integrity for policies, sales entries, and expenses
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate policy data
 */
export function validatePolicy(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.policyNumber || typeof data.policyNumber !== "string" || data.policyNumber.trim() === "") {
    errors.push({ field: "policyNumber", message: "Policy number is required" });
  }

  if (!data.type || typeof data.type !== "string" || data.type.trim() === "") {
    errors.push({ field: "type", message: "Policy type is required" });
  }

  if (!data.carrier || typeof data.carrier !== "string" || data.carrier.trim() === "") {
    errors.push({ field: "carrier", message: "Carrier is required" });
  }

  if (!data.status || !["active", "pending", "expired", "cancelled"].includes(data.status)) {
    errors.push({ field: "status", message: "Invalid status" });
  }

  // Validate yearly AP if provided
  if (data.yearlyAP !== undefined && data.yearlyAP !== null) {
    const ap = parseFloat(data.yearlyAP);
    if (isNaN(ap) || ap < 0) {
      errors.push({ field: "yearlyAP", message: "Yearly AP must be a positive number" });
    }
  }

  // Validate coverage amount if provided
  if (data.coverageAmount !== undefined && data.coverageAmount !== null) {
    const coverage = parseFloat(data.coverageAmount);
    if (isNaN(coverage) || coverage < 0) {
      errors.push({ field: "coverageAmount", message: "Coverage amount must be a positive number" });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate sales entry data
 */
export function validateSalesEntry(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.clientName || typeof data.clientName !== "string" || data.clientName.trim() === "") {
    errors.push({ field: "clientName", message: "Client name is required" });
  }

  if (!data.productType || typeof data.productType !== "string" || data.productType.trim() === "") {
    errors.push({ field: "productType", message: "Product type is required" });
  }

  if (!data.carrier || typeof data.carrier !== "string" || data.carrier.trim() === "") {
    errors.push({ field: "carrier", message: "Carrier is required" });
  }

  // Validate premium
  if (data.premium === undefined || data.premium === null) {
    errors.push({ field: "premium", message: "Premium is required" });
  } else {
    const premium = parseFloat(data.premium);
    if (isNaN(premium) || premium < 0) {
      errors.push({ field: "premium", message: "Premium must be a positive number" });
    }
  }

  // Validate commission percent
  if (data.commissionPercent === undefined || data.commissionPercent === null) {
    errors.push({ field: "commissionPercent", message: "Commission percent is required" });
  } else {
    const commission = parseFloat(data.commissionPercent);
    if (isNaN(commission) || commission < 0 || commission > 200) {
      errors.push({ field: "commissionPercent", message: "Commission percent must be between 0 and 200" });
    }
  }

  // Validate commission override if provided
  if (data.commissionOverride !== undefined && data.commissionOverride !== null) {
    const override = parseFloat(data.commissionOverride);
    if (isNaN(override) || override < 65 || override > 130) {
      errors.push({ field: "commissionOverride", message: "Commission override must be between 65 and 130" });
    }
  }

  // Validate sale date
  if (data.saleDate === undefined || data.saleDate === null) {
    errors.push({ field: "saleDate", message: "Sale date is required" });
  } else if (typeof data.saleDate !== "number" || data.saleDate < 0) {
    errors.push({ field: "saleDate", message: "Sale date must be a valid timestamp" });
  }

  // Validate sale month and year
  if (data.saleMonth === undefined || data.saleMonth === null) {
    errors.push({ field: "saleMonth", message: "Sale month is required" });
  } else if (typeof data.saleMonth !== "number" || data.saleMonth < 1 || data.saleMonth > 12) {
    errors.push({ field: "saleMonth", message: "Sale month must be between 1 and 12" });
  }

  if (data.saleYear === undefined || data.saleYear === null) {
    errors.push({ field: "saleYear", message: "Sale year is required" });
  } else if (typeof data.saleYear !== "number" || data.saleYear < 2000 || data.saleYear > 2100) {
    errors.push({ field: "saleYear", message: "Sale year must be between 2000 and 2100" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate expense data
 */
export function validateExpense(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.description || typeof data.description !== "string" || data.description.trim() === "") {
    errors.push({ field: "description", message: "Description is required" });
  }

  if (data.amount === undefined || data.amount === null) {
    errors.push({ field: "amount", message: "Amount is required" });
  } else {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push({ field: "amount", message: "Amount must be a positive number" });
    }
  }

  // Validate expense month and year
  if (data.expenseMonth === undefined || data.expenseMonth === null) {
    errors.push({ field: "expenseMonth", message: "Expense month is required" });
  } else if (typeof data.expenseMonth !== "number" || data.expenseMonth < 1 || data.expenseMonth > 12) {
    errors.push({ field: "expenseMonth", message: "Expense month must be between 1 and 12" });
  }

  if (data.expenseYear === undefined || data.expenseYear === null) {
    errors.push({ field: "expenseYear", message: "Expense year is required" });
  } else if (typeof data.expenseYear !== "number" || data.expenseYear < 2000 || data.expenseYear > 2100) {
    errors.push({ field: "expenseYear", message: "Expense year must be between 2000 and 2100" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "").substring(0, 500);
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any): number | null {
  const num = parseFloat(input);
  return isNaN(num) ? null : num;
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: number, endDate: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (startDate > endDate) {
    errors.push({ field: "dateRange", message: "Start date must be before end date" });
  }

  const now = Date.now();
  if (startDate > now) {
    errors.push({ field: "startDate", message: "Start date cannot be in the future" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
