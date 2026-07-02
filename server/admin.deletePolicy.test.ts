import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return {
    ...original,
    getAllPolicies: vi.fn().mockResolvedValue([]),
    createPolicy: vi.fn().mockResolvedValue(undefined),
    updatePolicy: vi.fn().mockResolvedValue(undefined),
    deletePolicy: vi.fn().mockResolvedValue(undefined),
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

describe("Admin Policy Deletion", () => {
  let db: typeof import("./db");

  beforeEach(async () => {
    db = await import("./db");
    vi.clearAllMocks();
  });

  describe("admin.deletePolicy", () => {
    it("deletes a policy when called by admin", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.admin.deletePolicy({ id: 1 });

      expect(result).toEqual({ success: true });
      expect(db.deletePolicy).toHaveBeenCalledWith(1);
    });

    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.admin.deletePolicy({ id: 1 })).rejects.toThrow();
    });

    it("calls deletePolicy with the correct id", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      await caller.admin.deletePolicy({ id: 42 });
      expect(db.deletePolicy).toHaveBeenCalledWith(42);
    });
  });
});
