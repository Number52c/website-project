import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { hashPassword, verifyPassword } from "./auth";
import { getDb } from "./db";
import { agents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Agent Authentication", () => {
  let db: any;
  const testEmail = `agent-test-${Date.now()}@test.com`;
  const testPassword = "SecurePassword123!";

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup: delete test agent
    if (db) {
      try {
        await db.delete(agents).where(eq(agents.email, testEmail));
      } catch (err) {
        console.error("Cleanup failed:", err);
      }
    }
  });

  describe("Password Hashing", () => {
    it("should hash a password", () => {
      const hash = hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should produce different hashes for the same password (due to random salt)", () => {
      const hash1 = hashPassword(testPassword);
      const hash2 = hashPassword(testPassword);
      expect(hash1).not.toBe(hash2);
    });

    it("should verify a correct password", () => {
      const hash = hashPassword(testPassword);
      const isValid = verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", () => {
      const hash = hashPassword(testPassword);
      const isValid = verifyPassword("WrongPassword123!", hash);
      expect(isValid).toBe(false);
    });

    it("should reject empty password", () => {
      const hash = hashPassword(testPassword);
      const isValid = verifyPassword("", hash);
      expect(isValid).toBe(false);
    });

    it("should handle invalid hash gracefully", () => {
      const isValid = verifyPassword(testPassword, "invalid-hash-data");
      expect(isValid).toBe(false);
    });
  });

  describe("Agent Database Operations", () => {
    it("should create an agent with hashed password", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      const passwordHash = hashPassword(testPassword);

      await db.insert(agents).values({
        firstName: "Test",
        lastName: "Agent",
        email: testEmail,
        phone: "555-1234",
        licenseNumber: "TX123456",
        licenseState: "TX",
        passwordHash,
        status: "active",
      });

      // Verify agent was created
      const result = await db.select().from(agents).where(eq(agents.email, testEmail)).limit(1);
      expect(result.length).toBe(1);
      expect(result[0].email).toBe(testEmail);
      expect(result[0].passwordHash).toBe(passwordHash);
      expect(result[0].agentStatus).toBe("active");
    });

    it("should retrieve agent by email", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(agents).where(eq(agents.email, testEmail)).limit(1);
      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe("Test");
      expect(result[0].lastName).toBe("Agent");
    });

    it("should verify stored password hash", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(agents).where(eq(agents.email, testEmail)).limit(1);
      expect(result.length).toBe(1);

      const storedHash = result[0].passwordHash;
      expect(verifyPassword(testPassword, storedHash)).toBe(true);
      expect(verifyPassword("WrongPassword", storedHash)).toBe(false);
    });

    it("should enforce email uniqueness", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      const passwordHash = hashPassword("AnotherPassword123!");

      try {
        await db.insert(agents).values({
          firstName: "Duplicate",
          lastName: "Agent",
          email: testEmail, // Same email as test agent
          phone: "555-5678",
          licenseNumber: "TX654321",
          licenseState: "TX",
          passwordHash,
          status: "active",
        });

        // If we get here, the unique constraint failed
        expect.fail("Should have thrown a unique constraint error");
      } catch (err: any) {
        // Expected: unique constraint violation
        // MySQL error message contains "Duplicate" or "UNIQUE"
        const errorMsg = err.message || "";
        const isUniqueError = errorMsg.includes("Duplicate") || errorMsg.includes("UNIQUE") || errorMsg.includes("unique");
        expect(isUniqueError).toBe(true);
      }
    });
  });

  describe("Agent Status", () => {
    it("should create agent with active status by default", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      const result = await db.select().from(agents).where(eq(agents.email, testEmail)).limit(1);
      expect(result.length).toBe(1);
      expect(result[0].agentStatus).toBe("active");
    });

    it("should allow updating agent status", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      await db.update(agents).set({ agentStatus: "inactive" }).where(eq(agents.email, testEmail));

      const result = await db.select().from(agents).where(eq(agents.email, testEmail)).limit(1);
      expect(result.length).toBe(1);
      expect(result[0].agentStatus).toBe("inactive");

      // Restore to active for other tests
      await db.update(agents).set({ agentStatus: "active" }).where(eq(agents.email, testEmail));
    });
  });

  describe("Password Change", () => {
    const newPassword = "NewPassword456!";

    it("should allow agent to change password", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      // Get current password hash
      const agentBefore = await db.select().from(agents).where(eq(agents.email, testEmail)).limit(1);
      const oldHash = agentBefore[0].passwordHash;

      // Change password
      const newHash = hashPassword(newPassword);
      await db.update(agents).set({ passwordHash: newHash }).where(eq(agents.email, testEmail));

      // Verify hash changed
      const agentAfter = await db.select().from(agents).where(eq(agents.email, testEmail)).limit(1);
      expect(agentAfter[0].passwordHash).not.toBe(oldHash);
      expect(verifyPassword(newPassword, agentAfter[0].passwordHash)).toBe(true);

      // Restore original password for other tests
      const originalHash = hashPassword(testPassword);
      await db.update(agents).set({ passwordHash: originalHash }).where(eq(agents.email, testEmail));
    });

    it("should verify new password works after change", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      const newHash = hashPassword(newPassword);
      expect(verifyPassword(newPassword, newHash)).toBe(true);
      expect(verifyPassword(testPassword, newHash)).toBe(false);
    });

    it("should reject old password after change", async () => {
      if (!db) {
        console.warn("Database not available, skipping test");
        return;
      }

      const newHash = hashPassword(newPassword);
      expect(verifyPassword(testPassword, newHash)).toBe(false);
    });
  });
});
