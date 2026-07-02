/**
 * Vitest tests for metrics calculations
 * Tests the Standard By-Policy-Count persistence rate formula:
 *   Rate = (Policies from Jan 1 starting block still active) / (Jan 1 starting block) × 100
 *
 * Key rule: 2026 returns null because no policies existed before Jan 1, 2026.
 */

import { describe, it, expect } from "vitest";

// ── Persistence Rate Formula Logic ────────────────────────────────────────────

/**
 * Simulate the Jan 1 starting block persistence formula.
 * This mirrors the logic in server/metrics.ts calculatePersistenceRate().
 *
 * Starting block = life policies where wasEverActive=1 AND inForceDate <= Jan 1 AND
 *                  (cancelDate IS NULL OR cancelDate > Jan 1)
 * Numerator      = starting block policies still active today
 */
function simulatePersistenceRate(
  policies: {
    id: number;
    type: string;
    status: string;
    wasEverActive: number;
    inForceDate: number | null;
    cancelDate: number | null;
  }[],
  jan1: Date
): { rate: number | null; startingBlock: number; stillActive: number } {
  const jan1Ms = jan1.getTime();

  const isLifeType = (t: string | null): boolean => {
    if (!t) return false;
    const lower = t.toLowerCase();
    if (lower.includes("fia") || lower.includes("myga") || lower.includes("annuity")) return false;
    return lower.includes("life") || lower.includes("term") || lower.includes("final expense") || lower.includes("whole");
  };

  // Build starting block: life policies in-force as of Jan 1
  const startingBlockPolicies = policies.filter(p =>
    isLifeType(p.type) &&
    p.wasEverActive === 1 &&
    p.inForceDate !== null &&
    p.inForceDate <= jan1Ms &&
    (p.cancelDate === null || p.cancelDate > jan1Ms)
  );

  if (startingBlockPolicies.length === 0) {
    return { rate: null, startingBlock: 0, stillActive: 0 };
  }

  const stillActive = startingBlockPolicies.filter(p => p.status === "active").length;
  const rate = Math.round((stillActive / startingBlockPolicies.length) * 10000) / 100;
  return { rate, startingBlock: startingBlockPolicies.length, stillActive };
}

// Helper: create a date in milliseconds
const ms = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();

describe("Persistence Rate — Standard By-Policy-Count Formula", () => {
  const JAN1_2027 = new Date(2027, 0, 1);
  const JAN1_2026 = new Date(2026, 0, 1);

  it("returns null when no policies existed before Jan 1 (2026 scenario)", () => {
    // All policies created in 2026 — inForceDate > Jan 1, 2026
    const policies = [
      { id: 1, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 2, type: "term_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 5, 1), cancelDate: null },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2026);
    expect(result.rate).toBeNull();
    expect(result.startingBlock).toBe(0);
  });

  it("returns 90% for the textbook example: 900 active out of 1000 starting block", () => {
    const policies = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      type: "whole_life",
      status: i < 900 ? "active" : "cancelled",
      wasEverActive: 1,
      inForceDate: ms(2026, 6, 1), // in-force before Jan 1, 2027
      cancelDate: i < 900 ? null : ms(2026, 9, 1), // cancelled in Sept 2026 (before Jan 1, 2027 but after in-force)
    }));
    // Note: cancelDate must be > Jan 1, 2027 to be included in starting block
    // For this test, cancelled policies have cancelDate in 2026 → excluded from starting block
    // So starting block = 900 active only → 100%
    // Let's fix: cancelled policies should still be in starting block (they lapsed DURING the year)
    // cancelDate > Jan 1, 2027 means they were still active on Jan 1, 2027
    // For the 900/1000 example, all 1000 were active on Jan 1 and 100 lapsed during the year
    const policies2 = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      type: "whole_life",
      status: i < 900 ? "active" : "cancelled",
      wasEverActive: 1,
      inForceDate: ms(2026, 6, 1), // in-force before Jan 1, 2027
      cancelDate: i < 900 ? null : ms(2027, 6, 1), // lapsed in June 2027 (after Jan 1, 2027)
    }));
    const result = simulatePersistenceRate(policies2, JAN1_2027);
    expect(result.rate).toBe(90);
    expect(result.startingBlock).toBe(1000);
    expect(result.stillActive).toBe(900);
  });

  it("returns 100% when all starting-block policies are still active", () => {
    const policies = [
      { id: 1, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 2, type: "term_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 5, 1), cancelDate: null },
      { id: 3, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 8, 1), cancelDate: null },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.rate).toBe(100);
    expect(result.startingBlock).toBe(3);
    expect(result.stillActive).toBe(3);
  });

  it("excludes annuities from persistence calculation", () => {
    const policies = [
      { id: 1, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 2, type: "FIA", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 3, type: "MYGA", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 4, type: "term_life", status: "cancelled", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: ms(2027, 3, 1) },
    ];
    // Starting block: only life policies (id 1 and 4) → 2 policies
    // Still active: only id 1 → 50%
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.rate).toBe(50);
    expect(result.startingBlock).toBe(2);
    expect(result.stillActive).toBe(1);
  });

  it("excludes policies that were never active (wasEverActive=0)", () => {
    const policies = [
      { id: 1, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 2, type: "whole_life", status: "pending", wasEverActive: 0, inForceDate: null, cancelDate: null },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.startingBlock).toBe(1);
    expect(result.rate).toBe(100);
  });

  it("excludes policies that lapsed before Jan 1 (cancelled before starting block date)", () => {
    const policies = [
      { id: 1, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      // This policy was cancelled in 2025 — before Jan 1, 2027 starting block
      { id: 2, type: "whole_life", status: "cancelled", wasEverActive: 1, inForceDate: ms(2025, 3, 1), cancelDate: ms(2025, 9, 1) },
    ];
    // id 2 has cancelDate (Sept 2025) < Jan 1, 2027 → excluded from starting block
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.startingBlock).toBe(1);
    expect(result.rate).toBe(100);
  });

  it("returns null when starting block contains only annuities", () => {
    const policies = [
      { id: 1, type: "FIA", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 2, type: "MYGA", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.rate).toBeNull();
    expect(result.startingBlock).toBe(0);
  });

  it("returns 0% when all starting-block life policies have lapsed", () => {
    const policies = [
      { id: 1, type: "whole_life", status: "cancelled", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: ms(2027, 3, 1) },
      { id: 2, type: "term_life", status: "cancelled", wasEverActive: 1, inForceDate: ms(2026, 5, 1), cancelDate: ms(2027, 5, 1) },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.rate).toBe(0);
    expect(result.startingBlock).toBe(2);
    expect(result.stillActive).toBe(0);
  });

  it("rounds to 2 decimal places (2/3 = 66.67%)", () => {
    const policies = [
      { id: 1, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      { id: 2, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 4, 1), cancelDate: null },
      { id: 3, type: "whole_life", status: "cancelled", wasEverActive: 1, inForceDate: ms(2026, 5, 1), cancelDate: ms(2027, 5, 1) },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.rate).toBe(66.67);
  });

  it("handles single policy starting block", () => {
    const policies = [
      { id: 1, type: "term_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.rate).toBe(100);
    expect(result.startingBlock).toBe(1);
  });

  it("excludes policies with inForceDate after Jan 1 (new business — not in starting block)", () => {
    const policies = [
      { id: 1, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2026, 3, 1), cancelDate: null },
      // New business placed in Feb 2027 — after Jan 1, 2027 → not in starting block
      { id: 2, type: "whole_life", status: "active", wasEverActive: 1, inForceDate: ms(2027, 2, 1), cancelDate: null },
    ];
    const result = simulatePersistenceRate(policies, JAN1_2027);
    expect(result.startingBlock).toBe(1);
    expect(result.rate).toBe(100);
  });
});

// ── Commission Calculation ────────────────────────────────────────────────────

describe("Commission Calculation Logic", () => {
  it("calculates 50% commission on $1000 premium", () => {
    const premium = 1000;
    const commissionPercent = 50;
    const commission = (premium * commissionPercent) / 100;
    expect(commission).toBe(500);
  });

  it("calculates 65% commission on $12000 annual premium", () => {
    const premium = 12000;
    const commissionPercent = 65;
    const commission = (premium * commissionPercent) / 100;
    expect(commission).toBe(7800);
  });

  it("handles commission override", () => {
    const premium = 1000;
    const commissionPercent = 50;
    const commissionOverride = 75;
    const commission = (premium * (commissionOverride || commissionPercent)) / 100;
    expect(commission).toBe(750);
  });

  it("handles zero commission", () => {
    const premium = 1000;
    const commissionPercent = 0;
    const commission = (premium * commissionPercent) / 100;
    expect(commission).toBe(0);
  });
});

// ── Revenue Calculation ───────────────────────────────────────────────────────

describe("Revenue Calculation Logic", () => {
  it("calculates net revenue correctly", () => {
    const totalCommission = 5000;
    const totalExpenses = 1200;
    const netRevenue = totalCommission - totalExpenses;
    expect(netRevenue).toBe(3800);
  });

  it("handles negative net revenue", () => {
    const totalCommission = 500;
    const totalExpenses = 1200;
    const netRevenue = totalCommission - totalExpenses;
    expect(netRevenue).toBe(-700);
  });

  it("calculates YTD revenue by summing monthly values", () => {
    const monthlyCommissions = [1000, 1500, 2000, 1800];
    const ytdRevenue = monthlyCommissions.reduce((sum, c) => sum + c, 0);
    expect(ytdRevenue).toBe(6300);
  });
});
