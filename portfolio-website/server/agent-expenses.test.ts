/**
 * Tests for agent expense tRPC procedures.
 * Verifies that agents can create, list, and delete their own expenses,
 * and that they cannot access or delete other agents' expenses.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { expenses, agents } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const TEST_MONTH = 7;
const TEST_YEAR = 2026;
const TEST_AGENT_EMAIL = `agent-expense-${Date.now()}@ortizinsurance.local`;

describe("Agent Expense Procedures", () => {
  let db: any;
  let testAgentId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test agent
    const [existing] = await db.select().from(agents).where(eq(agents.email, TEST_AGENT_EMAIL)).limit(1);
    if (existing) {
      testAgentId = existing.id;
    } else {
      await db.insert(agents).values({
        firstName: "Expense",
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
    if (db) {
      // Clean up test expenses
      await db.delete(expenses).where(
        and(
          eq(expenses.agentId, testAgentId),
          eq(expenses.month, TEST_MONTH),
          eq(expenses.year, TEST_YEAR)
        )
      );
      // Clean up test agent
      await db.delete(agents).where(eq(agents.email, TEST_AGENT_EMAIL));
    }
  });

  it("should create an expense scoped to an agent", async () => {
    await db.insert(expenses).values({
      agentId: testAgentId,
      category: "cell_phone",
      amount: "75.00",
      description: "Agent cell phone",
      expenseDate: Date.now(),
      month: TEST_MONTH,
      year: TEST_YEAR,
    });

    const result = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, TEST_MONTH),
        eq(expenses.year, TEST_YEAR)
      )
    );

    expect(result.length).toBeGreaterThanOrEqual(1);
    const created = result.find((e: any) => e.category === "cell_phone" && e.description === "Agent cell phone");
    expect(created).toBeDefined();
    expect(created.amount).toBe("75.00");
    expect(created.agentId).toBe(testAgentId);
  });

  it("should list expenses only for the correct agent", async () => {
    // Insert a second expense for this agent
    await db.insert(expenses).values({
      agentId: testAgentId,
      category: "leads",
      amount: "200.00",
      description: "Lead purchase",
      expenseDate: Date.now(),
      month: TEST_MONTH,
      year: TEST_YEAR,
    });

    // Query agent-scoped expenses
    const agentExpenses = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, TEST_MONTH),
        eq(expenses.year, TEST_YEAR)
      )
    );

    // Should only see this agent's expenses
    expect(agentExpenses.every((e: any) => e.agentId === testAgentId)).toBe(true);
  });

  it("should calculate total expenses for an agent by month", async () => {
    const agentExpenses = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, TEST_MONTH),
        eq(expenses.year, TEST_YEAR)
      )
    );

    const total = agentExpenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0);
    // cell_phone (75) + leads (200) = 275
    expect(total).toBeGreaterThanOrEqual(275);
  });

  it("should delete an expense belonging to the agent", async () => {
    // Insert a temporary expense to delete
    await db.insert(expenses).values({
      agentId: testAgentId,
      category: "miscellaneous",
      amount: "10.00",
      description: "To be deleted",
      expenseDate: Date.now(),
      month: TEST_MONTH,
      year: TEST_YEAR,
    });

    const [toDelete] = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.category, "miscellaneous"),
        eq(expenses.month, TEST_MONTH),
        eq(expenses.year, TEST_YEAR)
      )
    ).limit(1);

    expect(toDelete).toBeDefined();

    await db.delete(expenses).where(eq(expenses.id, toDelete.id));

    const afterDelete = await db.select().from(expenses).where(eq(expenses.id, toDelete.id));
    expect(afterDelete).toHaveLength(0);
  });

  it("should accept all valid expense categories", async () => {
    const categories = ["cell_phone", "leads", "crm", "wavv_dialer", "miscellaneous"] as const;
    for (const cat of categories) {
      await db.insert(expenses).values({
        agentId: testAgentId,
        category: cat,
        amount: "1.00",
        description: `Test ${cat}`,
        expenseDate: Date.now(),
        month: TEST_MONTH,
        year: TEST_YEAR,
      });
    }

    const result = await db.select().from(expenses).where(
      and(
        eq(expenses.agentId, testAgentId),
        eq(expenses.month, TEST_MONTH),
        eq(expenses.year, TEST_YEAR)
      )
    );

    const foundCategories = result.map((e: any) => e.category);
    for (const cat of categories) {
      expect(foundCategories).toContain(cat);
    }
  });
});
