/**
 * Tenant management router
 * Provides endpoints for tenant operations and testing multi-tenant isolation
 */

import { router, publicProcedure } from "./_core/trpc";
import { listAllTenants, getTenantById, createTenant, updateTenant, generateTenantId } from "./_core/tenants";
import { z } from "zod";

export const tenantRouter = router({
  /**
   * Get current tenant information from request context
   */
  getCurrent: publicProcedure.query(({ ctx }) => {
    return {
      id: ctx.tenant.id,
      companyName: ctx.tenant.companyName,
      domain: ctx.tenant.domain,
      primaryColor: ctx.tenant.primaryColor,
      secondaryColor: ctx.tenant.secondaryColor,
      subscriptionStatus: ctx.tenant.subscriptionStatus,
      ownerName: ctx.tenant.ownerName,
    };
  }),

  /**
   * List all tenants (super-admin only)
   */
  listAll: publicProcedure.query(() => {
    return listAllTenants().map((t) => ({
      id: t.id,
      companyName: t.companyName,
      domain: t.domain,
      subscriptionStatus: t.subscriptionStatus,
      subscriptionPlan: t.subscriptionPlan,
      ownerEmail: t.ownerEmail,
    }));
  }),

  /**
   * Get tenant by ID
   */
  getById: publicProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(({ input }) => {
      const tenant = getTenantById(input.tenantId);
      if (!tenant) {
        throw new Error("Tenant not found");
      }
      return {
        id: tenant.id,
        companyName: tenant.companyName,
        domain: tenant.domain,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
      };
    }),

  /**
   * Create a new tenant (for signup/demo)
   */
  create: publicProcedure
    .input(
      z.object({
        companyName: z.string().min(1),
        domain: z.string().min(1),
        ownerEmail: z.string().email(),
        ownerName: z.string().min(1),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const tenantId = generateTenantId();
      const newTenant = createTenant({
        id: tenantId,
        companyName: input.companyName,
        domain: input.domain,
        primaryColor: input.primaryColor || "#0D1B3E",
        secondaryColor: input.secondaryColor || "#D4AF37",
        subscriptionStatus: "trial",
        subscriptionPlan: "professional",
        ownerEmail: input.ownerEmail,
        ownerName: input.ownerName,
      });

      return {
        id: newTenant.id,
        companyName: newTenant.companyName,
        domain: newTenant.domain,
        message: `Tenant created successfully. Access at ${newTenant.domain}`,
      };
    }),

  /**
   * Update tenant branding
   */
  updateBranding: publicProcedure
    .input(
      z.object({
        tenantId: z.string(),
        companyName: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        logoUrl: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const updated = updateTenant(input.tenantId, {
        companyName: input.companyName,
        primaryColor: input.primaryColor,
        secondaryColor: input.secondaryColor,
        logoUrl: input.logoUrl,
      });

      if (!updated) {
        throw new Error("Tenant not found");
      }

      return {
        id: updated.id,
        companyName: updated.companyName,
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
      };
    }),

  /**
   * Test tenant isolation - verify current tenant's data
   */
  testIsolation: publicProcedure.query(({ ctx }) => {
    return {
      tenantId: ctx.tenant.id,
      companyName: ctx.tenant.companyName,
      domain: ctx.tenant.domain,
      message: `You are accessing tenant: ${ctx.tenant.companyName}`,
      timestamp: new Date().toISOString(),
    };
  }),
});
