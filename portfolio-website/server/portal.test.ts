import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { Client } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

type ClearedCookieCall = {
  name: string;
  options: Record<string, unknown>;
};

const testPortalClient: Client = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "555-1234",
  pin: "1234",
  userId: null,
  address: "123 Main St",
  city: "Corpus Christi",
  state: "TX",
  zip: "78401",
  createdAt: new Date(),
  updatedAt: new Date(),
};

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

function createPublicContext(): {
  ctx: TrpcContext;
  setCookies: CookieCall[];
  clearedCookies: ClearedCookieCall[];
} {
  const setCookies: CookieCall[] = [];
  const clearedCookies: ClearedCookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    portalClient: null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

function createPortalClientContext(client: Client = testPortalClient): {
  ctx: TrpcContext;
  clearedCookies: ClearedCookieCall[];
} {
  const clearedCookies: ClearedCookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    portalClient: client,
    req: {
      protocol: "https",
      headers: {},
      cookies: { portal_session: "valid-jwt-token" },
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

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

// ── portal.me ───────────────────────────────────────────────────────────────

describe("portal.me", () => {
  it("returns null when no portal session exists", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portal.me();
    expect(result).toBeNull();
  });

  it("returns client info when portal session exists", async () => {
    const { ctx } = createPortalClientContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portal.me();
    expect(result).not.toBeNull();
    expect(result?.firstName).toBe("John");
    expect(result?.lastName).toBe("Doe");
    expect(result?.email).toBe("john@example.com");
    expect(result?.phone).toBe("555-1234");
  });

  it("does not expose the PIN in the response", async () => {
    const { ctx } = createPortalClientContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portal.me();
    expect(result).not.toHaveProperty("pin");
  });
});

// ── portal.logout ───────────────────────────────────────────────────────────

describe("portal.logout", () => {
  it("clears the portal session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createPortalClientContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.portal.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe("portal_session");
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ── portal.myPolicies ───────────────────────────────────────────────────────

describe("portal.myPolicies", () => {
  it("throws UNAUTHORIZED when no portal session", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.portal.myPolicies()).rejects.toThrow(
      "Please log in to the client portal."
    );
  });

  it("returns policies for authenticated portal client", async () => {
    const { ctx } = createPortalClientContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw — returns array (empty if no policies in DB)
    const result = await caller.portal.myPolicies();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── portal.policyDetail ─────────────────────────────────────────────────────

describe("portal.policyDetail", () => {
  it("throws UNAUTHORIZED when no portal session", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.portal.policyDetail({ policyId: 1 })
    ).rejects.toThrow("Please log in to the client portal.");
  });

  it("throws NOT_FOUND for non-existent policy", async () => {
    const { ctx } = createPortalClientContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.portal.policyDetail({ policyId: 999999 })
    ).rejects.toThrow("Policy not found");
  });
});

// ── portal.login validation ─────────────────────────────────────────────────

describe("portal.login", () => {
  it("rejects empty last name", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.portal.login({ lastName: "", pin: "1234" })
    ).rejects.toThrow();
  });

  it("rejects short PIN (less than 4 digits)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.portal.login({ lastName: "Doe", pin: "12" })
    ).rejects.toThrow();
  });

  it("rejects invalid credentials", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.portal.login({ lastName: "NonExistent", pin: "9999" })
    ).rejects.toThrow("Invalid last name or PIN");
  });
});

// ── admin routes ────────────────────────────────────────────────────────────

describe("admin routes", () => {
  it("throws FORBIDDEN for non-admin users trying to list clients", async () => {
    const { ctx } = createRegularUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.listClients()).rejects.toThrow();
  });

  it("throws UNAUTHORIZED for unauthenticated users trying admin routes", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.listClients()).rejects.toThrow();
  });

  it("allows admin users to list clients", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.listClients();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin users to list policies", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.listPolicies();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin users to list users", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.listUsers();
    expect(Array.isArray(result)).toBe(true);
  });
});
