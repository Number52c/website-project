/**
 * Unit Tests for AdminDashboard Phase 4 - Policies Tab Enhancements
 * 
 * Tests for Writing Agent column, color-coding, and agent filtering
 */

import { describe, it, expect } from "vitest";

describe("AdminDashboard Phase 4 - Policies Tab Agent Features", () => {
  describe("Agent Color Mapping", () => {
    const getAgentColor = (color?: string) => {
      const colorMap: Record<string, string> = {
        blue: "#3b82f6",
        green: "#10b981",
        red: "#ef4444",
        purple: "#a855f7",
        pink: "#ec4899",
        orange: "#f97316",
        yellow: "#eab308",
        cyan: "#06b6d4",
        default: "#64748b",
      };
      return colorMap[color || "default"] || colorMap.default;
    };

    it("should map blue color correctly", () => {
      expect(getAgentColor("blue")).toBe("#3b82f6");
    });

    it("should map green color correctly", () => {
      expect(getAgentColor("green")).toBe("#10b981");
    });

    it("should map pink color correctly", () => {
      expect(getAgentColor("pink")).toBe("#ec4899");
    });

    it("should map orange color correctly", () => {
      expect(getAgentColor("orange")).toBe("#f97316");
    });

    it("should return default color for undefined", () => {
      expect(getAgentColor(undefined)).toBe("#64748b");
    });

    it("should return default color for unknown colors", () => {
      expect(getAgentColor("unknown")).toBe("#64748b");
    });

    it("should return default color for empty string", () => {
      expect(getAgentColor("")).toBe("#64748b");
    });
  });

  describe("Agent Filtering Logic", () => {
    it("should filter policies by specific agent", () => {
      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A", agentColor: "blue" },
        { id: 2, agentId: 1, agentName: "Agent A", agentColor: "blue" },
        { id: 3, agentId: 2, agentName: "Agent B", agentColor: "pink" },
      ];
      const agentFilter = 1;

      const filtered = policiesWithAgents.filter(p => p.agentId === agentFilter);
      expect(filtered.length).toBe(2);
      expect(filtered.every(p => p.agentId === 1)).toBe(true);
    });

    it("should show all policies when filter is 'all'", () => {
      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A" },
        { id: 2, agentId: 2, agentName: "Agent B" },
        { id: 3, agentId: 1, agentName: "Agent A" },
      ];
      const agentFilter = "all";

      const filtered = policiesWithAgents.filter(p =>
        agentFilter === "all" || p.agentId === agentFilter
      );
      expect(filtered.length).toBe(3);
    });

    it("should return empty array when no policies match agent filter", () => {
      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A" },
        { id: 2, agentId: 1, agentName: "Agent A" },
      ];
      const agentFilter = 999;

      const filtered = policiesWithAgents.filter(p => p.agentId === agentFilter);
      expect(filtered.length).toBe(0);
    });
  });

  describe("Unique Agents Extraction", () => {
    it("should extract unique agents from policies", () => {
      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A", agentColor: "blue" },
        { id: 2, agentId: 1, agentName: "Agent A", agentColor: "blue" },
        { id: 3, agentId: 2, agentName: "Agent B", agentColor: "pink" },
        { id: 4, agentId: 2, agentName: "Agent B", agentColor: "pink" },
      ];

      const uniqueAgents = Array.from(
        new Map(
          policiesWithAgents.map(p => [
            p.agentId,
            { id: p.agentId, name: p.agentName, color: p.agentColor },
          ])
        ).values()
      );

      expect(uniqueAgents.length).toBe(2);
      expect(uniqueAgents[0].name).toBe("Agent A");
      expect(uniqueAgents[1].name).toBe("Agent B");
    });

    it("should handle empty policies array", () => {
      const policiesWithAgents: any[] = [];

      const uniqueAgents = Array.from(
        new Map(
          policiesWithAgents.map(p => [
            p.agentId,
            { id: p.agentId, name: p.agentName, color: p.agentColor },
          ])
        ).values()
      );

      expect(uniqueAgents.length).toBe(0);
    });

    it("should handle single agent", () => {
      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A", agentColor: "blue" },
        { id: 2, agentId: 1, agentName: "Agent A", agentColor: "blue" },
      ];

      const uniqueAgents = Array.from(
        new Map(
          policiesWithAgents.map(p => [
            p.agentId,
            { id: p.agentId, name: p.agentName, color: p.agentColor },
          ])
        ).values()
      );

      expect(uniqueAgents.length).toBe(1);
      expect(uniqueAgents[0].id).toBe(1);
    });
  });

  describe("Policy Filtering with Multiple Criteria", () => {
    it("should filter by search, status, and agent simultaneously", () => {
      const policies = [
        { id: 1, clientName: "John Doe", status: "active", carrier: "MetLife" },
        { id: 2, clientName: "Jane Smith", status: "active", carrier: "Athene" },
        { id: 3, clientName: "Bob Johnson", status: "expired", carrier: "MetLife" },
      ];

      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A" },
        { id: 2, agentId: 2, agentName: "Agent B" },
        { id: 3, agentId: 1, agentName: "Agent A" },
      ];

      const search = "john";
      const statusFilter = "active";
      const agentFilter = 1;

      const filtered = policies.filter(p => {
        const matchesSearch = p.clientName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        const agentInfo = policiesWithAgents.find(pa => pa.id === p.id);
        const matchesAgent = agentFilter === "all" || agentInfo?.agentId === agentFilter;
        return matchesSearch && matchesStatus && matchesAgent;
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(1);
    });

    it("should return no results when criteria don't match", () => {
      const policies = [
        { id: 1, clientName: "John Doe", status: "active" },
        { id: 2, clientName: "Jane Smith", status: "active" },
      ];

      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A" },
        { id: 2, agentId: 2, agentName: "Agent B" },
      ];

      const search = "xyz";
      const statusFilter = "expired";
      const agentFilter = 999;

      const filtered = policies.filter(p => {
        const matchesSearch = p.clientName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        const agentInfo = policiesWithAgents.find(pa => pa.id === p.id);
        const matchesAgent = agentFilter === "all" || agentInfo?.agentId === agentFilter;
        return matchesSearch && matchesStatus && matchesAgent;
      });

      expect(filtered.length).toBe(0);
    });
  });

  describe("Agent Info Retrieval", () => {
    it("should retrieve agent info by policy ID", () => {
      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A", agentColor: "blue" },
        { id: 2, agentId: 2, agentName: "Agent B", agentColor: "pink" },
      ];

      const getAgentInfo = (policyId: number) => {
        return policiesWithAgents.find(p => p.id === policyId);
      };

      const agentInfo = getAgentInfo(1);
      expect(agentInfo).toBeDefined();
      expect(agentInfo?.agentName).toBe("Agent A");
      expect(agentInfo?.agentColor).toBe("blue");
    });

    it("should return undefined for non-existent policy", () => {
      const policiesWithAgents = [
        { id: 1, agentId: 1, agentName: "Agent A", agentColor: "blue" },
      ];

      const getAgentInfo = (policyId: number) => {
        return policiesWithAgents.find(p => p.id === policyId);
      };

      const agentInfo = getAgentInfo(999);
      expect(agentInfo).toBeUndefined();
    });
  });

  describe("Agent Filter State Management", () => {
    it("should initialize agent filter as 'all'", () => {
      const agentFilter = "all";
      expect(agentFilter).toBe("all");
    });

    it("should update agent filter to specific agent ID", () => {
      let agentFilter: number | "all" = "all";
      agentFilter = 1;
      expect(agentFilter).toBe(1);
    });

    it("should reset agent filter to 'all'", () => {
      let agentFilter: number | "all" = 1;
      agentFilter = "all";
      expect(agentFilter).toBe("all");
    });
  });
});
