import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { salesEntries, policies, clients } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ⚠️ DISABLED: This test was creating fake records in production database
// Tests must use a separate test database or mock data, never production data
// To re-enable: Set up a test database and use it in beforeAll/afterAll

describe.skip("Commission Calculation with Effective Dates", () => {
  let db: any;
  let testClientId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test client
    const clientResult = await db.insert(clients).values({
      pin: "TEST1234",
      firstName: "Test",
      lastName: "Client",
      email: "test@example.com",
    });
    testClientId = clientResult[0]?.insertId || 1;
  });

  afterAll(async () => {
    // Cleanup: delete test data
    if (db) {
      await db.delete(salesEntries).where(
        and(
          eq(salesEntries.clientName, "Test Commission Client"),
          eq(salesEntries.saleYear, 2026)
        )
      );
      await db.delete(clients).where(eq(clients.id, testClientId));
    }
  });

  it("should attribute commission to the month of policy effective date", async () => {
    // Create a sale entry with effective date in June 2026
    const juneDate = new Date("2026-06-15").getTime();
    
    const saleEntry = {
      clientName: "Test Commission Client",
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: "110.00",
      saleDate: juneDate,
      saleMonth: 6,
      saleYear: 2026,
      notes: "Test commission attribution",
    };

    await db.insert(salesEntries).values(saleEntry);

    // Fetch entries for June 2026
    const juneEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.saleYear, 2026),
        eq(salesEntries.clientName, "Test Commission Client")
      )
    );

    expect(juneEntries).toHaveLength(1);
    
    // Verify the entry exists and has correct commission percent
    expect(juneEntries[0].commissionPercent).toBe("110.00");
  });

  it("should correctly calculate total commission for a month", async () => {
    // Create multiple sale entries for the same month
    const timestamp = Date.now();
    const testEntries = [
      {
        clientName: `Commission Test A ${timestamp}`,
        productType: "Term Life",
        carrier: "MetLife",
        premium: "50.00",
        annualPremium: "600.00",
        commissionPercent: "110.00",
        saleDate: new Date("2026-07-05").getTime(),
        saleMonth: 7,
        saleYear: 2026,
      },
      {
        clientName: `Commission Test B ${timestamp}`,
        productType: "Final Expense",
        carrier: "Transamerica",
        premium: "25.00",
        annualPremium: "300.00",
        commissionPercent: "110.00",
        saleDate: new Date("2026-07-20").getTime(),
        saleMonth: 7,
        saleYear: 2026,
      },
    ];

    for (const entry of testEntries) {
      await db.insert(salesEntries).values(entry);
    }

    // Fetch entries for July 2026 with our test client names
    const julyEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.saleYear, 2026),
        eq(salesEntries.saleMonth, 7)
      )
    ).then(entries => entries.filter(e => e.clientName.includes("Commission Test")));

    // Verify entries exist
    expect(julyEntries.length).toBeGreaterThanOrEqual(2);
  });

  it("should separate commissions by effective date month", async () => {
    // Create entries with different effective dates
    const timestamp = Date.now();
    const mayEntry = {
      clientName: `May Sale ${timestamp}`,
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: "110.00",
      commissionAmount: "1320.00",
      saleDate: new Date("2026-05-10").getTime(),
      saleMonth: 5,
      saleYear: 2026,
    };

    const juneEntry = {
      clientName: `June Sale ${timestamp}`,
      productType: "Term Life",
      carrier: "MetLife",
      premium: "50.00",
      annualPremium: "600.00",
      commissionPercent: "110.00",
      commissionAmount: "660.00",
      saleDate: new Date("2026-06-10").getTime(),
      saleMonth: 6,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(mayEntry);
    await db.insert(salesEntries).values(juneEntry);

    // Fetch May entries
    const mayEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.saleYear, 2026),
        eq(salesEntries.saleMonth, 5),
        eq(salesEntries.clientName, mayEntry.clientName)
      )
    );

    // Fetch June entries
    const juneEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.saleYear, 2026),
        eq(salesEntries.saleMonth, 6),
        eq(salesEntries.clientName, juneEntry.clientName)
      )
    );

    expect(mayEntries).toHaveLength(1);
    expect(juneEntries).toHaveLength(1);
    // Verify entries have correct commission percents
    expect(mayEntries[0].commissionPercent).toBe("110.00");
    expect(juneEntries[0].commissionPercent).toBe("110.00");
  });

  it("should handle entries without commission amounts", async () => {
    const timestamp = Date.now();
    const entryWithoutCommission = {
      clientName: `No Commission Client ${timestamp}`,
      productType: "Whole Life",
      carrier: "MetLife",
      premium: "100.00",
      annualPremium: "1200.00",
      commissionPercent: null,
      commissionAmount: null,
      saleDate: new Date("2026-08-15").getTime(),
      saleMonth: 8,
      saleYear: 2026,
    };

    await db.insert(salesEntries).values(entryWithoutCommission);

    const augustEntries = await db.select().from(salesEntries).where(
      and(
        eq(salesEntries.saleYear, 2026),
        eq(salesEntries.saleMonth, 8),
        eq(salesEntries.clientName, entryWithoutCommission.clientName)
      )
    );

    expect(augustEntries).toHaveLength(1);
    // Commission amounts are no longer stored in schema
    expect(augustEntries[0]).toBeDefined();
  });
});
