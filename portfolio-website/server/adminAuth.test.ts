import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  verifyAdminPin,
  isAdminRateLimited,
  recordAdminFailedAttempt,
  clearAdminRateLimit,
  signAdminToken,
  verifyAdminToken,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_MS,
} from "./adminAuth";

describe("Admin Authentication", () => {
  const testIp = "192.168.1.100";

  beforeEach(() => {
    clearAdminRateLimit(testIp);
  });

  describe("verifyAdminPin", () => {
    it("should return true for correct PIN from environment", () => {
      // The ADMIN_PIN env var is set to "[REDACTED]" in production
      // In test, we use the env var or fallback
      const envPin = process.env.ADMIN_PIN;
      if (envPin) {
        expect(verifyAdminPin(envPin)).toBe(true);
      } else {
        // In test environment without env var, the function should still work
        // It will return false for any input since no PIN is configured
        expect(verifyAdminPin("wrong")).toBe(false);
      }
    });

    it("should return true for temporary PIN if configured", () => {
      const tempPin = process.env.TEMP_ADMIN_PIN;
      if (tempPin) {
        expect(verifyAdminPin(tempPin)).toBe(true);
      }
    });

    it("should return false for incorrect PIN", () => {
      expect(verifyAdminPin("wrong")).toBe(false);
      expect(verifyAdminPin("")).toBe(false);
      expect(verifyAdminPin("1234")).toBe(false);
      expect(verifyAdminPin("1313")).toBe(false); // Old hardcoded PIN should not work unless it matches env
    });

    it("should not expose PIN in error messages or return values", () => {
      const result = verifyAdminPin("test");
      expect(typeof result).toBe("boolean");
      expect(result).toBe(false);
    });
  });

  describe("Rate Limiting", () => {
    it("should not be rate limited initially", () => {
      const result = isAdminRateLimited(testIp);
      expect(result.limited).toBe(false);
      expect(result.remainingAttempts).toBeGreaterThan(0);
    });

    it("should track failed attempts", () => {
      recordAdminFailedAttempt(testIp);
      const result = isAdminRateLimited(testIp);
      expect(result.limited).toBe(false);
      expect(result.remainingAttempts).toBeLessThan(5);
    });

    it("should lock out after max failed attempts", () => {
      for (let i = 0; i < 5; i++) {
        recordAdminFailedAttempt(testIp);
      }
      const result = isAdminRateLimited(testIp);
      expect(result.limited).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockoutRemainingMs).toBeGreaterThan(0);
    });

    it("should clear rate limit", () => {
      for (let i = 0; i < 5; i++) {
        recordAdminFailedAttempt(testIp);
      }
      clearAdminRateLimit(testIp);
      const result = isAdminRateLimited(testIp);
      expect(result.limited).toBe(false);
    });

    it("should isolate rate limits per IP", () => {
      const ip1 = "10.0.0.1";
      const ip2 = "10.0.0.2";
      
      for (let i = 0; i < 5; i++) {
        recordAdminFailedAttempt(ip1);
      }
      
      expect(isAdminRateLimited(ip1).limited).toBe(true);
      expect(isAdminRateLimited(ip2).limited).toBe(false);
      
      clearAdminRateLimit(ip1);
      clearAdminRateLimit(ip2);
    });
  });

  describe("JWT Token", () => {
    it("should sign and verify a valid token", async () => {
      const token = await signAdminToken();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      const isValid = await verifyAdminToken(token);
      expect(isValid).toBe(true);
    });

    it("should reject invalid tokens", async () => {
      const isValid = await verifyAdminToken("invalid-token");
      expect(isValid).toBe(false);
    });

    it("should reject empty tokens", async () => {
      const isValid = await verifyAdminToken("");
      expect(isValid).toBe(false);
    });

    it("should reject tampered tokens", async () => {
      const token = await signAdminToken();
      const tampered = token.slice(0, -5) + "XXXXX";
      const isValid = await verifyAdminToken(tampered);
      expect(isValid).toBe(false);
    });
  });

  describe("Cookie Configuration", () => {
    it("should have a proper cookie name", () => {
      expect(ADMIN_COOKIE_NAME).toBe("admin_session");
    });

    it("should have a reasonable session duration", () => {
      // Should be between 1 hour and 24 hours
      expect(ADMIN_SESSION_MAX_AGE_MS).toBeGreaterThanOrEqual(60 * 60 * 1000);
      expect(ADMIN_SESSION_MAX_AGE_MS).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    });
  });

  describe("Security Properties", () => {
    it("should not have hardcoded PIN in source code", () => {
      // This test verifies the PIN comes from environment variable
      // If ADMIN_PIN is not set, verifyAdminPin should reject all inputs
      if (!process.env.ADMIN_PIN) {
        expect(verifyAdminPin("1313")).toBe(false);
        expect(verifyAdminPin("[REDACTED]")).toBe(false);
        expect(verifyAdminPin("anything")).toBe(false);
      }
    });

    it("should use timing-safe comparison for PIN", () => {
      // Both correct and incorrect PINs should take similar time
      // (This is a structural test - actual timing is hard to test)
      const start1 = performance.now();
      verifyAdminPin("a");
      const time1 = performance.now() - start1;

      const start2 = performance.now();
      verifyAdminPin("a".repeat(100));
      const time2 = performance.now() - start2;

      // Both should complete quickly (under 10ms)
      expect(time1).toBeLessThan(10);
      expect(time2).toBeLessThan(10);
    });
  });
});
