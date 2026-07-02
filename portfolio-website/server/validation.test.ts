/**
 * Vitest tests for data validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  validatePolicy,
  validateSalesEntry,
  validateExpense,
  sanitizeString,
  sanitizeNumber,
  validateDateRange,
} from "./validation";

describe("Data Validation", () => {
  describe("validatePolicy", () => {
    it("should accept valid policy data", () => {
      const result = validatePolicy({
        policyNumber: "POL123",
        type: "Term Life",
        carrier: "Aetna",
        status: "active",
        yearlyAP: "1000.00",
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject missing policy number", () => {
      const result = validatePolicy({
        type: "Term Life",
        carrier: "Aetna",
        status: "active",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "policyNumber")).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = validatePolicy({
        policyNumber: "POL123",
        type: "Term Life",
        carrier: "Aetna",
        status: "invalid",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "status")).toBe(true);
    });

    it("should reject negative yearly AP", () => {
      const result = validatePolicy({
        policyNumber: "POL123",
        type: "Term Life",
        carrier: "Aetna",
        status: "active",
        yearlyAP: "-100",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "yearlyAP")).toBe(true);
    });
  });

  describe("validateSalesEntry", () => {
    it("should accept valid sales entry", () => {
      const result = validateSalesEntry({
        clientName: "John Doe",
        productType: "Term Life",
        carrier: "Aetna",
        premium: "1000",
        commissionPercent: "50",
        saleDate: Date.now(),
        saleMonth: 6,
        saleYear: 2026,
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject missing required fields", () => {
      const result = validateSalesEntry({
        clientName: "John Doe",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject commission percent outside valid range", () => {
      const result = validateSalesEntry({
        clientName: "John Doe",
        productType: "Term Life",
        carrier: "Aetna",
        premium: "1000",
        commissionPercent: "250",
        saleDate: Date.now(),
        saleMonth: 6,
        saleYear: 2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "commissionPercent")).toBe(true);
    });

    it("should reject invalid commission override", () => {
      const result = validateSalesEntry({
        clientName: "John Doe",
        productType: "Term Life",
        carrier: "Aetna",
        premium: "1000",
        commissionPercent: "50",
        commissionOverride: "150",
        saleDate: Date.now(),
        saleMonth: 6,
        saleYear: 2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "commissionOverride")).toBe(true);
    });

    it("should reject invalid month", () => {
      const result = validateSalesEntry({
        clientName: "John Doe",
        productType: "Term Life",
        carrier: "Aetna",
        premium: "1000",
        commissionPercent: "50",
        saleDate: Date.now(),
        saleMonth: 13,
        saleYear: 2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "saleMonth")).toBe(true);
    });
  });

  describe("validateExpense", () => {
    it("should accept valid expense data", () => {
      const result = validateExpense({
        description: "Office supplies",
        amount: "150.00",
        expenseMonth: 6,
        expenseYear: 2026,
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject zero or negative amount", () => {
      const result = validateExpense({
        description: "Office supplies",
        amount: "0",
        expenseMonth: 6,
        expenseYear: 2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "amount")).toBe(true);
    });

    it("should reject invalid month", () => {
      const result = validateExpense({
        description: "Office supplies",
        amount: "150.00",
        expenseMonth: 0,
        expenseYear: 2026,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "expenseMonth")).toBe(true);
    });
  });

  describe("sanitizeString", () => {
    it("should trim whitespace", () => {
      const result = sanitizeString("  hello  ");
      expect(result).toBe("hello");
    });

    it("should remove HTML tags", () => {
      const result = sanitizeString("<script>alert('xss')</script>");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
    });

    it("should limit length to 500 characters", () => {
      const longString = "a".repeat(600);
      const result = sanitizeString(longString);
      expect(result.length).toBeLessThanOrEqual(500);
    });
  });

  describe("sanitizeNumber", () => {
    it("should parse valid numbers", () => {
      expect(sanitizeNumber("123")).toBe(123);
      expect(sanitizeNumber("123.45")).toBe(123.45);
      expect(sanitizeNumber("-50")).toBe(-50);
    });

    it("should return null for invalid numbers", () => {
      expect(sanitizeNumber("abc")).toBeNull();
      expect(sanitizeNumber("")).toBeNull();
      expect(sanitizeNumber(null)).toBeNull();
    });
  });

  describe("validateDateRange", () => {
    it("should accept valid date range", () => {
      const now = Date.now();
      const result = validateDateRange(now - 1000000, now);
      expect(result.isValid).toBe(true);
    });

    it("should reject start date after end date", () => {
      const now = Date.now();
      const result = validateDateRange(now, now - 1000000);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "dateRange")).toBe(true);
    });

    it("should reject future start date", () => {
      const now = Date.now();
      const result = validateDateRange(now + 1000000, now + 2000000);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "startDate")).toBe(true);
    });
  });
});
