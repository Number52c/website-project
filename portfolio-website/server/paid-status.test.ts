import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { salesEntries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Paid Status Tracking", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  afterAll(async () => {
    if (db) {
      await db.delete(salesEntries).where(
        eq(salesEntries.clientName, "Test Paid Status Client")
      );
    }
  });

  it("should toggle isPaid status for a policy", async () => {
    const timestamp = Date.now();
    const testEntry = {
      clientName: `Test Paid Status ${timestamp}`,
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: "110.00",
      commissionAmount: "110.00",
      isPaid: 0,
      saleDate: timestamp,
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(testEntry);

    let result = await db.select().from(salesEntries).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    expect(result[0].isPaid).toBe(0);

    // Update to paid
    await db.update(salesEntries).set({ isPaid: 1 }).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    result = await db.select().from(salesEntries).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    expect(result[0].isPaid).toBe(1);
  });

  it("should calculate issued paid premium correctly", async () => {
    const timestamp = Date.now();
    
    // Create paid entry
    const paidEntry = {
      clientName: `Paid Entry ${timestamp}`,
      productType: "Term Life",
      carrier: "Transamerica",
      premium: "200.00",
      annualPremium: "2400.00",
      commissionPercent: "110.00",
      commissionAmount: "220.00",
      isPaid: 1,
      saleDate: timestamp,
      saleMonth: 6,
      saleYear: 2026,
    };

    // Create unpaid entry
    const unpaidEntry = {
      clientName: `Unpaid Entry ${timestamp}`,
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "150.00",
      annualPremium: "1800.00",
      commissionPercent: "110.00",
      commissionAmount: "165.00",
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

    const issuedPaidPremium = paidResults.reduce(
      (sum: number, e: any) => sum + parseFloat(e.premium || "0"),
      0
    );

    expect(issuedPaidPremium).toBeGreaterThanOrEqual(200);
  });

  it("should calculate accurate revenue with expenses", async () => {
    const timestamp = Date.now();
    
    const testEntry = {
      clientName: `Revenue Calc ${timestamp}`,
      productType: "Final Expense",
      carrier: "Transamerica",
      premium: "500.00",
      annualPremium: "6000.00",
      commissionPercent: "110.00",
      commissionAmount: "550.00",
      isPaid: 1,
      saleDate: timestamp,
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(testEntry);

    const result = await db.select().from(salesEntries).where(
      eq(salesEntries.clientName, testEntry.clientName)
    );

    expect(result[0].isPaid).toBe(1);

    const issuedPaidPremium = parseFloat(result[0].premium || "0");
    const totalExpenses = 150; // Example: $150 in expenses
    const accurateRevenue = issuedPaidPremium - totalExpenses;

    expect(accurateRevenue).toBe(350);
  });

  it("should distinguish between issued and paid premiums", async () => {
    const timestamp = Date.now();
    
    const entries = [
      {
        clientName: `Issued Only ${timestamp}`,
        productType: "Whole Life",
        carrier: "MetLife",
        premium: "100.00",
        annualPremium: "1200.00",
        commissionPercent: "110.00",
        commissionAmount: "110.00",
        isPaid: 0,
        saleDate: timestamp,
        saleMonth: 6,
        saleYear: 2026,
      },
      {
        clientName: `Issued and Paid ${timestamp}`,
        productType: "Term Life",
        carrier: "Transamerica",
        premium: "200.00",
        annualPremium: "2400.00",
        commissionPercent: "110.00",
        commissionAmount: "220.00",
        isPaid: 1,
        saleDate: timestamp,
        saleMonth: 6,
        saleYear: 2026,
      },
    ];

    for (const entry of entries) {
      await db.insert(salesEntries).values(entry);
    }

    const allResults = await db.select().from(salesEntries).where(
      eq(salesEntries.saleMonth, 6)
    );

    const totalIssuedPremium = allResults.reduce(
      (sum: number, e: any) => sum + parseFloat(e.premium || "0"),
      0
    );

    const totalPaidPremium = allResults
      .filter((e: any) => e.isPaid === 1)
      .reduce(
        (sum: number, e: any) => sum + parseFloat(e.premium || "0"),
        0
      );

    expect(totalIssuedPremium).toBeGreaterThan(totalPaidPremium);
  });
});
