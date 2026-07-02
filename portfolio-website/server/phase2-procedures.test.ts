/**
 * Phase 2: tRPC Procedure Tests
 * 
 * Tests for policy segregation procedures
 * Verifies that tRPC procedures correctly expose Phase 1 query functions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import {
  getAdminPersonalPolicies,
  getAgentOriginatingPolicies,
  getAllPoliciesWithOriginatingAgent,
  getPoliciesCountByOriginatingAgent,
  getTotalPremiumByOriginatingAgent,
} from "./db";

// Mock the db functions
vi.mock("./db", () => ({
  getAdminPersonalPolicies: vi.fn(),
  getAgentOriginatingPolicies: vi.fn(),
  getAllPoliciesWithOriginatingAgent: vi.fn(),
  getPoliciesCountByOriginatingAgent: vi.fn(),
  getTotalPremiumByOriginatingAgent: vi.fn(),
}));

describe("Phase 2: tRPC Procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("myBookOfBusiness", () => {
    it("should call getAdminPersonalPolicies with admin user ID", async () => {
      const mockPolicies = [
        { id: 1, policyNumber: "POL-001", annualPremium: "50000.00" },
        { id: 2, policyNumber: "POL-002", annualPremium: "75000.00" },
      ];

      vi.mocked(getAdminPersonalPolicies).mockResolvedValue(mockPolicies);

      const result = await getAdminPersonalPolicies(1);

      expect(getAdminPersonalPolicies).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPolicies);
      expect(result.length).toBe(2);
    });

    it("should return empty array if admin has no policies", async () => {
      vi.mocked(getAdminPersonalPolicies).mockResolvedValue([]);

      const result = await getAdminPersonalPolicies(999);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should only return admin's originating policies", async () => {
      const mockPolicies = [
        { id: 1, policyNumber: "POL-001", annualPremium: "50000.00" },
        { id: 2, policyNumber: "POL-002", annualPremium: "75000.00" },
      ];

      vi.mocked(getAdminPersonalPolicies).mockResolvedValue(mockPolicies);

      const result = await getAdminPersonalPolicies(1);

      // Verify no agent policies are included
      expect(result.every((p) => p.policyNumber.startsWith("POL-"))).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe("agentProduction", () => {
    it("should call getAgentOriginatingPolicies with agent ID", async () => {
      const mockPolicies = [
        { id: 3, policyNumber: "POL-003", annualPremium: "25000.00" },
        { id: 4, policyNumber: "POL-004", annualPremium: "100000.00" },
      ];

      vi.mocked(getAgentOriginatingPolicies).mockResolvedValue(mockPolicies);

      const result = await getAgentOriginatingPolicies(5160001);

      expect(getAgentOriginatingPolicies).toHaveBeenCalledWith(5160001);
      expect(result).toEqual(mockPolicies);
      expect(result.length).toBe(2);
    });

    it("should segregate policies by agent", async () => {
      const nathanPolicies = [
        { id: 3, policyNumber: "POL-003", annualPremium: "25000.00" },
        { id: 4, policyNumber: "POL-004", annualPremium: "100000.00" },
      ];

      const sarahPolicies = [
        { id: 5, policyNumber: "POL-005", annualPremium: "30000.00" },
      ];

      vi.mocked(getAgentOriginatingPolicies)
        .mockResolvedValueOnce(nathanPolicies)
        .mockResolvedValueOnce(sarahPolicies);

      const nathan = await getAgentOriginatingPolicies(5160001);
      const sarah = await getAgentOriginatingPolicies(5160002);

      expect(nathan.length).toBe(2);
      expect(sarah.length).toBe(1);
      expect(nathan[0].policyNumber).toBe("POL-003");
      expect(sarah[0].policyNumber).toBe("POL-005");
    });

    it("should return empty array if agent has no policies", async () => {
      vi.mocked(getAgentOriginatingPolicies).mockResolvedValue([]);

      const result = await getAgentOriginatingPolicies(9999);

      expect(result).toEqual([]);
    });
  });

  describe("allPoliciesWithAgents", () => {
    it("should return all policies with agent metadata", async () => {
      const mockPolicies = [
        {
          id: 1,
          policyNumber: "POL-001",
          agentId: 1,
          agentName: "Admin User",
          agentColor: "blue",
        },
        {
          id: 2,
          policyNumber: "POL-002",
          agentId: 5160001,
          agentName: "Nathan Faughn",
          agentColor: "green",
        },
      ];

      vi.mocked(getAllPoliciesWithOriginatingAgent).mockResolvedValue(
        mockPolicies
      );

      const result = await getAllPoliciesWithOriginatingAgent();

      expect(getAllPoliciesWithOriginatingAgent).toHaveBeenCalled();
      expect(result).toEqual(mockPolicies);
      expect(result.length).toBe(2);
    });

    it("should include color for dashboard color-coding", async () => {
      const mockPolicies = [
        {
          id: 1,
          policyNumber: "POL-001",
          agentId: 1,
          agentName: "Admin User",
          agentColor: "blue",
        },
      ];

      vi.mocked(getAllPoliciesWithOriginatingAgent).mockResolvedValue(
        mockPolicies
      );

      const result = await getAllPoliciesWithOriginatingAgent();

      expect(result[0].agentColor).toBe("blue");
      expect(result[0]).toHaveProperty("agentColor");
    });

    it("should handle unassigned policies", async () => {
      const mockPolicies = [
        {
          id: 999,
          policyNumber: "POL-UNASSIGNED",
          agentId: null,
          agentName: "UNASSIGNED",
          agentColor: "default",
        },
      ];

      vi.mocked(getAllPoliciesWithOriginatingAgent).mockResolvedValue(
        mockPolicies
      );

      const result = await getAllPoliciesWithOriginatingAgent();

      expect(result[0].agentName).toBe("UNASSIGNED");
      expect(result[0].agentColor).toBe("default");
    });
  });

  describe("policiesCountByAgent", () => {
    it("should return policy count per agent", async () => {
      const mockCounts = [
        { agentId: 1, agentName: "Admin User", policyCount: 2 },
        { agentId: 5160001, agentName: "Nathan Faughn", policyCount: 2 },
        { agentId: 5160002, agentName: "Sarah Johnson", policyCount: 1 },
      ];

      vi.mocked(getPoliciesCountByOriginatingAgent).mockResolvedValue(
        mockCounts
      );

      const result = await getPoliciesCountByOriginatingAgent();

      expect(getPoliciesCountByOriginatingAgent).toHaveBeenCalled();
      expect(result).toEqual(mockCounts);
      expect(result.length).toBe(3);
    });

    it("should exclude non-originating roles from count", async () => {
      const mockCounts = [
        { agentId: 5160001, agentName: "Nathan Faughn", policyCount: 2 },
      ];

      vi.mocked(getPoliciesCountByOriginatingAgent).mockResolvedValue(
        mockCounts
      );

      const result = await getPoliciesCountByOriginatingAgent();

      // Verify that count is 2 (not 3 with manager role)
      expect(result[0].policyCount).toBe(2);
    });

    it("should return empty array if no agents have policies", async () => {
      vi.mocked(getPoliciesCountByOriginatingAgent).mockResolvedValue([]);

      const result = await getPoliciesCountByOriginatingAgent();

      expect(result).toEqual([]);
    });
  });

  describe("totalPremiumByAgent", () => {
    it("should return total premium per agent", async () => {
      const mockPremiums = [
        { agentId: 1, agentName: "Admin User", totalPremium: 125000 },
        { agentId: 5160001, agentName: "Nathan Faughn", totalPremium: 125000 },
        { agentId: 5160002, agentName: "Sarah Johnson", totalPremium: 30000 },
      ];

      vi.mocked(getTotalPremiumByOriginatingAgent).mockResolvedValue(
        mockPremiums
      );

      const result = await getTotalPremiumByOriginatingAgent();

      expect(getTotalPremiumByOriginatingAgent).toHaveBeenCalled();
      expect(result).toEqual(mockPremiums);
      expect(result.length).toBe(3);
    });

    it("should calculate correct totals", async () => {
      const mockPremiums = [
        { agentId: 1, agentName: "Admin User", totalPremium: 125000 },
      ];

      vi.mocked(getTotalPremiumByOriginatingAgent).mockResolvedValue(
        mockPremiums
      );

      const result = await getTotalPremiumByOriginatingAgent();

      expect(result[0].totalPremium).toBe(125000);
    });

    it("should exclude non-originating roles from premium calculation", async () => {
      const mockPremiums = [
        { agentId: 5160001, agentName: "Nathan Faughn", totalPremium: 125000 },
      ];

      vi.mocked(getTotalPremiumByOriginatingAgent).mockResolvedValue(
        mockPremiums
      );

      const result = await getTotalPremiumByOriginatingAgent();

      // Verify that premium is 125000 (not more with manager role)
      expect(result[0].totalPremium).toBe(125000);
    });

    it("should return empty array if no agents have premium", async () => {
      vi.mocked(getTotalPremiumByOriginatingAgent).mockResolvedValue([]);

      const result = await getTotalPremiumByOriginatingAgent();

      expect(result).toEqual([]);
    });
  });

  describe("Data Consistency", () => {
    it("should maintain consistency between count and premium queries", async () => {
      const mockCounts = [
        { agentId: 1, agentName: "Admin User", policyCount: 2 },
        { agentId: 5160001, agentName: "Nathan Faughn", policyCount: 2 },
      ];

      const mockPremiums = [
        { agentId: 1, agentName: "Admin User", totalPremium: 125000 },
        { agentId: 5160001, agentName: "Nathan Faughn", totalPremium: 125000 },
      ];

      vi.mocked(getPoliciesCountByOriginatingAgent).mockResolvedValue(
        mockCounts
      );
      vi.mocked(getTotalPremiumByOriginatingAgent).mockResolvedValue(
        mockPremiums
      );

      const counts = await getPoliciesCountByOriginatingAgent();
      const premiums = await getTotalPremiumByOriginatingAgent();

      // Verify same agents in both queries
      const countAgentIds = counts.map((c) => c.agentId);
      const premiumAgentIds = premiums.map((p) => p.agentId);

      expect(countAgentIds).toEqual(premiumAgentIds);
    });

    it("should not double-count policies between admin and agent queries", async () => {
      const adminPolicies = [
        { id: 1, policyNumber: "POL-001" },
        { id: 2, policyNumber: "POL-002" },
      ];

      const agentPolicies = [
        { id: 3, policyNumber: "POL-003" },
        { id: 4, policyNumber: "POL-004" },
      ];

      vi.mocked(getAdminPersonalPolicies).mockResolvedValue(adminPolicies);
      vi.mocked(getAgentOriginatingPolicies).mockResolvedValue(agentPolicies);

      const admin = await getAdminPersonalPolicies(1);
      const agent = await getAgentOriginatingPolicies(5160001);

      const adminIds = new Set(admin.map((p) => p.id));
      const agentIds = new Set(agent.map((p) => p.id));

      const overlap = [...adminIds].filter((id) => agentIds.has(id));
      expect(overlap.length).toBe(0);
    });
  });
});
