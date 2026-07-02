/**
 * Phase 1 Mock-Based Isolated Tests
 * 
 * Tests the policy segregation query LOGIC in isolation
 * Does NOT depend on database, vitest setup, or global test fixtures
 * Uses mock data to verify query logic correctness
 * 
 * File location: /phase1-mock.test.ts (root level to avoid global test discovery)
 */

import { describe, it, expect } from "vitest";

/**
 * Mock Data Structures
 */
interface MockAgent {
  id: number;
  firstName: string;
  lastName: string;
  color: string;
  agentStatus: string;
}

interface MockPolicy {
  id: number;
  policyNumber: string;
  type: string;
  annualPremium: string;
  clientId: number;
  status: string;
}

interface MockPolicyAgent {
  id: number;
  policyId: number;
  agentId: number;
  role: "originating" | "manager" | "override" | "servicing";
}

/**
 * Mock Query Implementations
 * These replicate the Phase 1 query logic without database dependency
 */

function getAdminPersonalPolicies(
  adminId: number,
  policies: MockPolicy[],
  policyAgents: MockPolicyAgent[]
): MockPolicy[] {
  const adminPolicyIds = new Set(
    policyAgents
      .filter((pa) => pa.agentId === adminId && pa.role === "originating")
      .map((pa) => pa.policyId)
  );

  return policies.filter((p) => adminPolicyIds.has(p.id));
}

function getAgentOriginatingPolicies(
  agentId: number,
  policies: MockPolicy[],
  policyAgents: MockPolicyAgent[]
): MockPolicy[] {
  const agentPolicyIds = new Set(
    policyAgents
      .filter((pa) => pa.agentId === agentId && pa.role === "originating")
      .map((pa) => pa.policyId)
  );

  return policies.filter((p) => agentPolicyIds.has(p.id));
}

function getAllPoliciesWithOriginatingAgent(
  policies: MockPolicy[],
  policyAgents: MockPolicyAgent[],
  agents: MockAgent[]
): any[] {
  return policies.map((policy) => {
    const originatingAgent = policyAgents.find(
      (pa) => pa.policyId === policy.id && pa.role === "originating"
    );

    const agent = originatingAgent
      ? agents.find((a) => a.id === originatingAgent.agentId)
      : null;

    return {
      id: policy.id,
      policyNumber: policy.policyNumber,
      type: policy.type,
      annualPremium: policy.annualPremium,
      agentId: agent?.id || null,
      agentName: agent ? `${agent.firstName} ${agent.lastName}` : "UNASSIGNED",
      agentColor: agent?.color || "default",
    };
  });
}

function getPoliciesCountByOriginatingAgent(
  policies: MockPolicy[],
  policyAgents: MockPolicyAgent[],
  agents: MockAgent[]
): any[] {
  const countMap = new Map<
    number,
    { agentId: number; agentName: string; policyCount: number }
  >();

  policyAgents
    .filter((pa) => pa.role === "originating")
    .forEach((pa) => {
      const agent = agents.find((a) => a.id === pa.agentId);
      if (agent) {
        const key = agent.id;
        const existing = countMap.get(key) || {
          agentId: agent.id,
          agentName: `${agent.firstName} ${agent.lastName}`,
          policyCount: 0,
        };
        existing.policyCount += 1;
        countMap.set(key, existing);
      }
    });

  return Array.from(countMap.values());
}

function getTotalPremiumByOriginatingAgent(
  policies: MockPolicy[],
  policyAgents: MockPolicyAgent[],
  agents: MockAgent[]
): any[] {
  const premiumMap = new Map<
    number,
    { agentId: number; agentName: string; totalPremium: number }
  >();

  policyAgents
    .filter((pa) => pa.role === "originating")
    .forEach((pa) => {
      const policy = policies.find((p) => p.id === pa.policyId);
      const agent = agents.find((a) => a.id === pa.agentId);

      if (policy && agent) {
        const key = agent.id;
        const premium = parseFloat(policy.annualPremium) || 0;
        const existing = premiumMap.get(key) || {
          agentId: agent.id,
          agentName: `${agent.firstName} ${agent.lastName}`,
          totalPremium: 0,
        };
        existing.totalPremium += premium;
        premiumMap.set(key, existing);
      }
    });

  return Array.from(premiumMap.values());
}

/**
 * Test Suite
 */

describe("Phase 1: Policy Segregation Query Logic (Mock-Based)", () => {
  // Mock data
  const mockAgents: MockAgent[] = [
    {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      color: "blue",
      agentStatus: "active",
    },
    {
      id: 5160001,
      firstName: "Nathan",
      lastName: "Faughn",
      color: "green",
      agentStatus: "active",
    },
    {
      id: 5160002,
      firstName: "Sarah",
      lastName: "Johnson",
      color: "red",
      agentStatus: "active",
    },
  ];

  const mockPolicies: MockPolicy[] = [
    {
      id: 1,
      policyNumber: "POL-001",
      type: "fixed_annuity",
      annualPremium: "50000.00",
      clientId: 1,
      status: "active",
    },
    {
      id: 2,
      policyNumber: "POL-002",
      type: "variable_annuity",
      annualPremium: "75000.00",
      clientId: 2,
      status: "active",
    },
    {
      id: 3,
      policyNumber: "POL-003",
      type: "life_insurance",
      annualPremium: "25000.00",
      clientId: 3,
      status: "active",
    },
    {
      id: 4,
      policyNumber: "POL-004",
      type: "fixed_annuity",
      annualPremium: "100000.00",
      clientId: 4,
      status: "active",
    },
    {
      id: 5,
      policyNumber: "POL-005",
      type: "life_insurance",
      annualPremium: "30000.00",
      clientId: 5,
      status: "active",
    },
  ];

  const mockPolicyAgents: MockPolicyAgent[] = [
    // Admin's policies
    { id: 1, policyId: 1, agentId: 1, role: "originating" },
    { id: 2, policyId: 2, agentId: 1, role: "originating" },

    // Nathan's policies
    { id: 3, policyId: 3, agentId: 5160001, role: "originating" },
    { id: 4, policyId: 4, agentId: 5160001, role: "originating" },

    // Sarah's policies
    { id: 5, policyId: 5, agentId: 5160002, role: "originating" },

    // Non-originating roles (should be ignored)
    { id: 6, policyId: 1, agentId: 5160001, role: "manager" },
    { id: 7, policyId: 2, agentId: 5160002, role: "servicing" },
  ];

  describe("getAdminPersonalPolicies", () => {
    it("should return only policies where admin is the originating agent", () => {
      const result = getAdminPersonalPolicies(1, mockPolicies, mockPolicyAgents);

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.policyNumber)).toEqual(["POL-001", "POL-002"]);
      expect(result[0].annualPremium).toBe("50000.00");
      expect(result[1].annualPremium).toBe("75000.00");
    });

    it("should exclude policies where admin is not the originating agent", () => {
      const result = getAdminPersonalPolicies(1, mockPolicies, mockPolicyAgents);

      const policyNumbers = result.map((p) => p.policyNumber);
      expect(policyNumbers).not.toContain("POL-003");
      expect(policyNumbers).not.toContain("POL-004");
      expect(policyNumbers).not.toContain("POL-005");
    });

    it("should exclude non-originating roles", () => {
      const result = getAdminPersonalPolicies(1, mockPolicies, mockPolicyAgents);

      expect(result).toHaveLength(2);
    });

    it("should return empty array if agent has no originating policies", () => {
      const result = getAdminPersonalPolicies(
        9999,
        mockPolicies,
        mockPolicyAgents
      );

      expect(result).toHaveLength(0);
    });
  });

  describe("getAgentOriginatingPolicies", () => {
    it("should return only policies where agent is the originating agent", () => {
      const result = getAgentOriginatingPolicies(
        5160001,
        mockPolicies,
        mockPolicyAgents
      );

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.policyNumber)).toEqual(["POL-003", "POL-004"]);
    });

    it("should segregate correctly between agents", () => {
      const nathanPolicies = getAgentOriginatingPolicies(
        5160001,
        mockPolicies,
        mockPolicyAgents
      );
      const sarahPolicies = getAgentOriginatingPolicies(
        5160002,
        mockPolicies,
        mockPolicyAgents
      );

      expect(nathanPolicies).toHaveLength(2);
      expect(sarahPolicies).toHaveLength(1);

      const nathanIds = new Set(nathanPolicies.map((p) => p.id));
      const sarahIds = new Set(sarahPolicies.map((p) => p.id));
      const overlap = [...nathanIds].filter((id) => sarahIds.has(id));

      expect(overlap).toHaveLength(0);
    });

    it("should exclude non-originating roles", () => {
      const result = getAgentOriginatingPolicies(
        5160001,
        mockPolicies,
        mockPolicyAgents
      );

      const policyNumbers = result.map((p) => p.policyNumber);
      expect(policyNumbers).not.toContain("POL-001");
    });
  });

  describe("getAllPoliciesWithOriginatingAgent", () => {
    it("should include agent metadata for all policies", () => {
      const result = getAllPoliciesWithOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      expect(result).toHaveLength(5);

      const adminPolicy = result.find((p) => p.id === 1);
      expect(adminPolicy).toEqual({
        id: 1,
        policyNumber: "POL-001",
        type: "fixed_annuity",
        annualPremium: "50000.00",
        agentId: 1,
        agentName: "Admin User",
        agentColor: "blue",
      });

      const nathanPolicy = result.find((p) => p.id === 3);
      expect(nathanPolicy).toEqual({
        id: 3,
        policyNumber: "POL-003",
        type: "life_insurance",
        annualPremium: "25000.00",
        agentId: 5160001,
        agentName: "Nathan Faughn",
        agentColor: "green",
      });
    });

    it("should handle unassigned policies (no originating agent)", () => {
      const policyWithoutAgent: MockPolicy = {
        id: 999,
        policyNumber: "POL-UNASSIGNED",
        type: "fixed_annuity",
        annualPremium: "10000.00",
        clientId: 999,
        status: "active",
      };

      const result = getAllPoliciesWithOriginatingAgent(
        [...mockPolicies, policyWithoutAgent],
        mockPolicyAgents,
        mockAgents
      );

      const unassignedPolicy = result.find((p) => p.id === 999);
      expect(unassignedPolicy?.agentName).toBe("UNASSIGNED");
      expect(unassignedPolicy?.agentColor).toBe("default");
    });

    it("should include color for dashboard color-coding", () => {
      const result = getAllPoliciesWithOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      const colors = result.map((p) => p.agentColor);
      expect(colors).toContain("blue");
      expect(colors).toContain("green");
      expect(colors).toContain("red");
    });
  });

  describe("getPoliciesCountByOriginatingAgent", () => {
    it("should return correct policy count per agent", () => {
      const result = getPoliciesCountByOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      expect(result).toHaveLength(3);

      const adminCount = result.find((r) => r.agentId === 1);
      expect(adminCount?.policyCount).toBe(2);

      const nathanCount = result.find((r) => r.agentId === 5160001);
      expect(nathanCount?.policyCount).toBe(2);

      const sarahCount = result.find((r) => r.agentId === 5160002);
      expect(sarahCount?.policyCount).toBe(1);
    });

    it("should exclude non-originating roles from count", () => {
      const result = getPoliciesCountByOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      const nathanCount = result.find((r) => r.agentId === 5160001);
      expect(nathanCount?.policyCount).toBe(2);
    });

    it("should not count agents with no originating policies", () => {
      const result = getPoliciesCountByOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      const agentIds = result.map((r) => r.agentId);
      expect(agentIds).not.toContain(9999);
    });
  });

  describe("getTotalPremiumByOriginatingAgent", () => {
    it("should calculate correct total premium per agent", () => {
      const result = getTotalPremiumByOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      expect(result).toHaveLength(3);

      const adminPremium = result.find((r) => r.agentId === 1);
      expect(adminPremium?.totalPremium).toBe(125000);

      const nathanPremium = result.find((r) => r.agentId === 5160001);
      expect(nathanPremium?.totalPremium).toBe(125000);

      const sarahPremium = result.find((r) => r.agentId === 5160002);
      expect(sarahPremium?.totalPremium).toBe(30000);
    });

    it("should exclude non-originating roles from premium calculation", () => {
      const result = getTotalPremiumByOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      const nathanPremium = result.find((r) => r.agentId === 5160001);
      expect(nathanPremium?.totalPremium).toBe(125000);
    });

    it("should handle zero premium correctly", () => {
      const policyZeroPremium: MockPolicy = {
        id: 100,
        policyNumber: "POL-ZERO",
        type: "fixed_annuity",
        annualPremium: "0.00",
        clientId: 100,
        status: "active",
      };

      const policyAgentZero: MockPolicyAgent = {
        id: 100,
        policyId: 100,
        agentId: 5160001,
        role: "originating",
      };

      const result = getTotalPremiumByOriginatingAgent(
        [...mockPolicies, policyZeroPremium],
        [...mockPolicyAgents, policyAgentZero],
        mockAgents
      );

      const nathanPremium = result.find((r) => r.agentId === 5160001);
      expect(nathanPremium?.totalPremium).toBe(125000);
    });
  });

  describe("Data Integrity Checks", () => {
    it("should not double-count policies between admin and agent queries", () => {
      const adminPolicies = getAdminPersonalPolicies(
        1,
        mockPolicies,
        mockPolicyAgents
      );
      const nathanPolicies = getAgentOriginatingPolicies(
        5160001,
        mockPolicies,
        mockPolicyAgents
      );

      const adminIds = new Set(adminPolicies.map((p) => p.id));
      const nathanIds = new Set(nathanPolicies.map((p) => p.id));

      const overlap = [...adminIds].filter((id) => nathanIds.has(id));

      expect(overlap).toHaveLength(0);
    });

    it("should have consistent agent metadata across all queries", () => {
      const allPolicies = getAllPoliciesWithOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );
      const countsByAgent = getPoliciesCountByOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );

      const agentIdsInPolicies = new Set(
        allPolicies
          .filter((p) => p.agentId !== null)
          .map((p) => p.agentId)
      );
      const agentIdsInCounts = new Set(countsByAgent.map((c) => c.agentId));

      const missingAgents = [...agentIdsInPolicies].filter(
        (id) => !agentIdsInCounts.has(id)
      );

      expect(missingAgents).toHaveLength(0);
    });

    it("should verify role-based filtering works correctly", () => {
      const originatingCount = mockPolicyAgents.filter(
        (pa) => pa.role === "originating"
      ).length;

      const result = getPoliciesCountByOriginatingAgent(
        mockPolicies,
        mockPolicyAgents,
        mockAgents
      );
      const totalFromQuery = result.reduce((sum, r) => sum + r.policyCount, 0);

      expect(totalFromQuery).toBe(originatingCount);
    });
  });
});
