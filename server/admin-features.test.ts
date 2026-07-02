import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const adminUser: AuthenticatedUser = {
  id: 99,
  openId: "admin-open-id",
  email: "admin@test.com",
  name: "Admin User",
  loginMethod: "manus",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const regularUser: AuthenticatedUser = {
  id: 1,
  openId: "test-user-open-id",
  email: "client@test.com",
  name: "Test Client",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createAdminContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: adminUser,
    portalClient: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    portalClient: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

function createRegularUserContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: regularUser,
    portalClient: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

// ── Admin listPolicies returns yearlyAP field ──────────────────────────────

describe("admin.listPolicies (analytics data)", () => {
  it("returns policies with yearlyAP field available", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const policies = await caller.admin.listPolicies();
    expect(Array.isArray(policies)).toBe(true);
    // If policies exist, they should have the yearlyAP field
    if (policies.length > 0) {
      const first = policies[0];
      expect(first).toHaveProperty("yearlyAP");
      expect(first).toHaveProperty("type");
      expect(first).toHaveProperty("status");
      expect(first).toHaveProperty("carrier");
    }
  });

  it("returns policies with valid status values", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const policies = await caller.admin.listPolicies();
    const validStatuses = ["active", "pending", "expired", "cancelled"];
    for (const policy of policies) {
      expect(validStatuses).toContain(policy.status);
    }
  });

  it("returns policies with known type values", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const policies = await caller.admin.listPolicies();
    const knownTypes = [
      "Whole Life Final Expense",
      "Graded Whole Life",
      "Whole Life",
      "Whole Life-G",
      "Term",
      "Term Life Insurance",
      "Life",
      "Accidental",
      "Annuity",
      "Final Expense",
      "Life Insurance",
      "Term Life",
    ];
    for (const policy of policies) {
      expect(knownTypes).toContain(policy.type);
    }
  });
});

// ── Admin updatePolicy (status change) ─────────────────────────────────────

describe("admin.updatePolicy (status change)", () => {
  it("rejects status update from unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.updatePolicy({ id: 1, status: "cancelled" })
    ).rejects.toThrow();
  });

  it("rejects status update from non-admin user", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.updatePolicy({ id: 1, status: "cancelled" })
    ).rejects.toThrow();
  });

  it("accepts valid status values in the input schema", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    // This should not throw a validation error (it may throw NOT_FOUND for non-existent ID)
    // We test that the schema accepts the status field
    try {
      await caller.admin.updatePolicy({ id: 999999, status: "active" });
    } catch (err: any) {
      // Expected: either success or a DB-level error, but NOT a ZodError
      expect(err.code).not.toBe("BAD_REQUEST");
    }
  });

  it("accepts yearlyAP in the update input", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.admin.updatePolicy({ id: 999999, yearlyAP: "1200.00" });
    } catch (err: any) {
      // Should not be a validation error
      expect(err.code).not.toBe("BAD_REQUEST");
    }
  });
});

// ── Analytics computation tests (client-side logic validation) ─────────────

describe("analytics computation logic", () => {
  const mockPolicies = [
    { id: 1, type: "Graded Whole Life", status: "active", yearlyAP: "600.00", carrier: "Mutual of Omaha" },
    { id: 2, type: "Graded Whole Life", status: "active", yearlyAP: "480.00", carrier: "Mutual of Omaha" },
    { id: 3, type: "Whole Life Final Expense", status: "active", yearlyAP: "720.00", carrier: "CUNA Mutual" },
    { id: 4, type: "Whole Life", status: "cancelled", yearlyAP: "900.00", carrier: "AIG" },
    { id: 5, type: "Term", status: "active", yearlyAP: "300.00", carrier: "AIG" },
    { id: 6, type: "Accidental", status: "pending", yearlyAP: "240.00", carrier: "Gerber" },
  ];

  it("correctly computes total AP for active policies only", () => {
    const activePolicies = mockPolicies.filter(p => p.status === "active");
    const totalAP = activePolicies.reduce((sum, p) => sum + parseFloat(p.yearlyAP || "0"), 0);
    // Active: 600 + 480 + 720 + 300 = 2100
    expect(totalAP).toBe(2100);
  });

  it("correctly counts policy types", () => {
    const typeCounts: Record<string, number> = {};
    for (const p of mockPolicies) {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    }
    expect(typeCounts["Graded Whole Life"]).toBe(2);
    expect(typeCounts["Whole Life Final Expense"]).toBe(1);
    expect(typeCounts["Whole Life"]).toBe(1);
    expect(typeCounts["Term"]).toBe(1);
    expect(typeCounts["Accidental"]).toBe(1);
  });

  it("correctly counts policy statuses", () => {
    const statusCounts: Record<string, number> = {};
    for (const p of mockPolicies) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }
    expect(statusCounts["active"]).toBe(4);
    expect(statusCounts["cancelled"]).toBe(1);
    expect(statusCounts["pending"]).toBe(1);
  });

  it("correctly computes AP by carrier for active policies", () => {
    const activePolicies = mockPolicies.filter(p => p.status === "active");
    const carrierAP: Record<string, number> = {};
    for (const p of activePolicies) {
      const ap = parseFloat(p.yearlyAP || "0");
      carrierAP[p.carrier] = (carrierAP[p.carrier] || 0) + ap;
    }
    expect(carrierAP["Mutual of Omaha"]).toBe(1080);
    expect(carrierAP["CUNA Mutual"]).toBe(720);
    expect(carrierAP["AIG"]).toBe(300);
  });

  it("handles policies with null/empty yearlyAP gracefully", () => {
    const policiesWithNull = [
      { id: 1, type: "Term", status: "active", yearlyAP: null, carrier: "AIG" },
      { id: 2, type: "Term", status: "active", yearlyAP: "", carrier: "AIG" },
      { id: 3, type: "Term", status: "active", yearlyAP: "500.00", carrier: "AIG" },
    ];
    const totalAP = policiesWithNull.reduce((sum, p) => {
      const ap = parseFloat(p.yearlyAP || "0");
      return sum + (isNaN(ap) ? 0 : ap);
    }, 0);
    expect(totalAP).toBe(500);
  });
});
