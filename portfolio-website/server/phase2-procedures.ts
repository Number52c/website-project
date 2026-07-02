/**
 * Phase 2: tRPC Procedures for Policy Segregation
 * 
 * These procedures expose the Phase 1 query functions through tRPC
 * for use in the admin dashboard to separate My Book, Agent Production, and Agency Overview
 */

import { adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getAdminPersonalPolicies,
  getAgentOriginatingPolicies,
  getAllPoliciesWithOriginatingAgent,
  getPoliciesCountByOriginatingAgent,
  getTotalPremiumByOriginatingAgent,
} from "./db";

export const phase2Router = router({
  // My Book of Business - Only admin's personal policies
  myBookOfBusiness: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return getAdminPersonalPolicies(ctx.user.id);
  }),

  // Agent Production - Policies for specific agent
  agentProduction: adminProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      return getAgentOriginatingPolicies(input.agentId);
    }),

  // All Policies with Agent Metadata - For color-coded dashboard
  allPoliciesWithAgents: adminProcedure.query(async () => {
    return getAllPoliciesWithOriginatingAgent();
  }),

  // Policy Count by Agent - For KPI cards
  policiesCountByAgent: adminProcedure.query(async () => {
    return getPoliciesCountByOriginatingAgent();
  }),

  // Total Premium by Agent - For KPI cards
  totalPremiumByAgent: adminProcedure.query(async () => {
    return getTotalPremiumByOriginatingAgent();
  }),
});
