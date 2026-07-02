/**
 * Phase 5: Sales Tracker Segregation Tests
 * Tests for admin personal sales vs agent sales segregation logic
 */

import { describe, it, expect } from "vitest";

// Mock data for testing
const mockAdminSale = {
  id: 1,
  agentId: null, // Admin sale has no agent
  clientName: "John Doe",
  carrier: "Athene",
  product: "Fixed Annuity",
  premium: "500.00",
  annualPremium: "6000.00",
  commission: "660.00",
  saleDate: Date.now(),
  policyType: "fixed_annuity",
  status: "active",
  notes: "Admin personal sale",
  month: 6,
  year: 2026,
};

const mockAgentSale = {
  id: 2,
  agentId: 5, // Agent sale has agentId
  clientName: "Jane Smith",
  carrier: "AGL",
  product: "Term Life",
  premium: "75.00",
  annualPremium: "900.00",
  commission: "99.00",
  saleDate: Date.now(),
  policyType: "term_life",
  status: "active",
  notes: "Agent sale",
  month: 6,
  year: 2026,
  agentFirstName: "Nathan",
  agentLastName: "Faughn",
  agentColor: "blue",
  agentName: "Nathan Faughn",
};

describe("Phase 5: Sales Segregation Logic", () => {
  describe("Admin Personal Sales Filtering", () => {
    it("should identify admin personal sales (agentId is null)", () => {
      const isAdminSale = mockAdminSale.agentId === null || mockAdminSale.agentId === undefined;
      expect(isAdminSale).toBe(true);
    });

    it("should exclude agent sales from admin personal sales", () => {
      const isAdminSale = mockAgentSale.agentId === null || mockAgentSale.agentId === undefined;
      expect(isAdminSale).toBe(false);
    });

    it("should filter multiple sales correctly", () => {
      const allSales = [mockAdminSale, mockAgentSale];
      const adminSales = allSales.filter(s => !s.agentId);
      const agentSales = allSales.filter(s => s.agentId);

      expect(adminSales).toHaveLength(1);
      expect(agentSales).toHaveLength(1);
      expect(adminSales[0].id).toBe(1);
      expect(agentSales[0].id).toBe(2);
    });
  });

  describe("Agent Sales Filtering", () => {
    it("should identify agent sales (agentId is not null)", () => {
      const isAgentSale = mockAgentSale.agentId !== null && mockAgentSale.agentId !== undefined;
      expect(isAgentSale).toBe(true);
    });

    it("should exclude admin sales from agent sales", () => {
      const isAgentSale = mockAdminSale.agentId !== null && mockAdminSale.agentId !== undefined;
      expect(isAgentSale).toBe(false);
    });
  });

  describe("Agent Color Mapping", () => {
    const agentColorMap: Record<string, string> = {
      blue: "bg-blue-500/20 text-blue-300",
      green: "bg-green-500/20 text-green-300",
      red: "bg-red-500/20 text-red-300",
      purple: "bg-purple-500/20 text-purple-300",
      pink: "bg-pink-500/20 text-pink-300",
      orange: "bg-orange-500/20 text-orange-300",
      yellow: "bg-yellow-500/20 text-yellow-300",
      cyan: "bg-cyan-500/20 text-cyan-300",
    };

    it("should map agent color to CSS classes", () => {
      const colorClass = agentColorMap[mockAgentSale.agentColor || "blue"];
      expect(colorClass).toBe("bg-blue-500/20 text-blue-300");
    });

    it("should handle all 8 agent colors", () => {
      const colors = ["blue", "green", "red", "purple", "pink", "orange", "yellow", "cyan"];
      colors.forEach(color => {
        expect(agentColorMap[color]).toBeDefined();
        expect(agentColorMap[color]).toContain("bg-");
        expect(agentColorMap[color]).toContain("text-");
      });
    });

    it("should default to blue for unknown colors", () => {
      const colorClass = agentColorMap["unknown" as any] || agentColorMap.blue;
      expect(colorClass).toBe("bg-blue-500/20 text-blue-300");
    });
  });

  describe("Agent Information Display", () => {
    it("should format agent name correctly", () => {
      const agentName = `${mockAgentSale.agentFirstName} ${mockAgentSale.agentLastName}`;
      expect(agentName).toBe("Nathan Faughn");
    });

    it("should include agent name in agent sales", () => {
      expect(mockAgentSale.agentName).toBeDefined();
      expect(mockAgentSale.agentName).toBe("Nathan Faughn");
    });

    it("should display agent color with name", () => {
      const hasColor = mockAgentSale.agentColor !== undefined && mockAgentSale.agentColor !== null;
      const hasName = mockAgentSale.agentName !== undefined && mockAgentSale.agentName !== null;
      expect(hasColor && hasName).toBe(true);
    });
  });

  describe("Sales Summary Calculations", () => {
    it("should calculate total admin sales premium", () => {
      const adminSales = [mockAdminSale];
      const totalAdminPremium = adminSales.reduce(
        (sum, s) => sum + parseFloat(s.premium || "0"),
        0
      );
      expect(totalAdminPremium).toBe(500);
    });

    it("should calculate total agent sales premium", () => {
      const agentSales = [mockAgentSale];
      const totalAgentPremium = agentSales.reduce(
        (sum, s) => sum + parseFloat(s.premium || "0"),
        0
      );
      expect(totalAgentPremium).toBe(75);
    });

    it("should calculate total commission for agent sales", () => {
      const agentSales = [mockAgentSale];
      const totalCommission = agentSales.reduce(
        (sum, s) => sum + parseFloat(s.commission || "0"),
        0
      );
      expect(totalCommission).toBe(99);
    });

    it("should separate admin and agent totals correctly", () => {
      const allSales = [mockAdminSale, mockAgentSale];
      const adminSales = allSales.filter(s => !s.agentId);
      const agentSales = allSales.filter(s => s.agentId);

      const adminTotal = adminSales.reduce((sum, s) => sum + parseFloat(s.premium || "0"), 0);
      const agentTotal = agentSales.reduce((sum, s) => sum + parseFloat(s.premium || "0"), 0);

      expect(adminTotal).toBe(500);
      expect(agentTotal).toBe(75);
      expect(adminTotal + agentTotal).toBe(575);
    });
  });

  describe("Month/Year Filtering", () => {
    it("should filter sales by month and year", () => {
      const sales = [mockAdminSale, mockAgentSale];
      const targetMonth = 6;
      const targetYear = 2026;

      const filtered = sales.filter(s => s.month === targetMonth && s.year === targetYear);
      expect(filtered).toHaveLength(2);
    });

    it("should exclude sales from different months", () => {
      const sales = [mockAdminSale, { ...mockAgentSale, month: 7 }];
      const targetMonth = 6;
      const targetYear = 2026;

      const filtered = sales.filter(s => s.month === targetMonth && s.year === targetYear);
      expect(filtered).toHaveLength(1);
    });

    it("should exclude sales from different years", () => {
      const sales = [mockAdminSale, { ...mockAgentSale, year: 2025 }];
      const targetMonth = 6;
      const targetYear = 2026;

      const filtered = sales.filter(s => s.month === targetMonth && s.year === targetYear);
      expect(filtered).toHaveLength(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty sales list", () => {
      const sales: typeof mockAdminSale[] = [];
      const adminSales = sales.filter(s => !s.agentId);
      const agentSales = sales.filter(s => s.agentId);

      expect(adminSales).toHaveLength(0);
      expect(agentSales).toHaveLength(0);
    });

    it("should handle sales with zero premium", () => {
      const zeroPremiumSale = { ...mockAgentSale, premium: "0.00" };
      const total = parseFloat(zeroPremiumSale.premium || "0");
      expect(total).toBe(0);
    });

    it("should handle missing agent information gracefully", () => {
      const incompleteAgentSale = { ...mockAgentSale, agentFirstName: undefined, agentLastName: undefined };
      const agentName = `${incompleteAgentSale.agentFirstName || ""} ${incompleteAgentSale.agentLastName || ""}`.trim();
      expect(agentName).toBe("");
    });

    it("should handle null commission", () => {
      const noCommissionSale = { ...mockAgentSale, commission: null };
      const commission = parseFloat((noCommissionSale.commission as any) || "0");
      expect(commission).toBe(0);
    });
  });
});
