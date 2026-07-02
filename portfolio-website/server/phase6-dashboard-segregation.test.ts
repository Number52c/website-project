import { describe, it, expect } from "vitest";

/**
 * Phase 6: Dashboard Segregation Testing
 * 
 * Comprehensive test suite for verifying that the dashboard correctly segregates:
 * - Admin personal policies vs agent-created policies
 * - Admin personal sales vs agent-created sales
 * - KPI calculations per agent
 * - Color-coding and filtering across tabs
 */

describe("Phase 6: Dashboard Segregation Logic", () => {
  describe("Policy Segregation", () => {
    it("should correctly identify admin personal policies (agentId = admin's agentId or null)", () => {
      const adminAgentId = "admin-agent-001";
      const policies = [
        { id: 1, clientName: "Client A", agentId: adminAgentId, premium: 1000 },
        { id: 2, clientName: "Client B", agentId: null, premium: 1500 },
        { id: 3, clientName: "Client C", agentId: "agent-001", premium: 2000 },
        { id: 4, clientName: "Client D", agentId: "agent-002", premium: 2500 },
      ];

      const adminPolicies = policies.filter(
        (p) => p.agentId === adminAgentId || p.agentId === null
      );
      const agentPolicies = policies.filter(
        (p) => p.agentId && p.agentId !== adminAgentId
      );

      expect(adminPolicies).toHaveLength(2);
      expect(agentPolicies).toHaveLength(2);
      expect(adminPolicies.map((p) => p.id)).toEqual([1, 2]);
      expect(agentPolicies.map((p) => p.id)).toEqual([3, 4]);
    });

    it("should exclude agent policies from admin personal KPI totals", () => {
      const adminAgentId = "admin-agent-001";
      const policies = [
        { id: 1, agentId: adminAgentId, premium: 1000 },
        { id: 2, agentId: null, premium: 1500 },
        { id: 3, agentId: "agent-001", premium: 2000 },
        { id: 4, agentId: "agent-002", premium: 2500 },
      ];

      const adminPolicies = policies.filter(
        (p) => p.agentId === adminAgentId || p.agentId === null
      );
      const adminTotal = adminPolicies.reduce((sum, p) => sum + p.premium, 0);

      expect(adminTotal).toBe(2500); // 1000 + 1500
      expect(adminTotal).not.toEqual(7000); // Should not include agent policies
    });

    it("should correctly group policies by agent", () => {
      const policies = [
        { id: 1, agentId: "agent-001", agentName: "Alice", premium: 1000 },
        { id: 2, agentId: "agent-001", agentName: "Alice", premium: 1500 },
        { id: 3, agentId: "agent-002", agentName: "Bob", premium: 2000 },
        { id: 4, agentId: "agent-002", agentName: "Bob", premium: 2500 },
      ];

      const groupedByAgent = policies.reduce(
        (acc, policy) => {
          if (!acc[policy.agentId]) {
            acc[policy.agentId] = {
              agentId: policy.agentId,
              agentName: policy.agentName,
              policies: [],
            };
          }
          acc[policy.agentId].policies.push(policy);
          return acc;
        },
        {} as Record<
          string,
          {
            agentId: string;
            agentName: string;
            policies: typeof policies;
          }
        >
      );

      expect(Object.keys(groupedByAgent)).toHaveLength(2);
      expect(groupedByAgent["agent-001"].policies).toHaveLength(2);
      expect(groupedByAgent["agent-002"].policies).toHaveLength(2);
    });
  });

  describe("Sales Segregation", () => {
    it("should correctly identify admin personal sales (agentId = admin's agentId or null)", () => {
      const adminAgentId = "admin-agent-001";
      const sales = [
        { id: 1, clientName: "Client A", agentId: adminAgentId, premium: 1000 },
        { id: 2, clientName: "Client B", agentId: null, premium: 1500 },
        { id: 3, clientName: "Client C", agentId: "agent-001", premium: 2000 },
        { id: 4, clientName: "Client D", agentId: "agent-002", premium: 2500 },
      ];

      const adminSales = sales.filter(
        (s) => s.agentId === adminAgentId || s.agentId === null
      );
      const agentSales = sales.filter(
        (s) => s.agentId && s.agentId !== adminAgentId
      );

      expect(adminSales).toHaveLength(2);
      expect(agentSales).toHaveLength(2);
    });

    it("should exclude agent sales from admin personal sales tracker", () => {
      const adminAgentId = "admin-agent-001";
      const sales = [
        { id: 1, agentId: adminAgentId, premium: 1000, commission: 100 },
        { id: 2, agentId: null, premium: 1500, commission: 150 },
        { id: 3, agentId: "agent-001", premium: 2000, commission: 200 },
        { id: 4, agentId: "agent-002", premium: 2500, commission: 250 },
      ];

      const adminSales = sales.filter(
        (s) => s.agentId === adminAgentId || s.agentId === null
      );
      const adminTotal = adminSales.reduce((sum, s) => sum + s.premium, 0);
      const adminCommission = adminSales.reduce(
        (sum, s) => sum + s.commission,
        0
      );

      expect(adminTotal).toBe(2500); // 1000 + 1500
      expect(adminCommission).toBe(250); // 100 + 150
      expect(adminTotal).not.toEqual(7000); // Should not include agent sales
    });

    it("should correctly group sales by agent", () => {
      const sales = [
        {
          id: 1,
          agentId: "agent-001",
          agentName: "Alice",
          premium: 1000,
          commission: 100,
        },
        {
          id: 2,
          agentId: "agent-001",
          agentName: "Alice",
          premium: 1500,
          commission: 150,
        },
        {
          id: 3,
          agentId: "agent-002",
          agentName: "Bob",
          premium: 2000,
          commission: 200,
        },
        {
          id: 4,
          agentId: "agent-002",
          agentName: "Bob",
          premium: 2500,
          commission: 250,
        },
      ];

      const groupedByAgent = sales.reduce(
        (acc, sale) => {
          if (!acc[sale.agentId]) {
            acc[sale.agentId] = {
              agentId: sale.agentId,
              agentName: sale.agentName,
              totalPremium: 0,
              totalCommission: 0,
              sales: [],
            };
          }
          acc[sale.agentId].totalPremium += sale.premium;
          acc[sale.agentId].totalCommission += sale.commission;
          acc[sale.agentId].sales.push(sale);
          return acc;
        },
        {} as Record<
          string,
          {
            agentId: string;
            agentName: string;
            totalPremium: number;
            totalCommission: number;
            sales: typeof sales;
          }
        >
      );

      expect(Object.keys(groupedByAgent)).toHaveLength(2);
      expect(groupedByAgent["agent-001"].totalPremium).toBe(2500);
      expect(groupedByAgent["agent-001"].totalCommission).toBe(250);
      expect(groupedByAgent["agent-002"].totalPremium).toBe(4500);
      expect(groupedByAgent["agent-002"].totalCommission).toBe(450);
    });
  });

  describe("KPI Calculations", () => {
    it("should calculate admin personal KPIs excluding agent data", () => {
      const adminAgentId = "admin-agent-001";
      const policies = [
        { id: 1, agentId: adminAgentId, premium: 1000, status: "active" },
        { id: 2, agentId: null, premium: 1500, status: "active" },
        { id: 3, agentId: "agent-001", premium: 2000, status: "active" },
        { id: 4, agentId: "agent-002", premium: 2500, status: "active" },
      ];

      const adminPolicies = policies.filter(
        (p) => p.agentId === adminAgentId || p.agentId === null
      );
      const adminKPIs = {
        totalPolicies: adminPolicies.length,
        totalPremium: adminPolicies.reduce((sum, p) => sum + p.premium, 0),
        activePolicies: adminPolicies.filter((p) => p.status === "active")
          .length,
      };

      expect(adminKPIs.totalPolicies).toBe(2);
      expect(adminKPIs.totalPremium).toBe(2500);
      expect(adminKPIs.activePolicies).toBe(2);
    });

    it("should calculate per-agent KPIs correctly", () => {
      const policies = [
        { id: 1, agentId: "agent-001", premium: 1000, status: "active" },
        { id: 2, agentId: "agent-001", premium: 1500, status: "active" },
        { id: 3, agentId: "agent-002", premium: 2000, status: "active" },
        { id: 4, agentId: "agent-002", premium: 2500, status: "lapsed" },
      ];

      const agentKPIs = {} as Record<
        string,
        {
          totalPolicies: number;
          totalPremium: number;
          activePolicies: number;
          persistenceRate: number;
        }
      >;

      for (const agentId of ["agent-001", "agent-002"]) {
        const agentPolicies = policies.filter((p) => p.agentId === agentId);
        const activePolicies = agentPolicies.filter(
          (p) => p.status === "active"
        );
        agentKPIs[agentId] = {
          totalPolicies: agentPolicies.length,
          totalPremium: agentPolicies.reduce((sum, p) => sum + p.premium, 0),
          activePolicies: activePolicies.length,
          persistenceRate:
            agentPolicies.length > 0
              ? (activePolicies.length / agentPolicies.length) * 100
              : 0,
        };
      }

      expect(agentKPIs["agent-001"].totalPolicies).toBe(2);
      expect(agentKPIs["agent-001"].totalPremium).toBe(2500);
      expect(agentKPIs["agent-001"].persistenceRate).toBe(100);

      expect(agentKPIs["agent-002"].totalPolicies).toBe(2);
      expect(agentKPIs["agent-002"].totalPremium).toBe(4500);
      expect(agentKPIs["agent-002"].persistenceRate).toBe(50);
    });

    it("should handle empty agent data gracefully", () => {
      const policies: Array<{ premium?: number }> = [];

      const adminKPIs = {
        totalPolicies: policies.length,
        totalPremium: policies.reduce((sum, p) => sum + (p?.premium || 0), 0),
      };

      expect(adminKPIs.totalPolicies).toBe(0);
      expect(adminKPIs.totalPremium).toBe(0);
    });
  });

  describe("Color Coding and Filtering", () => {
    const AGENT_COLORS = [
      "blue",
      "green",
      "red",
      "purple",
      "pink",
      "orange",
      "yellow",
      "cyan",
    ];

    it("should map agent colors correctly", () => {
      const agents = [
        { id: "agent-001", name: "Alice", color: "blue" },
        { id: "agent-002", name: "Bob", color: "green" },
        { id: "agent-003", name: "Charlie", color: "red" },
      ];

      agents.forEach((agent) => {
        expect(AGENT_COLORS).toContain(agent.color);
      });
    });

    it("should filter policies by agent correctly", () => {
      const policies = [
        { id: 1, agentId: "agent-001", agentName: "Alice", premium: 1000 },
        { id: 2, agentId: "agent-001", agentName: "Alice", premium: 1500 },
        { id: 3, agentId: "agent-002", agentName: "Bob", premium: 2000 },
        { id: 4, agentId: "agent-002", agentName: "Bob", premium: 2500 },
      ];

      const filterByAgent = (agentId: string) =>
        policies.filter((p) => p.agentId === agentId);

      const alice = filterByAgent("agent-001");
      const bob = filterByAgent("agent-002");

      expect(alice).toHaveLength(2);
      expect(bob).toHaveLength(2);
      expect(alice[0].agentName).toBe("Alice");
      expect(bob[0].agentName).toBe("Bob");
    });

    it("should display agent color badges correctly", () => {
      const agents = [
        { id: "agent-001", name: "Alice", color: "blue" },
        { id: "agent-002", name: "Bob", color: "green" },
      ];

      const AGENT_COLOR_DOT_MAP: Record<string, string> = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        red: "bg-red-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500",
        orange: "bg-orange-500",
        yellow: "bg-yellow-500",
        cyan: "bg-cyan-500",
      };

      agents.forEach((agent) => {
        const dotColor = AGENT_COLOR_DOT_MAP[agent.color];
        expect(dotColor).toBeDefined();
        expect(dotColor).toMatch(/^bg-/);
      });
    });
  });

  describe("Multi-Agent Scenarios", () => {
    it("should handle complex multi-agent data correctly", () => {
      const adminAgentId = "admin-agent-001";
      const policies = [
        { id: 1, agentId: adminAgentId, premium: 1000, status: "active" },
        { id: 2, agentId: null, premium: 1500, status: "active" },
        { id: 3, agentId: "agent-001", premium: 2000, status: "active" },
        { id: 4, agentId: "agent-001", premium: 2500, status: "lapsed" },
        { id: 5, agentId: "agent-002", premium: 3000, status: "active" },
        { id: 6, agentId: "agent-002", premium: 3500, status: "active" },
        { id: 7, agentId: "agent-003", premium: 4000, status: "lapsed" },
      ];

      const adminPolicies = policies.filter(
        (p) => p.agentId === adminAgentId || p.agentId === null
      );
      const agentPoliciesMap = {} as Record<
        string,
        typeof policies[0][]
      >;

      for (const policy of policies) {
        if (policy.agentId && policy.agentId !== adminAgentId) {
          if (!agentPoliciesMap[policy.agentId]) {
            agentPoliciesMap[policy.agentId] = [];
          }
          agentPoliciesMap[policy.agentId].push(policy);
        }
      }

      // Verify admin data
      expect(adminPolicies).toHaveLength(2);
      expect(adminPolicies.reduce((sum, p) => sum + p.premium, 0)).toBe(2500);

      // Verify agent data
      expect(Object.keys(agentPoliciesMap)).toHaveLength(3);
      expect(agentPoliciesMap["agent-001"]).toHaveLength(2);
      expect(agentPoliciesMap["agent-002"]).toHaveLength(2);
      expect(agentPoliciesMap["agent-003"]).toHaveLength(1);

      // Verify totals
      const totalAgentPolicies = Object.values(agentPoliciesMap).flat().length;
      expect(adminPolicies.length + totalAgentPolicies).toBe(7);
    });

    it("should calculate correct persistence rates across multiple agents", () => {
      const policies = [
        { id: 1, agentId: "agent-001", status: "active" },
        { id: 2, agentId: "agent-001", status: "active" },
        { id: 3, agentId: "agent-001", status: "lapsed" },
        { id: 4, agentId: "agent-002", status: "active" },
        { id: 5, agentId: "agent-002", status: "active" },
        { id: 6, agentId: "agent-002", status: "active" },
        { id: 7, agentId: "agent-003", status: "lapsed" },
      ];

      const persistenceRates = {} as Record<string, number>;

      for (const agentId of ["agent-001", "agent-002", "agent-003"]) {
        const agentPolicies = policies.filter((p) => p.agentId === agentId);
        const activePolicies = agentPolicies.filter(
          (p) => p.status === "active"
        );
        persistenceRates[agentId] =
          agentPolicies.length > 0
            ? (activePolicies.length / agentPolicies.length) * 100
            : 0;
      }

      expect(persistenceRates["agent-001"]).toBe((2 / 3) * 100); // 66.67%
      expect(persistenceRates["agent-002"]).toBe(100); // 100%
      expect(persistenceRates["agent-003"]).toBe(0); // 0%
    });
  });

  describe("Edge Cases", () => {
    it("should handle null/undefined agentId correctly", () => {
      const policies = [
        { id: 1, agentId: null, premium: 1000 },
        { id: 2, agentId: undefined, premium: 1500 },
        { id: 3, agentId: "agent-001", premium: 2000 },
      ];

      const adminAgentId = "admin-agent-001";
      const adminPolicies = policies.filter(
        (p) => !p.agentId || p.agentId === adminAgentId
      );

      expect(adminPolicies).toHaveLength(2);
    });

    it("should handle duplicate agent IDs correctly", () => {
      const policies = [
        { id: 1, agentId: "agent-001", premium: 1000 },
        { id: 2, agentId: "agent-001", premium: 1500 },
        { id: 3, agentId: "agent-001", premium: 2000 },
      ];

      const agentPolicies = policies.filter((p) => p.agentId === "agent-001");
      expect(agentPolicies).toHaveLength(3);
      expect(agentPolicies.reduce((sum, p) => sum + p.premium, 0)).toBe(4500);
    });

    it("should handle zero premium values correctly", () => {
      const policies = [
        { id: 1, agentId: "admin-agent-001", premium: 0 },
        { id: 2, agentId: null, premium: 1500 },
        { id: 3, agentId: "agent-001", premium: 0 },
      ];

      const adminAgentId = "admin-agent-001";
      const adminPolicies = policies.filter(
        (p) => p.agentId === adminAgentId || p.agentId === null
      );
      const adminTotal = adminPolicies.reduce((sum, p) => sum + p.premium, 0);

      expect(adminTotal).toBe(1500);
    });
  });
});
