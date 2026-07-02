import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { expenses, agents } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const TEST_AGENT_EMAIL = `expense-test-${Date.now()}@ortizinsurance.local`;

describe("Expense Management", () => {
  let db: any;
  let testAgentId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test agent (expenses require agentId NOT NULL)
    const [existing] = await db.select().from(agents).where(eq(agents.email, TEST_AGENT_EMAIL)).limit(1);
    if (existing) {
      testAgentId = existing.id;
    } else {
      await db.insert(agents).values({
        firstName: "ExpenseTest",
        lastName: "Agent",
        email: TEST_AGENT_EMAIL,
        passwordHash: "testhash",
        status: "active",
      });
      const [created] = await db.select().from(agents).where(eq(agents.email, TEST_AGENT_EMAIL)).limit(1);
      testAgentId = created.id;
    }
  });

  afterAll(async () => {
    // Cleanup: delete test expenses
    if (db) {
      await db.delete(expenses).where(eq(expenses.agentId, testAgentId));
      await db.delete(agents).where(eq(agents.email, TEST_AGENT_EMAIL));
    }
  });

  it("should create an expense record", async () => {
    await db.insert(expenses).values({
      agentId: testAgentId,
      month: 6,
      year: 2026,
      category: "cell_phone",
      amount: "150.00",
      description: "Monthly cell phone bill",
      expenseDate: Date.now(),
    });

    const result = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, 6),
        eq(expenses.year, 2026),
        eq(expenses.category, "cell_phone")
      )
    );

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].amount).toBe("150.00");
    expect(result[0].category).toBe("cell_phone");
  });

  it("should retrieve expenses by month and year", async () => {
    const testExpenses = [
      { agentId: testAgentId, month: 6, year: 2026, category: "leads", amount: "500.00", description: "Lead generation", expenseDate: Date.now() },
      { agentId: testAgentId, month: 6, year: 2026, category: "crm", amount: "99.00", description: "CRM subscription", expenseDate: Date.now() },
      { agentId: testAgentId, month: 6, year: 2026, category: "wavv_dialer", amount: "200.00", description: "WAVV dialer", expenseDate: Date.now() },
    ];

    for (const exp of testExpenses) {
      await db.insert(expenses).values(exp);
    }

    const result = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, 6),
        eq(expenses.year, 2026)
      )
    );

    expect(result.length).toBeGreaterThanOrEqual(3);
    const categories = result.map((e: any) => e.category);
    expect(categories).toContain("leads");
    expect(categories).toContain("crm");
    expect(categories).toContain("wavv_dialer");
  });

  it("should calculate total expenses for a month", async () => {
    const testExpenses = [
      { agentId: testAgentId, month: 7, year: 2026, category: "cell_phone", amount: "150.00", description: "Phone", expenseDate: Date.now() },
      { agentId: testAgentId, month: 7, year: 2026, category: "miscellaneous", amount: "50.00", description: "Other", expenseDate: Date.now() },
    ];

    for (const exp of testExpenses) {
      await db.insert(expenses).values(exp);
    }

    const result = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, 7),
        eq(expenses.year, 2026)
      )
    );

    const total = result.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
    expect(total).toBeGreaterThanOrEqual(200);
  });

  it("should update an expense record", async () => {
    await db.insert(expenses).values({
      agentId: testAgentId,
      month: 8,
      year: 2026,
      category: "leads",
      amount: "300.00",
      description: "Initial leads",
      expenseDate: Date.now(),
    });

    const [inserted] = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, 8),
        eq(expenses.year, 2026),
        eq(expenses.category, "leads")
      )
    ).limit(1);

    const expenseId = inserted.id;

    // Update the expense
    await db.update(expenses)
      .set({ amount: "400.00", description: "Updated leads" })
      .where(eq(expenses.id, expenseId));

    const result = await db.select().from(expenses).where(eq(expenses.id, expenseId));
    expect(result[0].amount).toBe("400.00");
    expect(result[0].description).toBe("Updated leads");
  });

  it("should delete an expense record", async () => {
    await db.insert(expenses).values({
      agentId: testAgentId,
      month: 9,
      year: 2026,
      category: "crm",
      amount: "99.00",
      description: "CRM to delete",
      expenseDate: Date.now(),
    });

    const [inserted] = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, 9),
        eq(expenses.year, 2026),
        eq(expenses.category, "crm")
      )
    ).limit(1);

    const expenseId = inserted.id;

    // Delete the expense
    await db.delete(expenses).where(eq(expenses.id, expenseId));

    const result = await db.select().from(expenses).where(eq(expenses.id, expenseId));
    expect(result).toHaveLength(0);
  });

  it("should handle multiple expense categories", async () => {
    const categories = ["cell_phone", "leads", "crm", "wavv_dialer", "miscellaneous"];
    const testMonth = 10;
    const testYear = 2026;

    for (const category of categories) {
      await db.insert(expenses).values({
        agentId: testAgentId,
        month: testMonth,
        year: testYear,
        category,
        amount: "100.00",
        description: `Test ${category}`,
        expenseDate: Date.now(),
      });
    }

    const result = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, testMonth),
        eq(expenses.year, testYear)
      )
    );

    const retrievedCategories = result.map((e: any) => e.category);
    for (const cat of categories) {
      expect(retrievedCategories).toContain(cat);
    }
  });
});
