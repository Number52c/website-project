import { describe, it, expect } from "vitest";
import {
  parseName,
  parseDate,
  parseNumber,
  parsePercent,
  extractField,
  buildColumnMap,
  findDataStartRow,
  FIELD_MAPPINGS,
} from "./importHelper";

describe("importHelper", () => {
  describe("parseName", () => {
    it("should parse full name in one cell", () => {
      const result = parseName("John Smith", undefined);
      expect(result).toEqual({ firstName: "John", lastName: "Smith" });
    });

    it("should parse first and last name split across cells", () => {
      const result = parseName("John", "Smith");
      expect(result).toEqual({ firstName: "John", lastName: "Smith" });
    });

    it("should handle multi-word last names", () => {
      const result = parseName("John", "van der Berg");
      expect(result).toEqual({ firstName: "John", lastName: "van der Berg" });
    });

    it("should return null for empty input", () => {
      const result = parseName("", "");
      expect(result).toBeNull();
    });

    it("should ignore header-like last names", () => {
      const result = parseName("John", "Carrier");
      expect(result).toEqual({ firstName: "John", lastName: "Carrier" });
    });
  });

  describe("parseDate", () => {
    it("should parse ISO date string", () => {
      const result = parseDate("2025-06-15");
      expect(result).toBeDefined();
      expect(result).toBeGreaterThan(0);
    });

    it("should parse US date format", () => {
      const result = parseDate("06/15/2025");
      expect(result).toBeDefined();
      expect(result).toBeGreaterThan(0);
    });

    it("should return undefined for invalid date", () => {
      const result = parseDate("invalid");
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const result = parseDate("");
      expect(result).toBeUndefined();
    });
  });

  describe("parseNumber", () => {
    it("should parse plain number", () => {
      const result = parseNumber("1000");
      expect(result).toBe(1000);
    });

    it("should parse number with currency symbol", () => {
      const result = parseNumber("$1,000.50");
      expect(result).toBe(1000.5);
    });

    it("should parse number with commas", () => {
      const result = parseNumber("1,000,000");
      expect(result).toBe(1000000);
    });

    it("should return default value for invalid input", () => {
      const result = parseNumber("abc", 0);
      expect(result).toBe(0);
    });

    it("should return default value for empty string", () => {
      const result = parseNumber("", 100);
      expect(result).toBe(100);
    });
  });

  describe("parsePercent", () => {
    it("should parse percentage value", () => {
      const result = parsePercent("75");
      expect(result).toBe(75);
    });

    it("should parse percentage with % symbol", () => {
      const result = parsePercent("75%");
      expect(result).toBe(75);
    });

    it("should cap at 100", () => {
      const result = parsePercent("150");
      expect(result).toBe(100);
    });

    it("should floor at 0", () => {
      const result = parsePercent("-10");
      expect(result).toBe(0);
    });

    it("should return default for invalid input", () => {
      const result = parsePercent("abc", 50);
      expect(result).toBe(50);
    });
  });

  describe("extractField", () => {
    it("should extract field using positional index when no colMap", () => {
      const row = ["John", "Smith", "john@example.com", "555-1234"];
      const result = extractField(row, "email", null, 2);
      expect(result).toBe("john@example.com");
    });

    it("should extract field using column map", () => {
      const row = ["John", "Smith", "john@example.com", "555-1234"];
      const colMap = { "email": 2, "phone": 3 };
      const result = extractField(row, "email", colMap, 999);
      expect(result).toBe("john@example.com");
    });

    it("should try multiple header variations", () => {
      const row = ["John", "Smith", "john@example.com", "555-1234"];
      const colMap = { "email address": 2 };
      const result = extractField(row, "email", colMap, 999);
      expect(result).toBe("john@example.com");
    });

    it("should return empty string if field not found", () => {
      const row = ["John", "Smith"];
      const colMap = { "name": 0 };
      const result = extractField(row, "email", colMap, 999);
      expect(result).toBe("");
    });
  });

  describe("buildColumnMap", () => {
    it("should build column map from header row", () => {
      const headerRow = ["First Name", "Last Name", "Email", "Phone"];
      const result = buildColumnMap(headerRow);
      expect(result["first name"]).toBe(0);
      expect(result["last name"]).toBe(1);
      expect(result["email"]).toBe(2);
      expect(result["phone"]).toBe(3);
    });

    it("should normalize header names to lowercase", () => {
      const headerRow = ["FIRST NAME", "Last Name"];
      const result = buildColumnMap(headerRow);
      expect(result["first name"]).toBe(0);
      expect(result["last name"]).toBe(1);
    });

    it("should skip empty headers", () => {
      const headerRow = ["First Name", "", "Email"];
      const result = buildColumnMap(headerRow);
      expect(result["first name"]).toBe(0);
      expect(result["email"]).toBe(2);
      expect(result[""]).toBeUndefined();
    });
  });

  describe("findDataStartRow", () => {
    it("should find header row with carrier column", () => {
      const rows = [
        ["Some", "Random", "Data"],
        ["First Name", "Last Name", "Carrier"],
        ["John", "Smith", "Transamerica"],
      ];
      const result = findDataStartRow(rows);
      expect(result.startRow).toBe(2);
      expect(result.colMap).toBeDefined();
      expect(result.colMap!["carrier"]).toBe(2);
    });

    it("should find header row with name column", () => {
      const rows = [
        ["Some", "Random", "Data"],
        ["Client Name", "Policy Number", "Premium"],
        ["John Smith", "POL123", "500"],
      ];
      const result = findDataStartRow(rows);
      expect(result.startRow).toBe(2);
      expect(result.colMap).toBeDefined();
    });

    it("should return default if no header found", () => {
      const rows = [
        ["Some", "Random", "Data"],
        ["More", "Random", "Data"],
      ];
      const result = findDataStartRow(rows);
      expect(result.startRow).toBe(0);
      expect(result.colMap).toBeNull();
    });
  });

  describe("FIELD_MAPPINGS", () => {
    it("should have all required client fields", () => {
      expect(FIELD_MAPPINGS.firstName).toBeDefined();
      expect(FIELD_MAPPINGS.lastName).toBeDefined();
      expect(FIELD_MAPPINGS.email).toBeDefined();
      expect(FIELD_MAPPINGS.phone).toBeDefined();
    });

    it("should have all required policy fields", () => {
      expect(FIELD_MAPPINGS.policyNumber).toBeDefined();
      expect(FIELD_MAPPINGS.carrier).toBeDefined();
      expect(FIELD_MAPPINGS.premiumAmount).toBeDefined();
    });

    it("should have beneficiary fields", () => {
      expect(FIELD_MAPPINGS.primaryBeneficiary).toBeDefined();
      expect(FIELD_MAPPINGS.contingentBeneficiary).toBeDefined();
    });

    it("should have payment method fields", () => {
      expect(FIELD_MAPPINGS.bankName).toBeDefined();
      expect(FIELD_MAPPINGS.accountNumber).toBeDefined();
      expect(FIELD_MAPPINGS.routingNumber).toBeDefined();
    });
  });
});
