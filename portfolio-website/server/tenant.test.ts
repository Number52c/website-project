import { describe, it, expect, beforeEach } from "vitest";
import { getTenantById, getTenantByDomain, listAllTenants, createTenant, updateTenant, generateTenantId } from "./_core/tenants";

describe("Multi-tenant System", () => {
  describe("Tenant Registry", () => {
    it("should return demo tenant by ID", () => {
      const tenant = getTenantById("demo-tenant-001");
      expect(tenant).toBeDefined();
      expect(tenant?.companyName).toBe("Demo Insurance Agency");
      expect(tenant?.subscriptionStatus).toBe("active");
    });

    it("should return null for non-existent tenant", () => {
      const tenant = getTenantById("non-existent-tenant");
      expect(tenant).toBeNull();
    });

    it("should find tenant by domain", () => {
      const tenant = getTenantByDomain("demo.local");
      expect(tenant).toBeDefined();
      expect(tenant?.id).toBe("demo-tenant-001");
    });

    it("should handle domain case-insensitivity", () => {
      const tenant = getTenantByDomain("DEMO.LOCAL");
      expect(tenant).toBeDefined();
      expect(tenant?.id).toBe("demo-tenant-001");
    });

    it("should return null for unknown domain", () => {
      const tenant = getTenantByDomain("unknown.com");
      expect(tenant).toBeNull();
    });

    it("should list all tenants", () => {
      const tenants = listAllTenants();
      expect(tenants.length).toBeGreaterThan(0);
      expect(tenants.some((t) => t.id === "demo-tenant-001")).toBe(true);
    });
  });

  describe("Tenant Creation", () => {
    it("should create a new tenant", () => {
      const tenantId = generateTenantId();
      const newTenant = createTenant({
        id: tenantId,
        companyName: "Test Agency",
        domain: "test.local",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        subscriptionStatus: "trial",
        subscriptionPlan: "professional",
        ownerEmail: "test@example.com",
        ownerName: "Test Owner",
      });

      expect(newTenant.id).toBe(tenantId);
      expect(newTenant.companyName).toBe("Test Agency");
      expect(newTenant.domain).toBe("test.local");

      // Verify it can be retrieved
      const retrieved = getTenantById(tenantId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.companyName).toBe("Test Agency");
    });

    it("should generate unique tenant IDs", () => {
      const id1 = generateTenantId();
      const id2 = generateTenantId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^tenant-\d+-[a-z0-9]+$/);
    });
  });

  describe("Tenant Updates", () => {
    it("should update tenant branding", () => {
      const tenantId = generateTenantId();
      createTenant({
        id: tenantId,
        companyName: "Original Name",
        domain: "test.local",
        primaryColor: "#0D1B3E",
        secondaryColor: "#D4AF37",
        subscriptionStatus: "trial",
        subscriptionPlan: "professional",
        ownerEmail: "test@example.com",
        ownerName: "Test Owner",
      });

      const updated = updateTenant(tenantId, {
        companyName: "Updated Name",
        primaryColor: "#FF0000",
      });

      expect(updated).toBeDefined();
      expect(updated?.companyName).toBe("Updated Name");
      expect(updated?.primaryColor).toBe("#FF0000");
      expect(updated?.secondaryColor).toBe("#D4AF37"); // Unchanged
    });

    it("should return null when updating non-existent tenant", () => {
      const updated = updateTenant("non-existent", {
        companyName: "New Name",
      });
      expect(updated).toBeNull();
    });
  });

  describe("Tenant Isolation", () => {
    it("should maintain separate tenant configurations", () => {
      const tenant1Id = generateTenantId();
      const tenant2Id = generateTenantId();

      createTenant({
        id: tenant1Id,
        companyName: "Agency 1",
        domain: "agency1.local",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
        subscriptionStatus: "active",
        subscriptionPlan: "professional",
        ownerEmail: "agency1@example.com",
        ownerName: "Owner 1",
      });

      createTenant({
        id: tenant2Id,
        companyName: "Agency 2",
        domain: "agency2.local",
        primaryColor: "#0000FF",
        secondaryColor: "#FFFF00",
        subscriptionStatus: "trial",
        subscriptionPlan: "enterprise",
        ownerEmail: "agency2@example.com",
        ownerName: "Owner 2",
      });

      const t1 = getTenantById(tenant1Id);
      const t2 = getTenantById(tenant2Id);

      expect(t1?.companyName).toBe("Agency 1");
      expect(t1?.primaryColor).toBe("#FF0000");
      expect(t1?.subscriptionPlan).toBe("professional");

      expect(t2?.companyName).toBe("Agency 2");
      expect(t2?.primaryColor).toBe("#0000FF");
      expect(t2?.subscriptionPlan).toBe("enterprise");
    });
  });

  describe("Tenant Branding", () => {
    it("should store and retrieve tenant branding colors", () => {
      const tenantId = generateTenantId();
      const tenant = createTenant({
        id: tenantId,
        companyName: "Branded Agency",
        domain: "branded.local",
        primaryColor: "#123456",
        secondaryColor: "#ABCDEF",
        subscriptionStatus: "active",
        subscriptionPlan: "professional",
        ownerEmail: "branded@example.com",
        ownerName: "Branded Owner",
      });

      expect(tenant.primaryColor).toBe("#123456");
      expect(tenant.secondaryColor).toBe("#ABCDEF");

      // Verify persistence
      const retrieved = getTenantById(tenantId);
      expect(retrieved?.primaryColor).toBe("#123456");
      expect(retrieved?.secondaryColor).toBe("#ABCDEF");
    });
  });
});
