/**
 * server/lib/syncPolicyToSales.ts
 * 
 * Auto-sync logic: When policies are updated, automatically create/update
 * corresponding sales_entries to keep the Sales Tracker in sync.
 * 
 * Behavior:
 * - One sales_entry per policy (identified by policyId)
 * - Partial overwrite: preserves manual edits (commission, isPaid, notes)
 * - Canceled policies marked as isCanceled=true
 * - One-way sync: Policy → Sales only
 */

import { getDb } from "../db";
import { salesEntries, policies, clients, policyAgents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface SyncResult {
  policyId: number;
  action: "created" | "updated" | "skipped";
  error?: string;
}

/**
 * Sync a single policy to its sales_entry
 * 
 * - If sales_entry exists: UPDATE with fresh policy data (partial overwrite)
 * - If sales_entry doesn't exist: CREATE new entry from policy
 * - Preserves manual edits: commissionPercent, commissionOverride, isPaid, notes, agentId
 */
export async function syncPolicyToSalesEntry(
  policyId: number
): Promise<SyncResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { policyId, action: "skipped", error: "Database not available" };
    }

    // Fetch the policy
    const policyResult = await db.select().from(policies).where(eq(policies.id, policyId)).limit(1);
    const policy = policyResult.length > 0 ? policyResult[0] : null;

    if (!policy) {
      console.warn(`[syncPolicyToSales] Policy ${policyId} not found. Skipping.`);
      return { policyId, action: "skipped", error: "Policy not found" };
    }

    // Fetch client name
    let clientName = "Unknown";
    if (policy.clientId) {
      const clientResult = await db.select().from(clients).where(eq(clients.id, policy.clientId)).limit(1);
      if (clientResult.length > 0) {
        const client = clientResult[0];
        clientName = `${client.firstName} ${client.lastName}`.trim();
      }
    }

    // Fetch originating agent from policyAgents table
    let agentId: number | null = null;
    const agentResult = await db.select().from(policyAgents)
      .where(eq(policyAgents.policyId, policyId))
      .limit(1);
    if (agentResult.length > 0) {
      agentId = agentResult[0].agentId;
    }

    // Calculate sale month/year from effective date
    const effectiveDateMs = policy.effectiveDate || Date.now();
    const effectiveDateObj = new Date(effectiveDateMs);
    const saleMonth = effectiveDateObj.getMonth() + 1;
    const saleYear = effectiveDateObj.getFullYear();

    // Data to sync from policy (these fields get overwritten)
    const policySyncData = {
      clientId: policy.clientId ?? null,
      clientName,
      carrier: policy.carrier ?? "",
      productType: policy.type ?? "", // Map 'type' to 'productType'
      premium: policy.premiumAmount ?? null,
      annualPremium: policy.yearlyAP ?? null,
      effectiveDate: policy.effectiveDate ?? null,
      isCanceled: policy.status === "cancelled" ? 1 : 0,
      saleMonth,
      saleYear,
    };

    // Check if sales_entry already exists for this policy
    const existingResult = await db.select().from(salesEntries).where(eq(salesEntries.policyId, policyId)).limit(1);
    const existing = existingResult.length > 0 ? existingResult[0] : null;

    if (existing) {
      // UPDATE: Overwrite only policy-sourced fields
      // Preserve: commissionPercent, commissionOverride, isPaid, notes, agentId
      await db
        .update(salesEntries)
        .set(policySyncData)
        .where(eq(salesEntries.policyId, policyId));

      console.log(`[syncPolicyToSales] Updated sales_entry for policyId ${policyId}`);
      return { policyId, action: "updated" };
    } else {
      // CREATE: New sales_entry from policy
      // Set defaults for manual-edit fields
      await db.insert(salesEntries).values({
        policyId,
        ...policySyncData,
        agentId,
        commissionPercent: null,
        commissionOverride: null,
        isPaid: 0,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`[syncPolicyToSales] Created sales_entry for policyId ${policyId}`);
      return { policyId, action: "created" };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[syncPolicyToSales] Error syncing policyId ${policyId}:`, errorMsg);
    return { policyId, action: "skipped", error: errorMsg };
  }
}

/**
 * Sync multiple policies to their sales_entries
 * 
 * Runs all syncs in parallel with Promise.allSettled for resilience.
 * Individual policy sync failures don't block other policies.
 */
export async function syncPoliciesToSalesEntries(
  policyIds: number[]
): Promise<SyncResult[]> {
  console.log(`[syncPolicyToSales] Starting sync for ${policyIds.length} policies...`);

  const results = await Promise.allSettled(
    policyIds.map((id) => syncPolicyToSalesEntry(id))
  );

  const syncResults: SyncResult[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      syncResults.push(result.value);
    } else {
      syncResults.push({
        policyId: policyIds[index],
        action: "skipped",
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }
  });

  const created = syncResults.filter((r) => r.action === "created").length;
  const updated = syncResults.filter((r) => r.action === "updated").length;
  const skipped = syncResults.filter((r) => r.action === "skipped").length;

  console.log(
    `[syncPolicyToSales] Sync complete: ${created} created, ${updated} updated, ${skipped} skipped`
  );

  return syncResults;
}
