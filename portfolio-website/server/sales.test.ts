import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return {
    ...original,
    getSalesEntriesByMonth: vi.fn().mockResolvedValue([]),
    getAllSalesEntries: vi.fn().mockResolvedValue([]),
    createSalesEntry: vi.fn().mockResolvedValue(undefined),
    updateSalesEntry: vi.fn().mockResolvedValue(undefined),
    deleteSalesEntry: vi.fn().mockResolvedValue(undefined),
  };
});

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Sales Tracker Endpoints", () => {
  let db: typeof import("./db");

  beforeEach(async () => {
    db = await import("./db");
    vi.clearAllMocks();
  });

  describe("admin.getSalesByMonth", () => {
    it("returns sales entries for a given month/year", async () => {
      const mockEntries = [
        {
          id: 1,
          clientName: "John Doe",
          productType: "Whole Life",
          carrier: "Mutual of Omaha",
          premium: "500.00",
          annualPremium: "6000.00",
          commissionPercent: "80.00",
          commissionAmount: "4800.00",
          saleDate: 1717200000000,
          saleMonth: 6,
          saleYear: 2025,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(db.getSalesEntriesByMonth).mockResolvedValue(mockEntries);

      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.getSalesByMonth({ month: 6, year: 2025 });

      expect(result).toEqual(mockEntries);
      expect(db.getSalesEntriesByMonth).toHaveBeenCalledWith(6, 2025);
    });

    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.admin.getSalesByMonth({ month: 6, year: 2025 })).rejects.toThrow();
    });
  });

  describe("admin.createSale", () => {
    it("creates a new sales entry", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.createSale({
        clientName: "Jane Smith",
        productType: "FIA",
        carrier: "Athene",
        premium: "100000.00",
        annualPremium: "100000.00",
        commissionPercent: "6.00",
        commissionAmount: "6000.00",
        saleDate: 1717200000000,
        saleMonth: 6,
        saleYear: 2025,
        notes: "Large annuity sale",
      });

      expect(result).toEqual({ success: true });
      expect(db.createSalesEntry).toHaveBeenCalledWith({
        clientName: "Jane Smith",
        productType: "FIA",
        carrier: "Athene",
        premium: "100000.00",
        annualPremium: "100000.00",
        commissionPercent: "6.00",
        saleDate: 1717200000000,
        saleMonth: 6,
        saleYear: 2025,
        notes: "Large annuity sale",
        tagColor: "default",
      });
    });

    it("validates required fields", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      await expect(
        caller.admin.createSale({
          clientName: "",
          productType: "FIA",
          carrier: "Athene",
          premium: "100.00",
          saleDate: 1717200000000,
          saleMonth: 6,
          saleYear: 2025,
        })
      ).rejects.toThrow();
    });
  });

  describe("admin.updateSale", () => {
    it("updates an existing sales entry", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.updateSale({
        id: 1,
        clientName: "John Updated",
        premium: "750.00",
      });

      expect(result).toEqual({ success: true });
      expect(db.updateSalesEntry).toHaveBeenCalledWith(1, expect.objectContaining({
        clientName: "John Updated",
        premium: "750.00",
      }));
    });
  });

  describe("admin.deleteSale", () => {
    it("deletes a sales entry", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.deleteSale({ id: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deleteSalesEntry).toHaveBeenCalledWith(1);
    });

    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.admin.deleteSale({ id: 1 })).rejects.toThrow();
    });
  });
});
