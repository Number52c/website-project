import { describe, it, expect, beforeEach } from "vitest";
import { hashPin, verifyPin } from "./pin";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "./rateLimiter";
import { recordSessionActivity, isSessionValid, clearSession, getSessionTimeRemaining } from "./sessionActivity";
import { generateCsrfToken, verifyCsrfToken } from "./csrf";
import {
  maskSSN,
  maskAccountNumber,
  maskRoutingNumber,
  maskEmail,
  maskPhone,
  maskCardNumber,
  maskDOB,
  maskGeneric,
  maskClientSensitiveFields,
  maskPolicySensitiveFields,
} from "./fieldMasking";

describe("Security Fixes", () => {
  describe("PIN Hashing", () => {
    it("should hash a PIN", async () => {
      const pin = "1234";
      const hashed = await hashPin(pin);
      expect(hashed).not.toBe(pin);
      expect(hashed.length).toBeGreaterThan(10);
    });

    it("should verify a correct PIN", async () => {
      const pin = "5678";
      const hashed = await hashPin(pin);
      const isValid = await verifyPin(pin, hashed);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect PIN", async () => {
      const pin = "1234";
      const hashed = await hashPin(pin);
      const isValid = await verifyPin("9999", hashed);
      expect(isValid).toBe(false);
    });

    it("should generate different hashes for the same PIN", async () => {
      const pin = "1234";
      const hash1 = await hashPin(pin);
      const hash2 = await hashPin(pin);
      expect(hash1).not.toBe(hash2);
      expect(await verifyPin(pin, hash1)).toBe(true);
      expect(await verifyPin(pin, hash2)).toBe(true);
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(() => {
      clearRateLimit("test-ip");
    });

    it("should allow first login attempt", () => {
      const result = checkRateLimit("test-ip");
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it("should track failed attempts", () => {
      recordFailedAttempt("test-ip");
      const result = checkRateLimit("test-ip");
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4);
    });

    it("should lock out after 5 failed attempts", () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt("test-ip");
      }
      const result = checkRateLimit("test-ip");
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockedUntil).toBeDefined();
    });

    it("should clear rate limit on successful login", () => {
      recordFailedAttempt("test-ip");
      clearRateLimit("test-ip");
      const result = checkRateLimit("test-ip");
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });
  });

  describe("Session Activity Tracking", () => {
    it("should record session activity without throwing", () => {
      // Fire-and-forget — should never throw
      expect(() => recordSessionActivity(1)).not.toThrow();
    });

    it("isSessionValid should return a boolean (fails open when DB unavailable)", async () => {
      const result = await isSessionValid(1);
      expect(typeof result).toBe("boolean");
    });

    it("should return remaining session time as a number", async () => {
      recordSessionActivity(1);
      const remaining = await getSessionTimeRemaining(1);
      expect(typeof remaining).toBe("number");
      expect(remaining).toBeGreaterThanOrEqual(0);
    });

    it("clearSession should not throw", () => {
      expect(() => clearSession(1)).not.toThrow();
    });
  });

  describe("CSRF Token Generation and Verification", () => {
    it("should generate a CSRF token", async () => {
      const token = await generateCsrfToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should verify a valid CSRF token", async () => {
      const token = await generateCsrfToken();
      const isValid = await verifyCsrfToken(token);
      expect(isValid).toBe(true);
    });

    it("should reject an invalid CSRF token", async () => {
      const isValid = await verifyCsrfToken("invalid-token");
      expect(isValid).toBe(false);
    });

    it("should generate different tokens", async () => {
      const token1 = await generateCsrfToken();
      const token2 = await generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("Sensitive Field Masking", () => {
    it("should mask SSN", () => {
      expect(maskSSN("123456789")).toBe("***-**-6789");
      expect(maskSSN("123-45-6789")).toBe("***-**-6789");
    });

    it("should mask account number", () => {
      expect(maskAccountNumber("123456789")).toBe("****6789");
    });

    it("should mask routing number", () => {
      expect(maskRoutingNumber("021000021")).toBe("****0021");
    });

    it("should mask email", () => {
      const masked = maskEmail("john.doe@example.com");
      expect(masked).toBe("j***@example.com");
    });

    it("should mask phone number", () => {
      const masked = maskPhone("5551234567");
      expect(masked).toMatch(/\(555\) \*\*\*-4567/);
    });

    it("should mask card number", () => {
      expect(maskCardNumber("4532123456789010")).toBe("****-****-****-9010");
    });

    it("should mask date of birth", () => {
      const masked = maskDOB("01/15/1985");
      expect(masked).toMatch(/\*\*\*\*\/\*\*\/\d{4}/);
    });

    it("should mask generic values", () => {
      expect(maskGeneric("ABC123DEF456", 4)).toBe("********F456");
    });

    it("should handle null/undefined values", () => {
      expect(maskSSN(null)).toBe(null);
      expect(maskSSN(undefined)).toBe(undefined);
      expect(maskEmail(null)).toBe(null);
    });

    it("should mask client sensitive fields", () => {
      const client = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        ssn: "123456789",
        email: "john@example.com",
        phone: "5551234567",
      };
      const masked = maskClientSensitiveFields(client);
      expect(masked.ssn).toBe("***-**-6789");
      expect(masked.email).toBe("j***@example.com");
      expect(masked.phone).toMatch(/\(555\) \*\*\*-4567/);
      expect(masked.firstName).toBe("John");
    });

    it("should mask policy sensitive fields", () => {
      const policy = {
        id: 1,
        policyNumber: "ABC123DEF456",
        contractNumber: "XYZ789ABC123",
        carrier: "Carrier Name",
      };
      const masked = maskPolicySensitiveFields(policy);
      expect(masked.policyNumber).toBe("********F456");
      expect(masked.contractNumber).toBe("********C123");
      expect(masked.carrier).toBe("Carrier Name");
    });
  });
});
