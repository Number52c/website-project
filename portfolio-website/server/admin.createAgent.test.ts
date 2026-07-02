import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedAdmin = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const admin: AuthenticatedAdmin = {
    id: 999,
    openId: "admin-user",
    email: "admin@test.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user: admin,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("admin.createAgent", () => {
  it("should create an agent and return welcome text with password", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.createAgent({
      firstName: "Test",
      lastName: "Agent",
      email: `testadmin${Date.now()}@ortizinsurance.local`,
      phone: "555-1234",
      licenseNumber: "123456",
      licenseState: "TX",
      status: "active",
    });

    // Verify the response structure
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("tempPassword");
    expect(result).toHaveProperty("welcomeText");
    expect(result).toHaveProperty("message");

    // Verify the welcome text contains the password
    expect(result.welcomeText).toContain("Temporary Password:");
    expect(result.welcomeText).toContain(result.tempPassword);
    expect(result.welcomeText).toContain("Test");
    expect(result.welcomeText).toContain("Agent");
    expect(result.welcomeText).toContain("PORTAL ACCESS INSTRUCTIONS");

    console.log("✓ Welcome text contains password");
    console.log("Password:", result.tempPassword);
  });
});
