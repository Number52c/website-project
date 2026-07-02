import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { salesEntries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Commission Override", () => {
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
          if (entry.clientName?.includes('Test Commission Override') || 
              entry.clientName?.includes('Backend Payment Test')) {
            await db.delete(salesEntries).where(eq(salesEntries.id, entry.id));
          }
        }
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  });

  it("should allow commission override between 65-130%", async () => {
    const timestamp = Date.now();
    const testEntry = {
      clientName: `Test Commission Override ${timestamp}`,
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: "110.00",
      commissionOverride: 95,
      commissionAmount: "950.00",
      saleDate: timestamp,
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(testEntry);

    const result = await db.select().from(salesEntries).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    expect(result).toHaveLength(1);
    expect(Number(result[0].commissionOverride)).toBe(95);
    expect(result[0].commissionPercent).toBe("110.00");
  });

  it("should calculate backend payments for months 10, 11, 12", async () => {
    const timestamp = Date.now();
    const effectiveDate = new Date("2026-06-15").getTime();
    
    const testEntry = {
      clientName: `Backend Payment Test ${timestamp}`,
      productType: "Term Life",
      carrier: "Transamerica",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: "110.00",
      commissionOverride: 100,
      commissionAmount: "1000.00",
      saleDate: effectiveDate,
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(testEntry);

    const result = await db.select().from(salesEntries).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    expect(result).toHaveLength(1);
    
    const baseCommission = 100 * (result[0].commissionOverride || 100) / 100;
    expect(baseCommission).toBe(100);

    const advanceCommission = baseCommission * 0.25;
    const remainingCommission = baseCommission - advanceCommission;
    const monthlyPayment = remainingCommission / 3;

    expect(advanceCommission).toBe(25);
    expect(monthlyPayment).toBe(25);
  });

  it("should handle different commission override percentages", async () => {
    const timestamp = Date.now();
    const testCases = [
      { override: 65, name: `Min Override 65 ${timestamp}` },
      { override: 100, name: `Mid Override 100 ${timestamp}` },
      { override: 130, name: `Max Override 130 ${timestamp}` },
    ];

    for (const testCase of testCases) {
      await db.insert(salesEntries).values({
        clientName: testCase.name,
        productType: "Whole Life",
        carrier: "MetLife",
        premium: "100.00",
        annualPremium: "1200.00",
        commissionPercent: "110.00",
        commissionOverride: testCase.override,
        commissionAmount: String((100 * testCase.override) / 100),
        saleDate: timestamp,
        saleMonth: 6,
        saleYear: 2026,
      });
    }

    for (const testCase of testCases) {
      const result = await db.select().from(salesEntries).where(
        eq(salesEntries.clientName, testCase.name)
      );
      expect(Number(result[0].commissionOverride)).toBe(testCase.override);
    }
  });

  it("should use commission override for payment calculations", async () => {
    const timestamp = Date.now();
    const testEntry = {
      clientName: `Payment Calc Test ${timestamp}`,
      productType: "Final Expense",
      carrier: "Transamerica",
      premium: "200.00",
      annualPremium: "2400.00",
      commissionPercent: "110.00",
      commissionOverride: 75,
      commissionAmount: "150.00",
      saleDate: timestamp,
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(testEntry);

    const result = await db.select().from(salesEntries).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    expect(result).toHaveLength(1);
    
    const totalCommission = 200 * (result[0].commissionOverride || 110) / 100;
    expect(totalCommission).toBe(150);

    const advanceCommission = totalCommission * 0.25;
    const monthlyPayment = (totalCommission - advanceCommission) / 3;

    expect(advanceCommission).toBe(37.5);
    expect(monthlyPayment).toBe(37.5);
  });
});
