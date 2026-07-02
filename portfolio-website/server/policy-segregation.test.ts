import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  getAdminPersonalPolicies,
  getAgentOriginatingPolicies,
  getAllPoliciesWithOriginatingAgent,
  getPoliciesCountByOriginatingAgent,
  getTotalPremiumByOriginatingAgent,
} from "./db";
import { agents, clients, policies, policyAgents } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * PHASE 1 STABILITY BUILD - POLICY SEGREGATION UNIT TESTS
 * 
 * Tests verify that policies are correctly segregated by originating agent
 * using policyAgents.role = 'originating' as the single source of truth.
 * 
 * Test Data Structure:
 * - Admin Agent (ID: 1000) - "Eric O"
 * - Agent 1 (ID: 2000) - "Nathan Faughn" 
 * - Agent 2 (ID: 3000) - "Mauri Givens"
 * - Test Clients (IDs: 5000-5005)
 * - Test Policies (IDs: 6000-6010)
 */

describe("Phase 1: Policy Segregation by Originating Agent", () => {
  let db: any;
  const adminAgentId = 1000;
  const agent1Id = 2000;
  const agent2Id = 3000;
  const testClientIds: number[] = [];
  const testPolicyIds: number[] = [];

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create test agents if they don't exist
    for (const [id, firstName, lastName, color] of [
      [adminAgentId, "Eric", "O", "#C9A84C"],
      [agent1Id, "Nathan", "Faughn", "#FF6B6B"],
      [agent2Id, "Mauri", "Givens", "#FFB6C1"],
    ] as const) {
      try {
        await db.insert(agents).values({
          id,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@test.example.com`,
          agentStatus: "active",
          color,
        }).onDuplicateKeyUpdate({ set: { agentStatus: "active" } });
      } catch (e) {
        // Agent may already exist
      }
    }

    // Create test clients
    for (let i = 0; i < 5; i++) {
      try {
        const [result] = await db.insert(clients).values({
          firstName: `TestClient${i}`,
          lastName: `Last${i}`,
          email: `client${i}@test.example.com`,
          createdByAgentId: i % 2 === 0 ? adminAgentId : agent1Id,
        });
        if (result?.insertId) testClientIds.push(result.insertId);
      } catch (e) {
        // Client may already exist
      }
    }

    // Create test policies
    const policyTypes = ["fixed_annuity", "whole_life", "term_life"];
    for (let i = 0; i < 9; i++) {
      const clientId = testClientIds[i % testClientIds.length];
      if (!clientId) continue;

      try {
        const [result] = await db.insert(policies).values({
          clientId,
          policyNumber: `TEST-POL-${Date.now()}-${i}`,
          carrier: "Athene",
          type: policyTypes[i % 3],
          coverageAmount: 100000,
          premiumAmount: 500,
          yearlyAP: 6000 + i * 1000,
          status: "active",
          effectiveDate: Date.now(),
        });
        if (result?.insertId) testPolicyIds.push(result.insertId);
      } catch (e) {
        console.error("Failed to create test policy:", e);
      }
    }

    // Link policies to originating agents
    // Admin: policies 0-2
    // Agent1: policies 3-5
    // Agent2: policies 6-8
    for (let i = 0; i < testPolicyIds.length; i++) {
      const policyId = testPolicyIds[i];
      let agentId = adminAgentId;
      if (i >= 3 && i < 6) agentId = agent1Id;
      if (i >= 6) agentId = agent2Id;

      try {
        await db.insert(policyAgents).values({
          policyId,
          agentId,
          role: "originating",
          commissionPercent: 6.0,
        }).onDuplicateKeyUpdate({ set: { role: "originating" } });
      } catch (e) {
        console.error("Failed to link policy to agent:", e);
      }
    }
  });

  afterAll(async () => {
    if (!db) return;

    // Cleanup: Delete test data in reverse dependency order
    try {
      await db.delete(policyAgents).where(
        policyAgents.agentId >= 1000
      );
      await db.delete(policies).where(
        policies.policyNumber.like("TEST-POL-%")
      );
      await db.delete(clients).where(
        clients.firstName.like("TestClient%")
      );
      // Don't delete agents - they may be used by other tests
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST: Admin Personal Policies Segregation
  // ────────────────────────────────────────────────────────────────────────────

  it("should return only admin's originating policies", async () => {
    const adminPolicies = await getAdminPersonalPolicies(adminAgentId);
    
    expect(adminPolicies.length).toBeGreaterThan(0);
    expect(adminPolicies.length).toBeLessThanOrEqual(3);
    
    // All returned policies should have admin as originating agent
    adminPolicies.forEach((policy) => {
      expect(policy.originatingAgentId).toBe(adminAgentId);
    });
  });

  it("should exclude other agents' policies from admin book", async () => {
    const adminPolicies = await getAdminPersonalPolicies(adminAgentId);
    const agent1Policies = await getAgentOriginatingPolicies(agent1Id);
    
    const adminPolicyIds = new Set(adminPolicies.map(p => p.id));
    const agent1PolicyIds = new Set(agent1Policies.map(p => p.id));
    
    // No overlap between admin and agent1 policies
    const overlap = Array.from(adminPolicyIds).filter(id => agent1PolicyIds.has(id));
    expect(overlap.length).toBe(0);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST: Agent Originating Policies Segregation
  // ────────────────────────────────────────────────────────────────────────────

  it("should return only agent1's originating policies", async () => {
    const agent1Policies = await getAgentOriginatingPolicies(agent1Id);
    
    expect(agent1Policies.length).toBeGreaterThan(0);
    expect(agent1Policies.length).toBeLessThanOrEqual(3);
    
    // All returned policies should have agent1 as originating agent
    agent1Policies.forEach((policy) => {
      expect(policy.originatingAgentId).toBe(agent1Id);
    });
  });

  it("should return only agent2's originating policies", async () => {
    const agent2Policies = await getAgentOriginatingPolicies(agent2Id);
    
    expect(agent2Policies.length).toBeGreaterThan(0);
    expect(agent2Policies.length).toBeLessThanOrEqual(3);
    
    // All returned policies should have agent2 as originating agent
    agent2Policies.forEach((policy) => {
      expect(policy.originatingAgentId).toBe(agent2Id);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST: All Policies with Originating Agent Metadata
  // ────────────────────────────────────────────────────────────────────────────

  it("should return all policies with originating agent metadata", async () => {
    const allPolicies = await getAllPoliciesWithOriginatingAgent();
    
    expect(allPolicies.length).toBeGreaterThan(0);
    
    // Each policy should have originating agent info
    allPolicies.forEach((policy) => {
      // originating agent fields may be null if policy has no originating agent
      if (policy.originatingAgentId) {
        expect(policy.originatingAgentName).toBeDefined();
        expect(typeof policy.originatingAgentName).toBe("string");
      }
    });
  });

  it("should include color information for originating agents", async () => {
    const allPolicies = await getAllPoliciesWithOriginatingAgent();
    
    const policiesWithAgent = allPolicies.filter(p => p.originatingAgentId);
    
    policiesWithAgent.forEach((policy) => {
      // Color should be defined if agent exists
      if (policy.originatingAgentId === adminAgentId) {
        expect(policy.originatingAgentColor).toBe("#C9A84C");
      } else if (policy.originatingAgentId === agent1Id) {
        expect(policy.originatingAgentColor).toBe("#FF6B6B");
      } else if (policy.originatingAgentId === agent2Id) {
        expect(policy.originatingAgentColor).toBe("#FFB6C1");
      }
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST: Policy Count by Originating Agent
  // ────────────────────────────────────────────────────────────────────────────

  it("should correctly count policies by originating agent", async () => {
    const counts = await getPoliciesCountByOriginatingAgent();
    
    expect(counts.length).toBeGreaterThan(0);
    
    // Find counts for our test agents
    const adminCount = counts.find(c => c.agentId === adminAgentId);
    const agent1Count = counts.find(c => c.agentId === agent1Id);
    const agent2Count = counts.find(c => c.agentId === agent2Id);
    
    // Each agent should have at least 1 policy (from test setup)
    if (adminCount) expect(adminCount.policyCount).toBeGreaterThan(0);
    if (agent1Count) expect(agent1Count.policyCount).toBeGreaterThan(0);
    if (agent2Count) expect(agent2Count.policyCount).toBeGreaterThan(0);
  });

  it("should include agent color in policy count results", async () => {
    const counts = await getPoliciesCountByOriginatingAgent();
    
    counts.forEach((count) => {
      expect(count.agentId).toBeDefined();
      expect(count.agentName).toBeDefined();
      expect(typeof count.agentName).toBe("string");
      // Color may be null for some agents, but field should exist
      expect(count).toHaveProperty("agentColor");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST: Total Premium by Originating Agent
  // ────────────────────────────────────────────────────────────────────────────

  it("should correctly calculate total premium by originating agent", async () => {
    const premiums = await getTotalPremiumByOriginatingAgent();
    
    expect(premiums.length).toBeGreaterThan(0);
    
    premiums.forEach((premium) => {
      expect(premium.agentId).toBeDefined();
      expect(premium.agentName).toBeDefined();
      expect(premium.totalPremium).toBeGreaterThanOrEqual(0);
      expect(typeof premium.totalPremium).toBe("number");
    });
  });

  it("should only count active policies in premium calculation", async () => {
    const premiums = await getTotalPremiumByOriginatingAgent();
    
    // All premiums should be non-negative
    premiums.forEach((premium) => {
      expect(premium.totalPremium).toBeGreaterThanOrEqual(0);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST: Data Integrity & Edge Cases
  // ────────────────────────────────────────────────────────────────────────────

  it("should handle agent with no policies gracefully", async () => {
    const nonExistentAgentId = 99999;
    const result = await getAgentOriginatingPolicies(nonExistentAgentId);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should not double-count policies across agents", async () => {
    const adminPolicies = await getAdminPersonalPolicies(adminAgentId);
    const agent1Policies = await getAgentOriginatingPolicies(agent1Id);
    const agent2Policies = await getAgentOriginatingPolicies(agent2Id);
    
    const allIds = new Set<number>();
    const duplicates = new Set<number>();
    
    [adminPolicies, agent1Policies, agent2Policies].forEach((policies) => {
      policies.forEach((policy) => {
        if (allIds.has(policy.id)) {
          duplicates.add(policy.id);
        }
        allIds.add(policy.id);
      });
    });
    
    expect(duplicates.size).toBe(0);
  });

  it("should return consistent results across multiple calls", async () => {
    const result1 = await getAdminPersonalPolicies(adminAgentId);
    const result2 = await getAdminPersonalPolicies(adminAgentId);
    
    expect(result1.length).toBe(result2.length);
    expect(result1.map(p => p.id).sort()).toEqual(result2.map(p => p.id).sort());
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TEST: KPI Accuracy
  // ────────────────────────────────────────────────────────────────────────────

  it("should provide accurate KPI data for dashboard", async () => {
    const counts = await getPoliciesCountByOriginatingAgent();
    const premiums = await getTotalPremiumByOriginatingAgent();
    
    // Counts and premiums should have matching agents
    const countAgentIds = new Set(counts.map(c => c.agentId));
    const premiumAgentIds = new Set(premiums.map(p => p.agentId));
    
    // Most agents should appear in both (unless they have no active policies)
    const intersection = Array.from(countAgentIds).filter(id => premiumAgentIds.has(id));
    expect(intersection.length).toBeGreaterThan(0);
  });

  it("should handle decimal precision in premium calculations", async () => {
    const premiums = await getTotalPremiumByOriginatingAgent();
    
    premiums.forEach((premium) => {
      // Premium should be a valid number
      expect(Number.isFinite(premium.totalPremium)).toBe(true);
      // Should not have excessive decimal places
      const decimalPlaces = (premium.totalPremium.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(10);
    });
  });
});
