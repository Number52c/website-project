/**
 * Metrics Calculations — persistence rates, revenue, commissions
 * These functions calculate key business metrics used across dashboards
 */

import { getDb } from "./db";
import { policies, policyAgents, salesEntries, expenses } from "../drizzle/schema";
import { eq, and, gte, lt, isNull, or, lte } from "drizzle-orm";

/**
 * Statuses that indicate a policy is currently active/in-force.
 * Used by the persistence numerator and lifecycle hooks.
 * All values are lowercase for case-insensitive comparison.
 */
export const ACTIVE_STATUSES = new Set([
  "active",
  "paid",
  "issued",
  "in_force",
  "in-force",
  "placed",
  "approved", // approved = placed/in-force in this system
]);

/**
 * Statuses that indicate a policy has lapsed/cancelled/terminated.
 * When a policy transitions to one of these, cancelDate should be set.
 * All values are lowercase for case-insensitive comparison.
 */
export const LAPSE_STATUSES = new Set([
  "cancelled",
  "canceled",
  "lapsed",
  "lapse",
  "terminated",
  "inactive",
  "surrendered",
  "matured",
  "expired",
]);

/**
 * Determine if a policy type is an eligible life insurance policy for persistence.
 *
 * ELIGIBLE: whole life, term life, final expense, universal life, indexed universal life,
 *           variable life, variable universal life, and any other type explicitly containing
 *           'life', 'term', 'final expense', or 'whole'.
 *
 * NOT ELIGIBLE:
 *   - Annuities (FIA, MYGA, annuity): excluded by design
 *   - type='other': excluded because 'other' is an unknown/incomplete type
 *   - null/empty: excluded
 */
export function isLifePolicyType(type: string | null): boolean {
  const t = (type || "").toLowerCase().trim();
  // Exclude unknown/incomplete types
  if (!t || t === "other" || t === "unknown") return false;
  // Exclude annuity products
  if (t.includes("fia") || t.includes("myga") || t.includes("annuity")) return false;
  // Include known life insurance abbreviations (exact match after trim)
  const abbreviations = new Set(["wl", "gwl", "iul", "ul", "vul", "vl", "fe", "fe life", "term", "ad", "add", "accidental"]);
  if (abbreviations.has(t)) return true;
  // Include known life insurance types by keyword
  return (
    t.includes("life") ||
    t.includes("term") ||
    t.includes("final expense") ||
    t.includes("whole") ||
    t.includes("universal") ||
    t.includes("accidental") ||
    t.startsWith("wl") ||
    t.startsWith("gwl")
  );
}

/**
 * Calculate Live Book Persistency Rate.
 *
 * Formula:
 *   Persistency% = (Active Policies In-Force ÷ Total Placed Policies) × 100
 *
 * Definitions:
 *   "Placed Policies" (denominator) = all life insurance policies where:
 *     - wasEverActive = 1 (policy was successfully issued and first premium collected)
 *     - Excludes pending, declined, not-taken (wasEverActive = 0)
 *     - Excludes annuities
 *
 *   "Active Policies In-Force" (numerator) = placed policies that have NOT lapsed,
 *     cancelled, or terminated as of today — i.e. status is in ACTIVE_STATUSES.
 *
 * Example: 12 placed, 11 still active → 11 ÷ 12 × 100 = 91.7%
 *
 * Returns:
 *   - { rate: number, totalPlaced: number, activeInForce: number }  when placed > 0
 *   - { rate: null, totalPlaced: 0, activeInForce: 0 }              when no placed policies
 *     (null means "N/A — no placed policies on record yet")
 *
 * @param agentId - The agent ID to filter by. null = all policies (admin-wide).
 */
export async function calculatePersistenceRate(
  agentId: number | null,
  _year?: number, // kept for backward-compat; ignored by Live Book formula
  _selectedEndDate?: Date // kept for backward-compat; ignored by Live Book formula
): Promise<{ rate: number | null; totalPlaced: number; activeInForce: number; startingBlock: number; stillActive: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch all life policies that were ever placed (wasEverActive = 1)
  const rawPolicies = agentId
    ? await db
        .select({ p: policies })
        .from(policies)
        .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
        .where(
          and(
            eq(policyAgents.agentId, agentId),
            eq(policies.wasEverActive, 1)
          )
        )
        .then(rows => rows.map(r => r.p))
    : await db
        .select()
        .from(policies)
        .where(eq(policies.wasEverActive, 1));

  // Filter to life insurance types only (exclude annuities)
  const placedPolicies = rawPolicies.filter((p: typeof policies.$inferSelect) =>
    isLifePolicyType(p.type)
  );

  const totalPlaced = placedPolicies.length;

  // If no placed policies, return null (N/A)
  if (totalPlaced === 0) {
    return { rate: null, totalPlaced: 0, activeInForce: 0, startingBlock: 0, stillActive: 0 };
  }

  // Numerator: placed policies still active/in-force today
  const activeInForce = placedPolicies.filter((p: typeof policies.$inferSelect) =>
    ACTIVE_STATUSES.has((p.status || "").toLowerCase())
  ).length;

  const rate = Math.round((activeInForce / totalPlaced) * 10000) / 100; // 2 decimal places

  // startingBlock/stillActive aliases for backward compatibility with existing UI code
  return {
    rate,
    totalPlaced,
    activeInForce,
    startingBlock: totalPlaced,   // alias: totalPlaced
    stillActive: activeInForce,   // alias: activeInForce
  };
}

/**
 * Get active policy count for an agent or admin.
 * Counts ALL currently active life policies.
 */
export async function getActivePolicyCount(
  agentId: number | null
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const activePolicies = agentId
    ? await db
        .select({ p: policies })
        .from(policies)
        .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
        .where(
          and(
            eq(policyAgents.agentId, agentId),
            eq(policies.status, "active")
          )
        )
        .then(rows => rows.map(r => r.p))
    : await db
        .select()
        .from(policies)
        .where(eq(policies.status, "active"));

  return activePolicies.filter((p: typeof policies.$inferSelect) =>
    isLifePolicyType(p.type)
  ).length;
}

/**
 * Calculate monthly revenue metrics for an agent or admin
 * Includes: total commission, expenses, net revenue, active policies, active book AP
 */
export async function calculateMonthlyRevenue(
  agentId: number | null, // null = admin's own
  year: number,
  month: number
): Promise<{
  totalCommission: number;
  totalExpenses: number;
  netRevenue: number;
  activePolicies: number;
  activeBookAP: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const monthStart = new Date(year, month - 1, 1).getTime();
  const monthEnd = new Date(year, month, 0, 23, 59, 59).getTime();

  // Get sales entries for this month
  const salesThisMonth = await db
    .select()
    .from(salesEntries)
    .where(
      and(
        agentId ? eq(salesEntries.agentId, agentId) : isNull(salesEntries.agentId),
        gte(salesEntries.saleDate, new Date(year, month - 1, 1).getTime()),
        lt(salesEntries.saleDate, new Date(year, month, 1).getTime())
      )
    );

  // Calculate total commission from sales
  let totalCommission = 0;
  salesThisMonth.forEach((sale: typeof salesEntries.$inferSelect) => {
    const commissionPercent = sale.commission || 0;
    const premium = Number(sale.premium) || 0;
    const commission = (premium * Number(commissionPercent)) / 100;
    totalCommission += commission;
  });

  // Get expenses for this month
  const expensesThisMonth = await db
    .select()
    .from(expenses)
    .where(
      and(
        agentId ? eq(expenses.agentId, agentId) : isNull(expenses.agentId),
        eq(expenses.year, year),
        eq(expenses.month, month)
      )
    );

  const totalExpenses = expensesThisMonth.reduce(
    (sum: number, exp: typeof expenses.$inferSelect) => sum + (Number(exp.amount) || 0),
    0
  );

  // Get active life policies (all currently active)
  const activePolicies = agentId
    ? await db
        .select()
        .from(policies)
        .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
        .where(
          and(
            eq(policyAgents.agentId, agentId),
            eq(policies.status, "active")
          )
        )
        .then(rows => rows.map(r => r.policies))
    : await db
        .select()
        .from(policies)
        .where(eq(policies.status, "active"));

  // Calculate active book AP (only life policies)
  let activeBookAP = 0;
  activePolicies.forEach((p: typeof policies.$inferSelect) => {
    if (isLifePolicyType(p.type)) {
      activeBookAP += Number(p.yearlyAP) || 0;
    }
  });

  return {
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netRevenue: Math.round((totalCommission - totalExpenses) * 100) / 100,
    activePolicies: activePolicies.length,
    activeBookAP: Math.round(activeBookAP * 100) / 100,
  };
}

/**
 * Calculate YTD revenue for an agent or admin
 * Sums all months from January to current month
 */
export async function calculateYTDRevenue(
  agentId: number | null,
  year: number,
  currentMonth: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let ytdCommission = 0;

  for (let month = 1; month <= currentMonth; month++) {
    const monthlyData = await calculateMonthlyRevenue(agentId, year, month);
    ytdCommission += monthlyData.totalCommission;
  }

  return Math.round(ytdCommission * 100) / 100;
}

/**
 * Get all agents' persistence rates
 * Used for the admin KPI showing all agents
 */
export async function getAllAgentsPersistenceRates(year: number): Promise<
  Array<{
    agentId: number;
    agentName: string;
    persistenceRate: number | null;
    startingBlock: number;
    stillActive: number;
    activePolicies: number;
    cancelledThisMonth: number;
  }>
> {
  // Populated by querying the agents table and calculating for each
  // This stub is filled in by the admin procedure in routers.ts
  return [];
}
