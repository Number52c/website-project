import { eq, desc, and, inArray, getTableColumns, sql, isNull, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  quoteRequests, contactSubmissions,
  InsertQuoteRequest, InsertContactSubmission,
  clients, InsertClient, Client,
  policies, InsertPolicy, Policy,
  policyAgents,
  clientDocuments, InsertClientDocument,
  paymentMethods, InsertPaymentMethod,
  paymentHistory, InsertPaymentHistory,
  pdfs, PDF, InsertPDF,

  // Legacy tables - commented out for new schema
  salesEntries, InsertSalesEntry, SalesEntry,
  // gradedWholeLifePolicies, InsertGradedWholeLifePolicy, GradedWholeLifePolicy,
  appSettings,
  carriers, Carrier,
  expenses, InsertExpense, Expense,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Quote Request Helpers ────────────────────────────────────────────────────

export async function insertQuoteRequest(data: InsertQuoteRequest): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert quote request: database not available");
    return;
  }
  await db.insert(quoteRequests).values(data);
}

// ── Contact Submission Helpers ───────────────────────────────────────────────

export async function insertContactSubmission(data: InsertContactSubmission): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot insert contact submission: database not available");
    return;
  }
  await db.insert(contactSubmissions).values(data);
}

// ── Client Portal Helpers ────────────────────────────────────────────────────

export async function getClientByUserId(userId: number): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClientById(clientId: number): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClientByLastNameAndPin(lastName: string, pin: string): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  // Find client by last name
  const result = await db.select().from(clients)
    .where(eq(clients.lastName, lastName))
    .limit(1);
  
  if (result.length === 0) return undefined;
  
  const client = result[0];
  
  // Verify PIN using bcrypt (imported at top of file)
  const { verifyPin } = await import('./pin');
  const pinMatches = await verifyPin(pin, client.pin);
  
  return pinMatches ? client : undefined;
}

/** Get all household members (for household portal access) */
export async function getHouseholdMembers(householdId: number): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];
  if (!householdId) return [];
  return db.select().from(clients).where(eq(clients.householdId, householdId)).orderBy(clients.firstName);
}

/** Get all policies for a household */
export async function getHouseholdPolicies(householdId: number): Promise<Policy[]> {
  const db = await getDb();
  if (!db) return [];
  if (!householdId) return [];
  
  // Get all household members
  const members = await getHouseholdMembers(householdId);
  if (members.length === 0) return [];
  
  const memberIds = members.map(m => m.id);
  return db.select().from(policies)
    .where(inArray(policies.clientId, memberIds))
    .orderBy(desc(policies.createdAt));
}

/** Get all annuities for a household */
export async function getHouseholdAnnuities(householdId: number): Promise<Policy[]> {
  const db = await getDb();
  if (!db) return [];
  if (!householdId) return [];
  
  // Get all household members
  const members = await getHouseholdMembers(householdId);
  if (members.length === 0) return [];
  
  const memberIds = members.map(m => m.id);
  return db.select().from(policies)
    .where(and(
      inArray(policies.clientId, memberIds),
      inArray(policies.type, ['annuity', 'fixed_annuity', 'variable_annuity', 'indexed_annuity', 'immediate_annuity'])
    ))
    .orderBy(desc(policies.createdAt));
}

export async function getClientPolicies(clientId: number): Promise<Policy[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(policies).where(eq(policies.clientId, clientId)).orderBy(desc(policies.createdAt));
}

export async function getClientAnnuities(clientId: number): Promise<Policy[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(policies)
    .where(and(
      eq(policies.clientId, clientId),
      inArray(policies.type, ['annuity', 'fixed_annuity', 'variable_annuity', 'indexed_annuity', 'immediate_annuity'])
    ))
    .orderBy(desc(policies.createdAt));
}

export async function getPolicyById(policyId: number): Promise<Policy | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(policies).where(eq(policies.id, policyId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClientByName(firstName: string, lastName: string): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients)
    .where(and(eq(clients.firstName, firstName), eq(clients.lastName, lastName)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Admin: Client Management ─────────────────────────────────────────────────

export async function getAllClients(): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];
  // Return all clients
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientsByAgent(agentId: number): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];
  // Return all clients created by a specific agent
  return db.select().from(clients).where(eq(clients.createdByAgentId, agentId)).orderBy(desc(clients.createdAt));
}

export async function createClient(data: InsertClient): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    // Insert and use MySQL insertId directly from result
    const result = await db.insert(clients).values(data);
    const insertId = (result as any)[0]?.insertId;
    if (insertId && insertId > 0) {
      console.log("[createClient] Successfully created client with ID:", insertId);
      return { id: insertId };
    }
    // Fallback: query by lastName + email (handles both agent and admin creation)
    const whereConditions = data.email
      ? and(eq(clients.lastName, data.lastName), eq(clients.email, data.email))
      : eq(clients.lastName, data.lastName);
    const createdClient = await db.select().from(clients)
      .where(whereConditions)
      .orderBy(desc(clients.createdAt))
      .limit(1);
    if (createdClient.length > 0) {
      console.log("[createClient] Fallback lookup found client with ID:", createdClient[0].id);
      return { id: createdClient[0].id };
    }
    throw new Error("Failed to retrieve created client ID after insert");
  } catch (err) {
    console.error("[createClient] Error:", err);
    throw err;
  }
}

export async function updateClient(id: number, data: Partial<InsertClient>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete associated policies first
  await db.delete(policies).where(eq(policies.clientId, id));
  await db.delete(clients).where(eq(clients.id, id));
}

// ── Admin: Policy Management ─────────────────────────────────────────────────

export async function getAllPolicies(): Promise<(Policy & { clientName?: string })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      ...getTableColumns(policies),
      clientFirstName: clients.firstName,
      clientLastName: clients.lastName,
    })
    .from(policies)
    .leftJoin(clients, eq(policies.clientId, clients.id))
    .orderBy(desc(policies.createdAt));
  return rows.map(r => ({
    ...r,
    clientName: r.clientFirstName && r.clientLastName
      ? `${r.clientFirstName} ${r.clientLastName}`
      : r.clientFirstName || r.clientLastName || undefined,
  }));
}

export async function createPolicy(data: InsertPolicy): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(policies).values(data);
  return { id: (result as any)[0]?.insertId ?? 0 };
}

export async function updatePolicy(id: number, data: Partial<InsertPolicy>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(policies).set(data).where(eq(policies.id, id));
}

export async function deletePolicy(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(policies).where(eq(policies.id, id));
}

// ── Admin: Annuity Management ───────────────────────────────────────────────

export async function getAllAnnuities(): Promise<Policy[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(policies)
    .where(inArray(policies.type, ['annuity', 'fixed_annuity', 'variable_annuity', 'indexed_annuity', 'immediate_annuity']))
    .orderBy(desc(policies.createdAt));
}

export async function createAnnuity(data: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const policyData: any = {
    clientId: data.clientId,
    policyType: data.type || 'fixed_annuity',
    carrier: data.carrier,
    policyNumber: data.policyNumber || '',
    monthlyPremium: data.premium ? parseFloat(data.premium) : null,
    issueDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
    status: data.status || 'active',
    notes: data.notes,
  };
  await db.insert(policies).values(policyData);
}

export async function updateAnnuity(id: number, data: any): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = {};
  if (data.premium !== undefined) updateData.monthlyPremium = parseFloat(data.premium);
  if (data.effectiveDate !== undefined) updateData.issueDate = new Date(data.effectiveDate);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;
  await db.update(policies).set(updateData).where(eq(policies.id, id));
}

export async function deleteAnnuity(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(policies).where(eq(policies.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, openId: users.openId }).from(users);
}

// ── Admin: Sales Tracker Management ────────────────────────────────────────────

export async function getSalesEntriesByMonth(month: number, year: number): Promise<SalesEntry[]> {
  const db = await getDb();
  if (!db) return [];
  // Get all sales entries (both admin and agent sales) and filter by month/year
  // This ensures commission is attributed to the month the policy starts (effective date), not when it was entered
  const allEntries = await db.select().from(salesEntries).orderBy(desc(salesEntries.saleDate));
  
  return allEntries.filter(entry => {
    if (!entry.saleDate) return false;
    // Include both admin sales (agentId = null) and agent sales (agentId != null)
    const entryDate = new Date(entry.saleDate);
    const entryMonth = entryDate.getMonth() + 1; // 1-12
    const entryYear = entryDate.getFullYear();
    return entryMonth === month && entryYear === year;
  });
}

export async function getAllSalesEntries(): Promise<SalesEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesEntries).orderBy(desc(salesEntries.saleDate));
}

export async function createSalesEntry(data: InsertSalesEntry): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validate required fields before inserting to surface schema mismatches early
  if (!data.clientName || typeof data.clientName !== 'string' || data.clientName.trim() === '') {
    throw new Error(`createSalesEntry: clientName is required, got: ${JSON.stringify(data.clientName)}`);
  }
  if (!data.carrier || typeof data.carrier !== 'string' || data.carrier.trim() === '') {
    throw new Error(`createSalesEntry: carrier is required, got: ${JSON.stringify(data.carrier)}`);
  }

  // Normalize: ensure at least one of product/productType is set
  const normalizedData: any = { ...data };
  if (!normalizedData.product && normalizedData.productType) {
    normalizedData.product = normalizedData.productType;
  } else if (!normalizedData.productType && normalizedData.product) {
    normalizedData.productType = normalizedData.product;
  }

  // Normalize: ensure month/year are set from saleDate if missing
  if ((!normalizedData.month || !normalizedData.year) && normalizedData.saleDate) {
    const d = new Date(normalizedData.saleDate);
    if (!normalizedData.month) normalizedData.month = d.getMonth() + 1;
    if (!normalizedData.year) normalizedData.year = d.getFullYear();
  }
  // Legacy fields: ensure saleMonth/saleYear are set too
  if (!normalizedData.saleMonth && normalizedData.month) normalizedData.saleMonth = normalizedData.month;
  if (!normalizedData.saleYear && normalizedData.year) normalizedData.saleYear = normalizedData.year;

  try {
    await db.insert(salesEntries).values(normalizedData);
  } catch (err) {
    console.error('[createSalesEntry] DB insert failed:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      data: normalizedData,
    });
    throw new Error(`createSalesEntry failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function updateSalesEntry(id: number, data: Partial<InsertSalesEntry>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(salesEntries).set(data).where(eq(salesEntries.id, id));
}

export async function deleteSalesEntry(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(salesEntries).where(eq(salesEntries.id, id));
}

// ── Admin: Graded Whole Life Policy Management ──────────────────────────────
// gradedWholeLifePolicies table doesn't exist - these functions are deprecated
/*
export async function getAllGradedWholeLifePolicies(): Promise<GradedWholeLifePolicy[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gradedWholeLifePolicies).orderBy(desc(gradedWholeLifePolicies.createdAt));
}

export async function createGradedWholeLifePolicy(data: InsertGradedWholeLifePolicy): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(gradedWholeLifePolicies).values(data);
}

export async function updateGradedWholeLifePolicy(id: number, data: Partial<InsertGradedWholeLifePolicy>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(gradedWholeLifePolicies).set(data).where(eq(gradedWholeLifePolicies.id, id));
}

export async function deleteGradedWholeLifePolicy(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(gradedWholeLifePolicies).where(eq(gradedWholeLifePolicies.id, id));
}
*/

// ── App Settings ─────────────────────────────────────────────────────────────
export async function getAppSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(appSettings).where(eq(appSettings.key, key));
  return rows[0]?.value ?? null;
}
export async function setAppSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appSettings).values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

export async function getSalesEntriesByClientName(clientName: string): Promise<SalesEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesEntries)
    .where(eq(salesEntries.clientName, clientName))
    .orderBy(desc(salesEntries.saleDate));
}

// ── Client Portal Access Tracking ────────────────────────────────────────────
export async function updateClientLastLogin(clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set({ lastPortalLogin: Date.now() }).where(eq(clients.id, clientId));
}

export async function getClientLoginStats(): Promise<{ totalClients: number; loggedInClients: number; neverLoggedIn: number }> {
  const db = await getDb();
  if (!db) return { totalClients: 0, loggedInClients: 0, neverLoggedIn: 0 };
  
  const allClients = await db.select().from(clients);
  const loggedInClients = allClients.filter(c => c.lastPortalLogin !== null && c.lastPortalLogin !== undefined);
  
  return {
    totalClients: allClients.length,
    loggedInClients: loggedInClients.length,
    neverLoggedIn: allClients.length - loggedInClients.length,
  };
}

export async function getClientWithLoginStatus(clientId: number): Promise<(Client & { hasLoggedIn: boolean; lastLoginDate: string | null }) | null> {
  const db = await getDb();
  if (!db) return null;
  
  const client = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  if (!client[0]) return null;
  
  const hasLoggedIn = client[0].lastPortalLogin !== null && client[0].lastPortalLogin !== undefined;
  const lastLoginDate = hasLoggedIn ? new Date(client[0].lastPortalLogin!).toLocaleString() : null;
  
  return {
    ...client[0],
    hasLoggedIn,
    lastLoginDate,
  };
}

// ── Admin: Expense Management ────────────────────────────────────────────────

export async function getExpensesByMonth(month: number, year: number): Promise<Expense[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses)
    .where(and(eq(expenses.month, month), eq(expenses.year, year)))
    .orderBy(desc(expenses.createdAt));
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.createdAt));
}

export async function createExpense(data: InsertExpense): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(expenses).values(data);
}

export async function updateExpense(id: number, data: Partial<InsertExpense>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(expenses).set(data).where(eq(expenses.id, id));
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(expenses).where(eq(expenses.id, id));
}

export async function getTotalExpensesByMonth(month: number, year: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(expenses)
    .where(and(eq(expenses.month, month), eq(expenses.year, year)));
  return result.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
}

export async function getCarrierPortalUrl(carrierName: string): Promise<{ portalUrl: string | null; website: string | null }> {
  const db = await getDb();
  if (!db) return { portalUrl: null, website: null };
  
  try {
    // Carriers table doesn't have portalUrl or website fields - return null
    // const result = await db.select().from(carriers).where(eq(carriers.name, carrierName)).limit(1);
    return {
      portalUrl: null,
      website: null,
    };
  } catch (error) {
    console.error("[Database] Error getting carrier portal URL:", error);
    return { portalUrl: null, website: null };
  }
}

export async function getAllCarriers(): Promise<Carrier[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(carriers);
  } catch (error) {
    console.error("[Database] Error getting carriers:", error);
    return [];
  }
}


// ─── ANNUAL REVIEW TRACKING ─────────────────────────────────────────────────

/**
 * Get clients due for annual review based on policy effective dates
 * Returns clients grouped by notice period (1, 2, 3 months)
 */
export async function getClientsForAnnualReview() {
  const db = await getDb();
  if (!db) return { oneMonth: [], twoMonths: [], threeMonths: [] };

  try {
    const allPolicies = await db.select().from(policies);
    const allClients = await db.select().from(clients);

    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const clientsMap = new Map(allClients.map(c => [c.id, c]));
    const clientsByReviewDate = new Map<number, { client: typeof clients.$inferSelect; nextReviewDate: Date }>();

    // For each policy, calculate next annual review date (effective date + 1 year)
    for (const policy of allPolicies) {
      if (!policy.effectiveDate || policy.status === 'cancelled' || policy.status === 'expired' || policy.status === 'surrendered' || policy.status === 'matured') continue;

      const issueDate = new Date(policy.effectiveDate);
      const nextReview = new Date(issueDate);
      nextReview.setFullYear(nextReview.getFullYear() + 1);

      const client = clientsMap.get(policy.clientId);
      if (!client) continue;

      // Store the earliest review date for this client (in case they have multiple policies)
      const existing = clientsByReviewDate.get(policy.clientId);
      if (!existing || nextReview < existing.nextReviewDate) {
        clientsByReviewDate.set(policy.clientId, { client, nextReviewDate: nextReview });
      }
    }

    // Categorize by notice period
    const oneMonth: typeof clients.$inferSelect[] = [];
    const twoMonths: typeof clients.$inferSelect[] = [];
    const threeMonths: typeof clients.$inferSelect[] = [];

    for (const { client, nextReviewDate } of Array.from(clientsByReviewDate.values())) {
      if (nextReviewDate >= now && nextReviewDate <= oneMonthFromNow) {
        oneMonth.push(client);
      } else if (nextReviewDate > oneMonthFromNow && nextReviewDate <= twoMonthsFromNow) {
        twoMonths.push(client);
      } else if (nextReviewDate > twoMonthsFromNow && nextReviewDate <= threeMonthsFromNow) {
        threeMonths.push(client);
      }
    }

    return {
      oneMonth: oneMonth.sort((a, b) => a.lastName.localeCompare(b.lastName)),
      twoMonths: twoMonths.sort((a, b) => a.lastName.localeCompare(b.lastName)),
      threeMonths: threeMonths.sort((a, b) => a.lastName.localeCompare(b.lastName)),
    };
  } catch (error) {
    console.error("[Database] Error getting clients for annual review:", error);
    return { oneMonth: [], twoMonths: [], threeMonths: [] };
  }
}


// ── Agent Management ─────────────────────────────────────────────────────────

import { agents, Agent } from "../drizzle/schema";

export async function getAgentByEmail(email: string): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAgentById(agentId: number): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).orderBy(desc(agents.createdAt));
}

export async function createAgent(data: typeof agents.$inferInsert): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(agents).values(data);
}

export async function updateAgent(id: number, data: Partial<typeof agents.$inferInsert>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(agents).set(data).where(eq(agents.id, id));
}

/**
 * Get or create the admin agent record.
 * The admin (Mr. Ortiz) needs an entry in the agents table so their
 * policies can be linked via policyAgents and show in the Writing Agent column.
 * Uses a reserved email "admin@ortizinsurancebroker.com" as the stable identifier.
 */
export async function getOrCreateAdminAgentRecord(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ADMIN_EMAIL = "admin@ortizinsurancebroker.com";
  // Try to find existing admin agent record
  const existing = await db.select({ id: agents.id })
    .from(agents)
    .where(eq(agents.email, ADMIN_EMAIL))
    .limit(1);
  if (existing.length > 0) {
    return existing[0].id;
  }
  // Create admin agent record
  const result = await db.insert(agents).values({
    firstName: "Mr.",
    lastName: "Ortiz",
    email: ADMIN_EMAIL,
    agentStatus: "active",
    color: "gold",
  });
  const insertId = (result as any)[0]?.insertId;
  if (!insertId) throw new Error("Failed to create admin agent record");
  return insertId;
}

export async function getAgentPolicies(agentId: number): Promise<(Policy & { clientName?: string })[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    ...getTableColumns(policies),
    clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`
  }).from(policies)
    .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
    .leftJoin(clients, eq(policies.clientId, clients.id))
    .where(and(
      eq(policyAgents.agentId, agentId),
      ne(policies.type, 'annuity')
    ))
    .orderBy(desc(policies.createdAt));
  return result as any;
}

export async function getAgentAnnuities(agentId: number): Promise<Policy[]> {
  const db = await getDb();
  if (!db) return [];
  const agentPolicies = await db.select({ policyId: policyAgents.policyId })
    .from(policyAgents)
    .where(eq(policyAgents.agentId, agentId));
  const policyIds = agentPolicies.map(p => p.policyId);
  if (policyIds.length === 0) return [];
  return db.select().from(policies)
    .where(and(
      inArray(policies.id, policyIds),
      inArray(policies.type, ['annuity', 'fixed_annuity', 'variable_annuity', 'indexed_annuity', 'immediate_annuity'])
    ))
    .orderBy(desc(policies.createdAt));
}

export async function getAgentClients(agentId: number): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];
  // Get all policies and annuities for this agent
  const agentPolicies = await getAgentPolicies(agentId);
  const agentAnnuities = await getAgentAnnuities(agentId);
  // Collect unique client IDs from policies/annuities
  const clientIds = new Set<number>();
  agentPolicies.forEach(p => clientIds.add(p.clientId));
  agentAnnuities.forEach(a => {
    if (a.clientId) clientIds.add(a.clientId);
  });
  // Also include clients directly created by this agent (even without policies)
  const directClients = await db.select().from(clients)
    .where(eq(clients.createdByAgentId, agentId))
    .orderBy(desc(clients.createdAt));
  directClients.forEach(c => clientIds.add(c.id));
  // Fetch all unique clients
  if (clientIds.size === 0) return directClients;
  const clientIdArray = Array.from(clientIds);
  return db.select().from(clients)
    .where(inArray(clients.id, clientIdArray))
    .orderBy(desc(clients.createdAt));
}

// Note: salesEntries table doesn't have agentId field
// Sales entries are tracked by clientName, not agent
// Agents can view their policies/annuities which have agentId

// ── Agent Sales Queries ─────────────────────────────────────────────────────

/**
 * Get all sales entries for a specific agent by agentId
 */
export async function getAgentSalesEntries(agentId: number): Promise<SalesEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesEntries)
    .where(eq(salesEntries.agentId, agentId))
    .orderBy(desc(salesEntries.saleDate));
}

/**
 * Get sales entries for an agent filtered by month and year
 */
export async function getAgentSalesEntriesByMonth(agentId: number, month: number, year: number): Promise<SalesEntry[]> {
  const db = await getDb();
  if (!db) return [];
  const allEntries = await db.select().from(salesEntries)
    .where(eq(salesEntries.agentId, agentId))
    .orderBy(desc(salesEntries.saleDate));
  
  return allEntries.filter(entry => {
    if (!entry.saleDate) return false;
    const entryDate = new Date(entry.saleDate);
    const entryMonth = entryDate.getMonth() + 1;
    const entryYear = entryDate.getFullYear();
    return entryMonth === month && entryYear === year;
  });
}

/**
 * Get total sales count for an agent
 */
export async function getAgentTotalSalesCount(agentId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(salesEntries)
    .where(eq(salesEntries.agentId, agentId));
  return result.length;
}

/**
 * Get total premium for an agent
 */
export async function getAgentTotalPremium(agentId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(salesEntries)
    .where(eq(salesEntries.agentId, agentId));
  return result.reduce((sum, entry) => sum + (Number(entry.premium) || 0), 0);
}

/**
 * Get total annual premium (AP) for an agent
 */
export async function getAgentTotalAnnualPremium(agentId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(salesEntries)
    .where(eq(salesEntries.agentId, agentId));
  return result.reduce((sum, entry) => sum + (Number(entry.annualPremium) || 0), 0);
}

/**
 * Get total commission for an agent
 */
export async function getAgentTotalCommission(agentId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(salesEntries)
    .where(eq(salesEntries.agentId, agentId));
  return result.reduce((sum, entry) => {
    const ap = Number(entry.annualPremium) || 0;
    const commPercent = Number(entry.commission) || 0;
    return sum + (ap * commPercent / 100);
  }, 0);
}

/**
 * Get monthly commission for an agent
 */
export async function getAgentMonthlyCommission(agentId: number, month: number, year: number): Promise<number> {
  const entries = await getAgentSalesEntriesByMonth(agentId, month, year);
  return entries.reduce((sum, entry) => {
    const ap = Number(entry.annualPremium) || 0;
    const commPercent = Number(entry.commission) || 0;
    return sum + (ap * commPercent / 100);
  }, 0);
}

// ── Agent: Expense Management ─────────────────────────────────────────────────

export async function getAgentExpensesByMonth(agentId: number, month: number, year: number): Promise<Expense[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses)
    .where(and(eq(expenses.agentId, agentId), eq(expenses.month, month), eq(expenses.year, year)))
    .orderBy(desc(expenses.createdAt));
}

export async function createAgentExpense(agentId: number, data: Omit<InsertExpense, 'agentId'>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(expenses).values({ ...data, agentId });
}

export async function updateAgentExpense(agentId: number, id: number, data: Partial<InsertExpense>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(expenses).set(data).where(and(eq(expenses.id, id), eq(expenses.agentId, agentId)));
}

export async function deleteAgentExpense(agentId: number, id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.agentId, agentId)));
}

export async function getTotalAgentExpensesByMonth(agentId: number, month: number, year: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(expenses)
    .where(and(eq(expenses.agentId, agentId), eq(expenses.month, month), eq(expenses.year, year)));
  return result.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
}


// ════════════════════════════════════════════════════════════════════════════════
// ═══ PHASE 1: STABILITY BUILD - POLICY SEGREGATION BY WRITING AGENT ═════════════
// ════════════════════════════════════════════════════════════════════════════════
// 
// Source of Truth: policyAgents.role = 'originating' identifies the writing agent
// This ensures data integrity and prevents double-counting between admin and agents.
//
// Three query patterns:
// 1. getAdminPersonalPolicies(adminAgentId) - Only policies where admin is originating agent
// 2. getAgentOriginatingPolicies(agentId) - Only policies where agent is originating agent
// 3. getAllPoliciesWithOriginatingAgent() - All policies with originating agent metadata
//
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Get policies where the admin/specified agent is the originating (writing) agent
 * Used for "My Book of Business" dashboard section
 * 
 * @param agentId - The agent ID to filter by (typically admin's agent ID)
 * @returns Array of policies with originating agent metadata
 * 
 * Stability Notes:
 * - Joins through policyAgents with role='originating' to ensure single source of truth
 * - Includes client name for display
 * - Handles edge case: policies with no originating agent are excluded
 * - Safe for concurrent access (read-only)
 */
export async function getAdminPersonalPolicies(agentId: number): Promise<(Policy & { 
  clientName?: string;
  originatingAgentId?: number;
})[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select({
      ...getTableColumns(policies),
      clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
      originatingAgentId: policyAgents.agentId,
    }).from(policies)
      .innerJoin(policyAgents, and(
        eq(policies.id, policyAgents.policyId),
        eq(policyAgents.role, 'primary'),
        eq(policyAgents.agentId, agentId)
      ))
      .leftJoin(clients, eq(policies.clientId, clients.id))
      .orderBy(desc(policies.createdAt));
    
    return result as any;
  } catch (error) {
    console.error("[DB] Error fetching admin personal policies:", error);
    return [];
  }
}

/**
 * Get policies where a specific agent is the originating (writing) agent
 * Used for "Agent Production" dashboard section and agent filtering
 * 
 * @param agentId - The agent ID to filter by
 * @returns Array of policies with originating agent metadata
 * 
 * Stability Notes:
 * - Identical to getAdminPersonalPolicies but semantically for agent production tracking
 * - Ensures agent only sees their originating policies (not manager/override roles)
 * - Safe for concurrent access (read-only)
 */
export async function getAgentOriginatingPolicies(agentId: number): Promise<(Policy & { 
  clientName?: string;
  originatingAgentId?: number;
})[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select({
      ...getTableColumns(policies),
      clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
      originatingAgentId: policyAgents.agentId,
    }).from(policies)
      .innerJoin(policyAgents, and(
        eq(policies.id, policyAgents.policyId),
        eq(policyAgents.role, 'primary'),
        eq(policyAgents.agentId, agentId)
      ))
      .leftJoin(clients, eq(policies.clientId, clients.id))
      .orderBy(desc(policies.createdAt));
    
    return result as any;
  } catch (error) {
    console.error("[DB] Error fetching agent originating policies:", error);
    return [];
  }
}

/**
 * Get all policies with originating agent metadata
 * Used for "Agency Overview" and admin policies tab with agent color-coding
 * 
 * @returns Array of all policies with originating agent ID attached
 * 
 * Stability Notes:
 * - Includes all policies, even those without an originating agent (edge case)
 * - Policies without originating agent will have originatingAgentId = null
 * - Used for admin dashboard to show all policies with agent attribution
 * - Safe for concurrent access (read-only)
 * - Can be filtered by originatingAgentId in application layer
 */
export async function getAllPoliciesWithOriginatingAgent(): Promise<(Policy & { 
  clientName?: string;
  agentId?: number | null;
  agentName?: string | null;
  agentColor?: string | null;
})[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select({
      ...getTableColumns(policies),
      clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
      agentId: policyAgents.agentId,
      agentName: sql<string>`CONCAT(${agents.firstName}, ' ', ${agents.lastName})`,
      agentColor: agents.color,
    }).from(policies)
      .leftJoin(clients, eq(policies.clientId, clients.id))
      .leftJoin(policyAgents, and(
        eq(policies.id, policyAgents.policyId),
        eq(policyAgents.role, 'primary')
      ))
      .leftJoin(agents, eq(policyAgents.agentId, agents.id))
      .orderBy(desc(policies.createdAt));
    
    return result as any;
  } catch (error) {
    console.error("[DB] Error fetching all policies with originating agent:", error);
    return [];
  }
}

/**
 * Get count of policies by originating agent
 * Used for dashboard KPI cards showing agent production counts
 * 
 * @returns Array of {agentId, agentName, agentColor, policyCount}
 * 
 * Stability Notes:
 * - Groups by originating agent only
 * - Excludes policies without originating agent
 * - Used for "Agent Production" KPI cards
 * - Safe for concurrent access (read-only)
 */
export async function getPoliciesCountByOriginatingAgent(): Promise<Array<{
  agentId: number;
  agentName: string;
  agentColor: string | null;
  policyCount: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select({
      agentId: policyAgents.agentId,
      agentName: sql<string>`CONCAT(${agents.firstName}, ' ', ${agents.lastName})`,
      agentColor: agents.color,
      policyCount: sql<number>`COUNT(DISTINCT ${policies.id})`,
    }).from(policies)
      .innerJoin(policyAgents, and(
        eq(policies.id, policyAgents.policyId),
        eq(policyAgents.role, 'primary')
      ))
      .innerJoin(agents, eq(policyAgents.agentId, agents.id))
      .groupBy(policyAgents.agentId, agents.id)
      .orderBy(desc(sql<number>`COUNT(DISTINCT ${policies.id})`));
    
    return result as any;
  } catch (error) {
    console.error("[DB] Error fetching policies count by originating agent:", error);
    return [];
  }
}

/**
 * Get total premium (AP) by originating agent
 * Used for dashboard KPI cards showing agent production premium
 * 
 * @returns Array of {agentId, agentName, agentColor, totalPremium}
 * 
 * Stability Notes:
 * - Sums yearlyAP for all active policies by originating agent
 * - Only includes policies with status='active'
 * - Handles null yearlyAP values (treats as 0)
 * - Safe for concurrent access (read-only)
 */
export async function getTotalPremiumByOriginatingAgent(): Promise<Array<{
  agentId: number;
  agentName: string;
  agentColor: string | null;
  totalPremium: number;
}>> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select({
      agentId: policyAgents.agentId,
      agentName: sql<string>`CONCAT(${agents.firstName}, ' ', ${agents.lastName})`,
      agentColor: agents.color,
      totalPremium: sql<number>`COALESCE(SUM(CAST(${policies.yearlyAP} AS DECIMAL(12,2))), 0)`,
    }).from(policies)
      .innerJoin(policyAgents, and(
        eq(policies.id, policyAgents.policyId),
        eq(policyAgents.role, 'primary')
      ))
      .innerJoin(agents, eq(policyAgents.agentId, agents.id))
      .where(eq(policies.status, 'active'))
      .groupBy(policyAgents.agentId, agents.id)
      .orderBy(desc(sql<number>`COALESCE(SUM(CAST(${policies.yearlyAP} AS DECIMAL(12,2))), 0)`));
    
    return result as any;
  } catch (error) {
    console.error("[DB] Error fetching total premium by originating agent:", error);
    return [];
  }
}


/**
 * Get agent sales for a specific month/year with agent metadata
 * Used for displaying agent sales in the admin dashboard
 */
export async function getAgentSalesByMonth(month: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  
  const allEntries = await db
    .select({
      id: salesEntries.id,
      agentId: salesEntries.agentId,
      clientName: salesEntries.clientName,
      carrier: salesEntries.carrier,
      product: salesEntries.product,
      premium: salesEntries.premium,
      annualPremium: salesEntries.annualPremium,
      commission: salesEntries.commission,
      saleDate: salesEntries.saleDate,
      policyType: salesEntries.policyType,
      status: salesEntries.status,
      notes: salesEntries.notes,
      month: salesEntries.month,
      year: salesEntries.year,
      agentFirstName: agents.firstName,
      agentLastName: agents.lastName,
      agentColor: agents.color,
    })
    .from(salesEntries)
    .innerJoin(agents, eq(salesEntries.agentId, agents.id))
    .orderBy(desc(salesEntries.saleDate));
  
  return allEntries.filter(entry => {
    if (!entry.saleDate) return false;
    // Only include agent sales (agentId is NOT NULL)
    if (!entry.agentId) return false;
    const entryDate = new Date(entry.saleDate);
    const entryMonth = entryDate.getMonth() + 1; // 1-12
    const entryYear = entryDate.getFullYear();
    return entryMonth === month && entryYear === year;
  }).map(entry => ({
    ...entry,
    agentName: `${entry.agentFirstName} ${entry.agentLastName}`,
  }));
}


/**
 * ============================================================================
 * CLIENT DOCUMENTS HELPERS
 * ============================================================================
 */

/**
 * Get all documents for a client (with visibility permissions)
 */
export async function getClientDocuments(clientId: number, userId?: number, userRole?: string) {
  const db = await getDb();
  if (!db) return [];
  const docs = await db
    .select()
    .from(clientDocuments)
    .where(eq(clientDocuments.clientId, clientId));

  // Filter based on user role
  if (userRole === "user") {
    // Clients can only see documents marked as visibleToClient
    return docs.filter((d) => d.visibleToClient === 1);
  }
  // Agents and admins can see all documents
  return docs;
}

/**
 * Get documents for a specific policy
 */
export async function getPolicyDocuments(policyId: number, clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(clientDocuments)
    .where(and(eq(clientDocuments.policyId, policyId), eq(clientDocuments.clientId, clientId)));
}

/**
 * Create a new document record
 */
export async function createClientDocument(data: InsertClientDocument) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(clientDocuments).values(data);
  return result;
}

/**
 * Delete a document
 */
export async function deleteClientDocument(documentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.delete(clientDocuments).where(eq(clientDocuments.id, documentId));
}

/**
 * ============================================================================
 * PAYMENT METHODS HELPERS
 * ============================================================================
 */

/**
 * Get all payment methods for a client
 */
export async function getClientPaymentMethods(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.clientId, clientId))
    .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt));
}

/**
 * Get default payment method for a client
 */
export async function getDefaultPaymentMethod(clientId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.clientId, clientId), eq(paymentMethods.isDefault, 1)))
    .limit(1);
  return result[0] || null;
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(data: InsertPaymentMethod) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(paymentMethods).values(data);
  return result;
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(id: number, data: Partial<InsertPaymentMethod>) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.update(paymentMethods).set(data).where(eq(paymentMethods.id, id));
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
}

/**
 * Set payment method as default
 */
export async function setDefaultPaymentMethod(clientId: number, paymentMethodId: number) {
  const db = await getDb();
  if (!db) return undefined;
  // First, unset all other default methods for this client
  await db
    .update(paymentMethods)
    .set({ isDefault: 0 })
    .where(eq(paymentMethods.clientId, clientId));

  // Then set the new default
  return await db
    .update(paymentMethods)
    .set({ isDefault: 1, lastUsedAt: Date.now() })
    .where(eq(paymentMethods.id, paymentMethodId));
}

/**
 * ============================================================================
 * PAYMENT HISTORY HELPERS
 * ============================================================================
 */

/**
 * Get payment history for a client
 */
export async function getClientPaymentHistory(clientId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.clientId, clientId))
    .orderBy(desc(paymentHistory.paymentDate))
    .limit(limit)
    .offset(offset);
}

/**
 * Get payment history for a specific policy
 */
export async function getPolicyPaymentHistory(policyId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(paymentHistory)
    .where(eq(paymentHistory.policyId, policyId))
    .orderBy(desc(paymentHistory.paymentDate))
    .limit(limit)
    .offset(offset);
}

/**
 * Create a new payment record
 */
export async function createPaymentRecord(data: InsertPaymentHistory) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(paymentHistory).values(data);
  return result;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded",
  metadata?: { processedAt?: number; confirmedAt?: number; failureReason?: string }
) {
  const db = await getDb();
  if (!db) return undefined;
  const updateData: any = { status };
  if (metadata?.processedAt) updateData.processedAt = metadata.processedAt;
  if (metadata?.confirmedAt) updateData.confirmedAt = metadata.confirmedAt;
  if (metadata?.failureReason) updateData.failureReason = metadata.failureReason;

  return await db.update(paymentHistory).set(updateData).where(eq(paymentHistory.id, paymentId));
}

/**
 * Get payment summary for a client
 */
export async function getPaymentSummary(clientId: number) {
  const db = await getDb();
  if (!db) return { completedPayments: { total: 0, count: 0 }, pendingPayments: { total: 0, count: 0 } };
  const completed = await db
    .select({
      totalAmount: sql`SUM(amount)`,
      count: sql`COUNT(*)`,
    })
    .from(paymentHistory)
    .where(
      and(
        eq(paymentHistory.clientId, clientId),
        eq(paymentHistory.status, "completed")
      )
    );

  const pending = await db
    .select({
      totalAmount: sql`SUM(amount)`,
      count: sql`COUNT(*)`,
    })
    .from(paymentHistory)
    .where(
      and(
        eq(paymentHistory.clientId, clientId),
        eq(paymentHistory.status, "pending")
      )
    );

  return {
    completedPayments: {
      total: completed[0]?.totalAmount || 0,
      count: completed[0]?.count || 0,
    },
    pendingPayments: {
      total: pending[0]?.totalAmount || 0,
      count: pending[0]?.count || 0,
    },
  };
}


/**
 * Get all PDFs ordered by displayOrder
 */
export async function getAllPDFs(): Promise<PDF[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(pdfs).orderBy(pdfs.displayOrder);
  } catch (error) {
    console.error("[Database] Failed to get PDFs:", error);
    return [];
  }
}

/**
 * Get PDFs by category
 */
export async function getPDFsByCategory(category: string): Promise<PDF[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(pdfs).where(eq(pdfs.category, category)).orderBy(pdfs.displayOrder);
  } catch (error) {
    console.error("[Database] Failed to get PDFs by category:", error);
    return [];
  }
}

/**
 * Get a single PDF by ID
 */
export async function getPDFById(id: number): Promise<PDF | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(pdfs).where(eq(pdfs.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get PDF by ID:", error);
    return null;
  }
}
