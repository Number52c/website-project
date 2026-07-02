/**
 * Tests for the agent session system (DB-backed).
 * Sessions now persist in the database so agents stay logged in across server restarts.
 */
import { describe, it, expect } from "vitest";
import {
  recordSessionActivity,
  isSessionValid,
  hasSession,
  clearSession,
  getSessionTimeRemaining,
} from "./sessionActivity";

const TEST_AGENT_ID = 99999;

describe("Agent session (DB-backed)", () => {
  it("recordSessionActivity should not throw even if DB is unavailable", () => {
    // Fire-and-forget — should never throw
    expect(() => recordSessionActivity(TEST_AGENT_ID)).not.toThrow();
  });

  it("isSessionValid fails open (returns true) when DB is unavailable in test env", async () => {
    // In test environment, DB may not be available.
    // The new implementation fails open so agents are never locked out due to DB issues.
    const result = await isSessionValid(TEST_AGENT_ID);
    expect(typeof result).toBe("boolean");
    // Should be true (fail open) when DB is unavailable
    expect(result).toBe(true);
  });

  it("hasSession returns a boolean without throwing", async () => {
    const result = await hasSession(TEST_AGENT_ID);
    expect(typeof result).toBe("boolean");
  });

  it("clearSession should not throw", () => {
    expect(() => clearSession(TEST_AGENT_ID)).not.toThrow();
  });

  it("getSessionTimeRemaining returns a non-negative number", async () => {
    const remaining = await getSessionTimeRemaining(TEST_AGENT_ID);
    expect(typeof remaining).toBe("number");
    expect(remaining).toBeGreaterThanOrEqual(0);
  });
});
