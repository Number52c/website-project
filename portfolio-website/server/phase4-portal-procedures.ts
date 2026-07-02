/**
 * Phase 4: Client Portal Documents and Payments Procedures
 * tRPC procedures for documents, payment methods, and payment history
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getClientDocuments,
  getPolicyDocuments,
  getClientPaymentMethods,
  getDefaultPaymentMethod,
  getClientPaymentHistory,
  getPolicyPaymentHistory,
  getPaymentSummary,
} from "./db";

export const phase4PortalRouter = router({
  // ── DOCUMENTS ──────────────────────────────────────────────────────────

  /** Get all documents for the logged-in client */
  myDocuments: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.portalClient) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
    }
    return getClientDocuments(ctx.portalClient.id, ctx.portalClient.userId, "user");
  }),

  /** Get documents for a specific policy */
  policyDocuments: publicProcedure
    .input(z.object({ policyId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.portalClient) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
      }
      return getPolicyDocuments(input.policyId, ctx.portalClient.id);
    }),

  // ── PAYMENT METHODS ────────────────────────────────────────────────────

  /** Get all payment methods for the logged-in client */
  myPaymentMethods: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.portalClient) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
    }
    return getClientPaymentMethods(ctx.portalClient.id);
  }),

  /** Get default payment method for the logged-in client */
  defaultPaymentMethod: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.portalClient) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
    }
    return getDefaultPaymentMethod(ctx.portalClient.id);
  }),

  // ── PAYMENT HISTORY ────────────────────────────────────────────────────

  /** Get payment history for the logged-in client */
  myPaymentHistory: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.portalClient) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
      }
      return getClientPaymentHistory(ctx.portalClient.id, input.limit, input.offset);
    }),

  /** Get payment history for a specific policy */
  policyPaymentHistory: publicProcedure
    .input(z.object({ policyId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.portalClient) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
      }
      return getPolicyPaymentHistory(input.policyId, input.limit, input.offset);
    }),

  /** Get payment summary for the logged-in client */
  paymentSummary: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.portalClient) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
    }
    return getPaymentSummary(ctx.portalClient.id);
  }),
});
