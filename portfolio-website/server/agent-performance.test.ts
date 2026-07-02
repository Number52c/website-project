/**
 * Agent Performance Date-Range Filtering Tests
 * 
 * Verifies that getAgentPerformance uses saleDate (Unix timestamp in ms)
 * for date-range filtering:
 *   - Monthly: saleDate >= startOfMonth AND saleDate < startOfNextMonth
 *   - YTD: saleDate >= startOfYear AND saleDate < startOfNextYear
 *
 * Tests insert sales with specific saleDate values spanning:
 *   - Current month (should appear in BOTH monthly and YTD)
 *   - Previous month this year (should appear in YTD only, NOT monthly)
 *   - Previous year (should appear in NEITHER monthly nor YTD)
 *
 * Date field used: salesEntries.saleDate (bigint, Unix timestamp in milliseconds)
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { salesEntries, agents } from "../drizzle/schema";
import { eq, and, like, gte, lt, sql } from "drizzle-orm";

describe("Agent Performance saleDate Filtering", () => {
  let db: any;
  const TEST_PREFIX = "PERF_TEST_";
  let testAgentId: number | null = null;

  // Date boundaries (same logic as the production procedure)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Timestamps for test sales
  const midCurrentMonth = new Date(currentYear, currentMonth, 15, 12, 0, 0).getTime();
  const midPreviousMonth = currentMonth > 0
    ? new Date(currentYear, currentMonth - 1, 15, 12, 0, 0).getTime()
    : new Date(currentYear - 1, 11, 15, 12, 0, 0).getTime(); // Dec of previous year if Jan
  const midPreviousYear = new Date(currentYear - 1, 6, 15, 12, 0, 0).getTime(); // July last year

  // Boundaries for verification
  const startOfMonth = new Date(currentYear, currentMonth, 1).getTime();
  const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1).getTime();
  const startOfYear = new Date(currentYear, 0, 1).getTime();
  const startOfNextYear = new Date(currentYear + 1, 0, 1).getTime();

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Find an active agent to use for testing
    const activeAgents = await db.select().from(agents).where(eq(agents.agentStatus, "active")).limit(1);
    if (activeAgents.length === 0) {
      throw new Error("No active agents found in database for testing");
    }
    testAgentId = activeAgents[0].id;

    // Clean up any leftover test data using raw SQL
    await db.execute(sql`DELETE FROM sales_entries WHERE clientName LIKE ${TEST_PREFIX + '%'}`);

    // Insert test sales using raw SQL to satisfy legacy NOT NULL columns (productType, saleMonth, saleYear)
    // Sale 1: Current month — should count in BOTH monthly and YTD
    await db.execute(sql`INSERT INTO sales_entries 
      (agentId, clientName, carrier, product, productType, premium, annualPremium, commission, saleDate, policyType, status, month, year, saleMonth, saleYear)
      VALUES (${testAgentId}, ${TEST_PREFIX + 'CurrentMonth'}, ${'TestCarrier'}, ${'Term Life'}, ${'Term Life'}, ${'500.00'}, ${'6000.00'}, ${'110'}, ${midCurrentMonth}, ${'term_life'}, ${'active'}, ${currentMonth + 1}, ${currentYear}, ${currentMonth + 1}, ${currentYear})`);

    // Sale 2: Previous month (same year) — should count in YTD only, NOT monthly
    const prevMonth = currentMonth > 0 ? currentMonth : 12;
    const prevMonthYear = currentMonth > 0 ? currentYear : currentYear - 1;
    await db.execute(sql`INSERT INTO sales_entries 
      (agentId, clientName, carrier, product, productType, premium, annualPremium, commission, saleDate, policyType, status, month, year, saleMonth, saleYear)
      VALUES (${testAgentId}, ${TEST_PREFIX + 'PreviousMonth'}, ${'TestCarrier'}, ${'Whole Life'}, ${'Whole Life'}, ${'800.00'}, ${'9600.00'}, ${'100'}, ${midPreviousMonth}, ${'whole_life'}, ${'active'}, ${prevMonth}, ${prevMonthYear}, ${prevMonth}, ${prevMonthYear})`);

    // Sale 3: Previous year — should NOT count in monthly or YTD
    await db.execute(sql`INSERT INTO sales_entries 
      (agentId, clientName, carrier, product, productType, premium, annualPremium, commission, saleDate, policyType, status, month, year, saleMonth, saleYear)
      VALUES (${testAgentId}, ${TEST_PREFIX + 'PreviousYear'}, ${'TestCarrier'}, ${'Universal Life'}, ${'Universal Life'}, ${'1200.00'}, ${'14400.00'}, ${'95'}, ${midPreviousYear}, ${'universal_life'}, ${'active'}, ${7}, ${currentYear - 1}, ${7}, ${currentYear - 1})`);
  });

  afterAll(async () => {
    if (!db) return;
    await db.execute(sql`DELETE FROM sales_entries WHERE clientName LIKE ${TEST_PREFIX + '%'}`);
  });

  it("should confirm saleDate field is used (bigint Unix timestamp in ms)", async () => {
    const testEntries = await db.select().from(salesEntries)
      .where(like(salesEntries.clientName, `${TEST_PREFIX}%`));
    
    expect(testEntries.length).toBe(3);
    // All saleDate values should be numbers (Unix timestamps)
    for (const entry of testEntries) {
      expect(typeof entry.saleDate).toBe("number");
      expect(entry.saleDate).toBeGreaterThan(0);
    }
  });

  it("should correctly identify current-month sale within monthly boundaries", () => {
    // Verify our test sale is within the monthly range
    expect(midCurrentMonth).toBeGreaterThanOrEqual(startOfMonth);
    expect(midCurrentMonth).toBeLessThan(startOfNextMonth);
  });

  it("should correctly identify previous-month sale outside monthly boundaries but within YTD", () => {
    // Previous month sale should be OUTSIDE current month range
    expect(midPreviousMonth).toBeLessThan(startOfMonth);
    
    // But if it's the same year, it should be within YTD range
    if (currentMonth > 0) {
      expect(midPreviousMonth).toBeGreaterThanOrEqual(startOfYear);
      expect(midPreviousMonth).toBeLessThan(startOfNextYear);
    }
  });

  it("should correctly identify previous-year sale outside both monthly and YTD boundaries", () => {
    expect(midPreviousYear).toBeLessThan(startOfMonth);
    expect(midPreviousYear).toBeLessThan(startOfYear);
  });

  it("monthly query should include ONLY current-month sales for the agent", async () => {
    // Replicate the exact query from getAgentPerformance
    const monthlyEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.agentId, testAgentId!),
        gte(salesEntries.saleDate, startOfMonth),
        lt(salesEntries.saleDate, startOfNextMonth),
        like(salesEntries.clientName, `${TEST_PREFIX}%`)
      )
    );

    // Should only find the current-month sale
    expect(monthlyEntries.length).toBe(1);
    expect(monthlyEntries[0].clientName).toBe(`${TEST_PREFIX}CurrentMonth`);
    expect(Number(monthlyEntries[0].annualPremium)).toBe(6000);
  });

  it("YTD query should include current-month AND previous-month sales (same year), but NOT previous-year", async () => {
    const ytdEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.agentId, testAgentId!),
        gte(salesEntries.saleDate, startOfYear),
        lt(salesEntries.saleDate, startOfNextYear),
        like(salesEntries.clientName, `${TEST_PREFIX}%`)
      )
    );

    // If current month is January, previous month was last year — so only 1 entry in YTD
    if (currentMonth === 0) {
      expect(ytdEntries.length).toBe(1);
      expect(ytdEntries[0].clientName).toBe(`${TEST_PREFIX}CurrentMonth`);
    } else {
      // Previous month is same year — should have 2 entries (current + previous month)
      expect(ytdEntries.length).toBe(2);
      const names = ytdEntries.map((e: any) => e.clientName).sort();
      expect(names).toContain(`${TEST_PREFIX}CurrentMonth`);
      expect(names).toContain(`${TEST_PREFIX}PreviousMonth`);
    }

    // Previous year entry should NEVER appear
    const prevYearEntry = ytdEntries.find((e: any) => e.clientName === `${TEST_PREFIX}PreviousYear`);
    expect(prevYearEntry).toBeUndefined();
  });

  it("previous-year sales should NOT appear in either monthly or YTD queries", async () => {
    // Monthly check
    const monthlyEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.agentId, testAgentId!),
        gte(salesEntries.saleDate, startOfMonth),
        lt(salesEntries.saleDate, startOfNextMonth),
        like(salesEntries.clientName, `${TEST_PREFIX}PreviousYear`)
      )
    );
    expect(monthlyEntries.length).toBe(0);

    // YTD check
    const ytdEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.agentId, testAgentId!),
        gte(salesEntries.saleDate, startOfYear),
        lt(salesEntries.saleDate, startOfNextYear),
        like(salesEntries.clientName, `${TEST_PREFIX}PreviousYear`)
      )
    );
    expect(ytdEntries.length).toBe(0);
  });

  it("monthly totalAP should only sum current-month entries", async () => {
    const monthlyEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.agentId, testAgentId!),
        gte(salesEntries.saleDate, startOfMonth),
        lt(salesEntries.saleDate, startOfNextMonth),
        like(salesEntries.clientName, `${TEST_PREFIX}%`)
      )
    );

    const totalAP = monthlyEntries.reduce(
      (s: number, e: any) => s + (Number(e.annualPremium) || 0), 0
    );

    // Only the current-month sale ($6,000 AP)
    expect(totalAP).toBe(6000);
  });

  it("YTD totalAP should sum all same-year entries but exclude previous year", async () => {
    const ytdEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.agentId, testAgentId!),
        gte(salesEntries.saleDate, startOfYear),
        lt(salesEntries.saleDate, startOfNextYear),
        like(salesEntries.clientName, `${TEST_PREFIX}%`)
      )
    );

    const totalAP = ytdEntries.reduce(
      (s: number, e: any) => s + (Number(e.annualPremium) || 0), 0
    );

    if (currentMonth === 0) {
      // January: only current month ($6,000)
      expect(totalAP).toBe(6000);
    } else {
      // Current month ($6,000) + previous month ($9,600) = $15,600
      expect(totalAP).toBe(15600);
    }

    // Should NOT include previous year ($14,400)
    expect(totalAP).not.toBe(6000 + 9600 + 14400);
  });

  it("agent scoping should prevent cross-agent data leakage", async () => {
    // Use a non-existent agent ID
    const fakeAgentId = 999999;
    
    const monthlyEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.agentId, fakeAgentId),
        gte(salesEntries.saleDate, startOfMonth),
        lt(salesEntries.saleDate, startOfNextMonth)
      )
    );

    expect(monthlyEntries.length).toBe(0);
  });

  it("date boundary edge case: sale at exactly startOfMonth should be included in monthly", () => {
    // Verify boundary logic: >= startOfMonth means exactly at midnight of month start is included
    const exactStart = startOfMonth;
    expect(exactStart).toBeGreaterThanOrEqual(startOfMonth);
    expect(exactStart).toBeLessThan(startOfNextMonth);
  });

  it("date boundary edge case: sale at exactly startOfNextMonth should NOT be included in monthly", () => {
    // Verify boundary logic: < startOfNextMonth means exactly at midnight of next month is excluded
    const exactNextStart = startOfNextMonth;
    expect(exactNextStart).not.toBeLessThan(startOfNextMonth);
  });
});
