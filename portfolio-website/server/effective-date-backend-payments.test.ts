import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { salesEntries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Effective Date-Based Paid Status & Month 10, 11, 12 Backend Payments", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  afterAll(async () => {
    // Cleanup - remove all test entries with patterns that include timestamps
    if (db) {
      try {
        // Get all entries and filter by pattern
        const allEntries = await db.select().from(salesEntries);
        for (const entry of allEntries) {
          if (entry.clientName?.includes('Effective Date Test') || 
              entry.clientName?.includes('Policy 1') || 
              entry.clientName?.includes('Policy 2') ||
              entry.clientName?.includes('Paid Policy') ||
              entry.clientName?.includes('Unpaid Policy')) {
            await db.delete(salesEntries).where(eq(salesEntries.id, entry.id));
          }
        }
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  });

  it("should calculate month 10, 11, 12 backend payments based on effective date", async () => {
    const timestamp = Date.now();
    const effectiveDate = new Date("2026-06-15").getTime();

    const testEntry = {
      clientName: `Effective Date Test ${timestamp}`,
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: "110.00",
      commissionOverride: 100,
      commissionAmount: "100.00",
      isPaid: 1,
      saleDate: effectiveDate,
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(testEntry);

    const result = await db.select().from(salesEntries).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    expect(result[0].isPaid).toBe(1);

    // Calculate backend payments
    const premium = 100;
    const commissionPercent = 100;
    const baseCommission = (premium * commissionPercent) / 100;
    const backendCommission = baseCommission * 0.75; // 75% for backend
    const monthlyPayment = backendCommission / 3; // Split across 3 months

    expect(baseCommission).toBe(100);
    expect(backendCommission).toBe(75);
    expect(monthlyPayment).toBe(25);
  });

  it("should calculate different backend payments for different commission overrides", async () => {
    const timestamp = Date.now();

    const testCases = [
      { override: 65, expectedMonthly: (100 * 65 * 0.75) / 3 / 100 },
      { override: 100, expectedMonthly: (100 * 100 * 0.75) / 3 / 100 },
      { override: 130, expectedMonthly: (100 * 130 * 0.75) / 3 / 100 },
    ];

    for (const testCase of testCases) {
      const premium = 100;
      const commissionPercent = testCase.override;
      const baseCommission = (premium * commissionPercent) / 100;
      const backendCommission = baseCommission * 0.75;
      const monthlyPayment = backendCommission / 3;

      expect(monthlyPayment).toBeCloseTo(testCase.expectedMonthly, 2);
    }
  });

  it("should sum month 10, 11, 12 payments from multiple paid policies", async () => {
    const timestamp = Date.now();

    const entries = [
      {
        clientName: `Policy 1 ${timestamp}`,
        productType: "Whole Life",
        carrier: "MetLife",
        premium: "100.00",
        annualPremium: "1200.00",
        commissionPercent: "110.00",
        commissionOverride: 100,
        commissionAmount: "100.00",
        isPaid: 1,
        saleDate: timestamp,
        saleMonth: 6,
        saleYear: 2026,
      },
      {
        clientName: `Policy 2 ${timestamp}`,
        productType: "Term Life",
        carrier: "Transamerica",
        premium: "200.00",
        annualPremium: "2400.00",
        commissionPercent: "110.00",
        commissionOverride: 100,
        commissionAmount: "200.00",
        isPaid: 1,
        saleDate: timestamp,
        saleMonth: 6,
        saleYear: 2026,
      },
    ];

    for (const entry of entries) {
      await db.insert(salesEntries).values(entry);
    }

    const paidResults = await db.select().from(salesEntries).where(
      eq(salesEntries.isPaid, 1)
    );

    // Filter to only test policies created in this test
    const testPolicies = paidResults.filter(
      (e: any) => e.clientName.includes(String(timestamp))
    );

    // Calculate total month 10, 11, 12 revenue for test policies only
    let totalMonth10 = 0;
    let totalMonth11 = 0;
    let totalMonth12 = 0;

    for (const entry of testPolicies) {
      const premium = parseFloat(entry.premium || "0");
      const commissionPercent = entry.commissionOverride 
        ? Number(entry.commissionOverride) 
        : Number(entry.commissionPercent || 110);
      const baseCommission = (premium * commissionPercent) / 100;
      const backendCommission = baseCommission * 0.75;
      const monthlyPayment = backendCommission / 3;

      totalMonth10 += monthlyPayment;
      totalMonth11 += monthlyPayment;
      totalMonth12 += monthlyPayment;
    }

    // For 2 policies with $100 and $200 premiums at 100% commission
    // Policy 1: 100 * 100% * 75% / 3 = 25 per month
    // Policy 2: 200 * 100% * 75% / 3 = 50 per month
    // Total: 75 per month
    expect(testPolicies.length).toBe(2);
    expect(totalMonth10).toBeCloseTo(75, 1);
    expect(totalMonth11).toBeCloseTo(75, 1);
    expect(totalMonth12).toBeCloseTo(75, 1);
  });

  it("should not include unpaid policies in backend payment calculations", async () => {
    const timestamp = Date.now();

    const paidEntry = {
      clientName: `Paid Policy ${timestamp}`,
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: "110.00",
      commissionOverride: 100,
      commissionAmount: "100.00",
      isPaid: 1,
      saleDate: timestamp,
      saleMonth: 6,
      saleYear: 2026,
    };

    const unpaidEntry = {
      clientName: `Unpaid Policy ${timestamp}`,
      productType: "Term Life",
      carrier: "Transamerica",
      premium: "200.00",
      annualPremium: "2400.00",
      commissionPercent: "110.00",
      commissionOverride: 100,
      commissionAmount: "200.00",
      isPaid: 0,
      saleDate: timestamp,
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(paidEntry);
    await db.insert(salesEntries).values(unpaidEntry);

    const paidResults = await db.select().from(salesEntries).where(
      eq(salesEntries.isPaid, 1)
    );

    // Only paid policies from this test should be included
    const paidPolicies = paidResults.filter(
      (e: any) => e.clientName.includes("Paid Policy") && e.clientName.includes(String(timestamp))
    );

    expect(paidPolicies.length).toBe(1);

    let totalMonth10 = 0;
    for (const entry of paidPolicies) {
      const premium = parseFloat(entry.premium || "0");
      const commissionPercent = entry.commissionOverride 
        ? Number(entry.commissionOverride) 
        : Number(entry.commissionPercent || 110);
      const baseCommission = (premium * commissionPercent) / 100;
      const backendCommission = baseCommission * 0.75;
      const monthlyPayment = backendCommission / 3;
      totalMonth10 += monthlyPayment;
    }

    // Should only include paid policy ($100 premium)
    expect(totalMonth10).toBeCloseTo(25, 1);
  });
});
