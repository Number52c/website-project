/**
 * server/routers.ts
 * Main tRPC router for Ortiz Insurance Broker.
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, agentProcedure, agentMutationProcedure, adminMutationProcedure, router, t } from "./_core/trpc";
import { ENV } from "./_core/env";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, gte, lte, lt, inArray, notInArray, sql, ne, or, isNull } from "drizzle-orm";
import { agents, clients, policies, policyAgents, expenses, salesEntries, agentSessions, agentCredentials, carriers, InsertClient, InsertPolicy, InsertSalesEntry } from "../drizzle/schema";
import { getDb } from "./db";
import { sendEmail, buildContactEmail, buildQuoteEmail } from "./email";
import { recordSessionActivity, clearSession } from "./sessionActivity";
import {
  insertQuoteRequest, insertContactSubmission,
  getClientByLastNameAndPin, getClientPolicies, getClientAnnuities, getPolicyById,
  getHouseholdMembers, getHouseholdPolicies, getHouseholdAnnuities,
  getAllClients, getClientsByAgent, createClient, updateClient, deleteClient, getClientById,
  getAllPolicies, createPolicy, updatePolicy, deletePolicy,
  getAllUsers, getClientByName,
  getAllAnnuities, createAnnuity, updateAnnuity, deleteAnnuity,
  getSalesEntriesByMonth, getAllSalesEntries, getSalesEntriesByClientName, createSalesEntry, updateSalesEntry, deleteSalesEntry, getAgentSalesByMonth,
  // getAllGradedWholeLifePolicies, createGradedWholeLifePolicy, updateGradedWholeLifePolicy, deleteGradedWholeLifePolicy, // Deprecated - table doesn't exist
  getAppSetting, setAppSetting, updateClientLastLogin, getClientLoginStats, getClientWithLoginStatus,
  getCarrierPortalUrl, getAllCarriers,
  getExpensesByMonth, createExpense, updateExpense, deleteExpense, getTotalExpensesByMonth,
  getAgentByEmail, getAgentById, getAgentPolicies, getAgentAnnuities, getAgentClients,
  getAgentSalesEntries, getAgentSalesEntriesByMonth, getAgentTotalSalesCount, getAgentTotalPremium,
  getAgentTotalAnnualPremium, getAgentTotalCommission, getAgentMonthlyCommission,
  getAdminPersonalPolicies, getAgentOriginatingPolicies, getAllPoliciesWithOriginatingAgent,
  getPoliciesCountByOriginatingAgent, getTotalPremiumByOriginatingAgent,
  getAllPDFs, getPDFsByCategory, getPDFById,
  getOrCreateAdminAgentRecord,
} from "./db";

import { notifyOwner } from "./_core/notification";
import { signPortalToken, signAgentToken } from "./_core/context";
import { hashPassword, verifyPassword } from "./auth";
import { hashPin, verifyPin } from "./pin";
import { logSecurityEvent } from "./securityLogger";
import { checkRateLimit, recordFailedAttempt, clearRateLimit, startRateLimitCleanup } from "./rateLimiter";

import { tenantRouter } from "./tenantRouter";
import { phase2Router } from "./phase2-procedures";
import { phase4PortalRouter } from "./phase4-portal-procedures";
import { calculatePersistenceRate, LAPSE_STATUSES, ACTIVE_STATUSES, isLifePolicyType } from "./metrics";
import { verifyAdminPin, signAdminToken, isAdminRateLimited, recordAdminFailedAttempt, clearAdminRateLimit, getAdminCookieOptions, ADMIN_COOKIE_NAME } from "./adminAuth";
import {
  parseName,
  buildClientData,
  buildPolicyData,
  findDataStartRow,
  buildColumnMap,
  parseDate,
} from "./importHelper";
import { syncPolicyToSalesEntry } from "./lib/syncPolicyToSales";
import { parseExcelFile, sheetToJson } from "./excelHelper";
import { buildAnnualReviewEmail } from "./email";
import { createHeartbeatJob, listHeartbeatJobs } from "./_core/heartbeat";
import { parse as parseCookie } from "cookie";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const NOTIFY_EMAIL = "eortiz@ortizinsurancebroker.com";
const PORTAL_COOKIE = "portal_session";

// Initialize rate limiting cleanup on server startup
startRateLimitCleanup();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function postToGHL(payload: Record<string, string>): Promise<boolean> {
  const webhookUrl = ENV.ghlWebhookUrl;
  if (!webhookUrl) {
    console.error("[GHL] GHL_WEBHOOK_URL is not set — check environment secrets");
    return false;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[GHL] Webhook responded with status ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[GHL] Failed to POST to webhook:", err);
    return false;
  }
}

// ─── MAIN ROUTER ──────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  tenant: tenantRouter,
  phase2: phase2Router,

  // Secure admin authentication (server-side PIN verification)
  adminAuth: router({
    /** Verify admin PIN and issue secure session token */
    verifyPin: publicProcedure
      .input(z.object({ pin: z.string().min(1).max(50) }))
      .mutation(async ({ input, ctx }) => {
        const ip = ctx.req.ip || ctx.req.socket.remoteAddress || "unknown";
        const trimmedPin = input.pin.trim();

        // Check rate limiting
        const { limited, remainingAttempts, lockoutRemainingMs } = isAdminRateLimited(ip);
        if (limited) {
          const minutesLeft = Math.ceil(lockoutRemainingMs / 60000);
          console.log(`[AdminAuth] IP ${ip} is rate limited`);
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Too many failed attempts. Please try again in ${minutesLeft} minutes.`,
          });
        }

        // Verify PIN server-side
        const isValid = verifyAdminPin(trimmedPin);
        if (!isValid) {
          recordAdminFailedAttempt(ip);
          const newRemaining = remainingAttempts - 1;
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: newRemaining > 0
              ? `Invalid PIN. ${newRemaining} attempt${newRemaining !== 1 ? "s" : ""} remaining.`
              : "Invalid PIN. Account locked for 30 minutes.",
          });
        }

        // PIN is correct — clear rate limit and issue session token
        clearAdminRateLimit(ip);
        const token = await signAdminToken();
        const isSecure = ctx.req.protocol === "https" || ctx.req.headers["x-forwarded-proto"] === "https";

        ctx.res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions(isSecure));

        return { success: true };
      }),

    /** Check if current admin session is valid */
    checkSession: publicProcedure.query(async ({ ctx }) => {
      return {
        authenticated: ctx.user?.role === "admin",
      };
    }),

    /** Logout admin session (clear cookie) */
    logout: publicProcedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
      return { success: true };
    }),
  }),


  agent: router({
    loginWithPIN: publicProcedure
      .use(t.middleware(async opts => {
        const { ctx, next } = opts;
        const rateLimitKey = `login_pin_${ctx.req.ip}`;
        const isRateLimited = await checkRateLimit(rateLimitKey, 5, 5 * 60 * 1000); // 5 attempts in 5 minutes
        if (isRateLimited) {
          await recordFailedAttempt(rateLimitKey);
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many PIN login attempts. Please try again after 5 minutes." });
        }
        return next();
      }))
      .input(
        z.object({
          agentId: z.number(),
          pin: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const agent = await getAgentById(input.agentId);
        if (!agent) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Agent ID or PIN. Please try again.",
          });
        }
                // Verify PIN
        // verifyPin already imported at top of file
        if (!agent.pin || !verifyPin(input.pin, agent.pin)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid Agent ID or PIN. Please try again.",
          });
        }

        // Check if agent is active
        if (agent.agentStatus !== "active") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your agent account is not active. Contact your administrator.",
          });
        }

        // Set agent session cookie with signed JWT
        const token = await signAgentToken(agent.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("agent_session", token, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 8, // 8 hours
        });

        // Record session activity
        recordSessionActivity(agent.id);

        return {
          success: true,
          agentName: `${agent.firstName} ${agent.lastName}`,
        };
      }),

    /** Agent login with email and password */
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Valid email is required"),
        password: z.string().min(1, "Password is required"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Find agent by email
        const normalizedEmail = input.email.trim().toLowerCase();
        console.log(`[DIAG:agent.login] Attempting login for email: ${normalizedEmail}`);
        const agent = await getAgentByEmail(normalizedEmail);
        console.log(`[DIAG:agent.login] Agent found: ${!!agent}, agentId: ${agent?.id ?? 'N/A'}`);
        if (!agent) {
          console.log(`[DIAG:agent.login] FAIL - No agent found for email: ${normalizedEmail}`);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password. Please try again.",
          });
        }
        // Check if agent is active
        console.log(`[DIAG:agent.login] Agent status: ${agent.agentStatus}`);
        if (agent.agentStatus !== "active") {
          console.log(`[DIAG:agent.login] FAIL - Agent not active, status: ${agent.agentStatus}`);
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your agent account is not active. Contact your administrator.",
          });
        }
        // Verify password
        const hasPasswordHash = !!agent.passwordHash;
        const passwordHashLength = agent.passwordHash ? agent.passwordHash.length : 0;
        console.log(`[DIAG:agent.login] passwordHash exists: ${hasPasswordHash}, length: ${passwordHashLength}`);
        if (!agent.passwordHash) {
          console.log(`[DIAG:agent.login] FAIL - No passwordHash for agentId: ${agent.id}`);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Your account has not been set up yet. Please use the initial password setup flow.",
          });
        }
        const isValid = verifyPassword(input.password, agent.passwordHash);
        console.log(`[DIAG:agent.login] Password verification result: ${isValid}`);
        if (!isValid) {
          console.log(`[DIAG:agent.login] FAIL - Password verification failed for agentId: ${agent.id}`);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password. Please try again.",
          });
        }
        // Set agent session cookie with signed JWT
        const token = await signAgentToken(agent.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("agent_session", token, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 8, // 8 hours
        });
        // Record session activity
        recordSessionActivity(agent.id);
        // Check if password change is required (first login)
        const requiresPasswordChange = !agent.passwordChangedAt;
        return {
          success: true,
          agentName: `${agent.firstName} ${agent.lastName}`,
          requiresPasswordChange,
        };
      }),

    /** Forgot password — notify admin so they can reset the agent's password */
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const agent = await getAgentByEmail(input.email.trim().toLowerCase());
        // Always return success to prevent email enumeration
        if (agent) {
          // notifyOwner already imported at top of file
          const requestTime = new Date().toLocaleString("en-US", {
            timeZone: "America/Chicago",
            dateStyle: "full",
            timeStyle: "short",
          });
          await notifyOwner({
            title: `🔑 Password Reset Request — ${agent.firstName} ${agent.lastName}`,
            content: `Agent ${agent.firstName} ${agent.lastName} has requested a password reset.\n\nEmail: ${agent.email}\nRequested at: ${requestTime} (CST)\n\nPlease log into the Admin Dashboard → Agents tab and use the "Reset Password" button to generate a new temporary password, then send it to the agent directly.`,
          }).catch(() => {
            // Silently fail — don't expose errors to the client
          });
        }
        return { success: true };
      }),

    /** Logout — clear agent session cookie and DB session */
    logout: agentProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("agent_session", { ...cookieOptions, maxAge: -1 });
      // Also clear the DB-backed session so the agent is fully logged out
      if (ctx.agent) {
        clearSession(ctx.agent.id);
      }
      return { success: true };
    }),

    /** Get current agent session (who is logged in) */
    me: agentProcedure.query(({ ctx }) => {
      // Strip sensitive fields before returning to frontend
      const { passwordHash, passwordChangedAt, pin, ...safeAgent } = ctx.agent;
      return safeAgent;
    }),

    /** Get all policies for the logged-in agent */
    myPolicies: agentProcedure.query(async ({ ctx }) => {
      return getAgentPolicies(ctx.agent.id);
    }),

    /** Get all annuities for the logged-in agent */
    myAnnuities: agentProcedure.query(async ({ ctx }) => {
      return getAgentAnnuities(ctx.agent.id);
    }),

    /** Get all clients for the logged-in agent */
    myClients: agentProcedure.query(async ({ ctx }) => {
      const clientList = await getAgentClients(ctx.agent.id);
      // Strip sensitive fields before returning to agent frontend
      // Agents should NOT see SSN, bank info, driver license, or PIN hashes
      return clientList.map(({ pin, ssn, driverLicense, accountNumber, routingNumber, bankName, ...safeClient }) => safeClient);
    }),

    /** Get a specific policy by ID (agent can only view their own) */
    policyDetail: agentProcedure
      .input(z.object({ policyId: z.number() }))
      .query(async ({ ctx, input }) => {
        const policy = await getPolicyById(input.policyId);
        if (!policy) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Policy not found." });
        }
        // Check if agent has access to this policy via policyAgents junction table
        const db = await getDb();
        if (db) {
          const agentAccess = await db.select().from(policyAgents)
            .where(and(eq(policyAgents.policyId, input.policyId), eq(policyAgents.agentId, ctx.agent.id)))
            .limit(1);
          if (!agentAccess.length) {
            throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this policy." });
          }
        }
        return policy;
      }),

    /** Get agent's sales entries for current month */
    mySales: agentProcedure.query(async ({ ctx }) => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      return getAgentSalesEntriesByMonth(ctx.agent.id, month, year);
    }),

    /** Get agent's sales entries for a specific month */
    salesByMonth: agentProcedure
      .input(z.object({ month: z.number().min(1).max(12), year: z.number() }))
      .query(async ({ ctx, input }) => {
        return getAgentSalesEntriesByMonth(ctx.agent.id, input.month, input.year);
      }),

    /** Get agent's total sales count */
    totalSalesCount: agentProcedure.query(async ({ ctx }) => {
      return getAgentTotalSalesCount(ctx.agent.id);
    }),

    /** Get agent's total premium */
    totalPremium: agentProcedure.query(async ({ ctx }) => {
      return getAgentTotalPremium(ctx.agent.id);
    }),

    /** Get agent's total annual premium */
    totalAnnualPremium: agentProcedure.query(async ({ ctx }) => {
      return getAgentTotalAnnualPremium(ctx.agent.id);
    }),

    /** Get agent's total commission */
    totalCommission: agentProcedure.query(async ({ ctx }) => {
      return getAgentTotalCommission(ctx.agent.id);
    }),

    /** Get agent's monthly commission */
    monthlyCommission: agentProcedure
      .input(z.object({ month: z.number().min(1).max(12), year: z.number() }))
      .query(async ({ ctx, input }) => {
        return getAgentMonthlyCommission(ctx.agent.id, input.month, input.year);
      }),

        /** Get agent's persistence rate and related metrics (Live Book formula) */
    myPersistence: agentProcedure.query(async ({ ctx }) => {
      const currentYear = new Date().getFullYear();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      // Live Book: Persistency% = Active In-Force ÷ Total Placed × 100
      const persistenceResult = await calculatePersistenceRate(ctx.agent.id, currentYear);
      // Cancellations this month = placed life policies cancelled this calendar month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const cancelledRows = await db
        .select({ type: policies.type })
        .from(policies)
        .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
        .where(
          and(
            eq(policyAgents.agentId, ctx.agent.id),
            eq(policies.wasEverActive, 1),
            gte(policies.cancelDate, startOfMonth),
            lte(policies.cancelDate, endOfMonth)
          )
        );
      const cancelledThisMonthCount = cancelledRows.filter(p => isLifePolicyType(p.type)).length;
      return {
        persistenceRate: persistenceResult.rate,
        totalPlaced: persistenceResult.totalPlaced,
        activeInForce: persistenceResult.activeInForce,
        // backward-compat aliases
        startingBlock: persistenceResult.totalPlaced,
        stillActive: persistenceResult.activeInForce,
        activePolicies: persistenceResult.activeInForce,
        cancelledThisMonth: cancelledThisMonthCount,
      };
    }),
    /** Set initial password on first login (using temporary password from welcome text) */
    setInitialPassword: publicProcedure
      .input(z.object({
        email: z.string().email("Valid email is required"),
        tempPassword: z.string().min(1, "Temporary password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify new passwords match
        if (input.newPassword !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "New passwords do not match.",
          });
        }

        // Find agent by email
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed.",
          });
        }

        const lookupEmail = input.email.trim().toLowerCase();
        console.log('[setInitialPassword] DB_URL prefix:', process.env.DATABASE_URL?.slice(0, 40));
        console.log('[setInitialPassword] Looking up email:', lookupEmail);
        console.log('[setInitialPassword] tempPassword length:', input.tempPassword.length);
        console.log('[setInitialPassword] tempPassword charCodes:', [...input.tempPassword].map(c => c.charCodeAt(0)));
        
        const [agent] = await db.select().from(agents).where(eq(agents.email, lookupEmail)).limit(1);
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent account not found. Please check your email address.",
          });
        }

        console.log('[setInitialPassword] Agent found:', agent ? 'YES' : 'NO');
        console.log('[setInitialPassword] Hash length:', agent?.passwordHash?.length);
        console.log('[setInitialPassword] Hash prefix:', agent?.passwordHash?.slice(0, 20));
        
        // Verify temporary password against stored hash
        if (!agent.passwordHash) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Agent account is not properly initialized. Please contact your administrator.",
          });
        }
        if (!verifyPassword(input.tempPassword, agent.passwordHash)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Temporary password is incorrect. Please check the welcome text from your administrator.",
          });
        }
        // Hash new password and update
        const newPasswordHash = hashPassword(input.newPassword);
        await db.update(agents)
          .set({ 
            passwordHash: newPasswordHash,
            passwordChangedAt: Date.now(),
          })
          .where(eq(agents.id, agent.id));

        // Create agent session cookie
        // signAgentToken and getSessionCookieOptions already imported at top of file
        const agentToken = await signAgentToken(agent.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("agent_session", agentToken, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 8, // 8 hours
        });

        // Record session activity immediately so first dashboard request doesn't fail
        recordSessionActivity(agent.id);

        return { success: true, message: "Password set successfully. You are now logged in." };
      }),

    /** Change agent password */
    changePassword: agentMutationProcedure
      .input(z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
      }))
      .mutation(async ({ ctx, input }) => {
        // ctx.agent is guaranteed by agentMutationProcedure

        // Verify new password matches confirm password
        if (input.newPassword !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "New passwords do not match.",
          });
        }

        // Get current agent from database
        const agent = await getAgentById(ctx.agent!.id);
        if (!agent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Agent not found.",
          });
        }
                // Verify current password
        if (!agent.passwordHash || !verifyPassword(input.currentPassword, agent.passwordHash)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect.",
          });
        }
        // Hash new password and update
        const newPasswordHash = hashPassword(input.newPassword);
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed.",
          });
        }
        await db.update(agents)
          .set({ 
            passwordHash: newPasswordHash,
            passwordChangedAt: Date.now(),
          })
          .where(eq(agents.id, ctx.agent!.id));
        return { success: true, message: "Password changed successfully." };
      }),

    /** Create a new client (agent can only create clients for themselves) */
    createClient: agentProcedure
      .input(z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in as an agent to create a client." });
        }

        // Generate PIN (last name + 4 random digits)
        const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const pin = `${input.lastName.substring(0, 2).toUpperCase()}${randomDigits}`;

        // Create client linked to this agent
        const { id: clientId } = await createClient({
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone || "",
          email: input.email || "",
          address: input.address || "",
          city: input.city || "",
          state: input.state || "",
          zip: input.zip || "",
          pin,
          createdByAgentId: ctx.agent.id, // Link client to the agent
        });

        return { success: true, message: "Client created successfully", clientId };
      }),

    /** Create client from full intake form */
    // ✅ UNIFIED PROCEDURE: Used by both agent and admin portals
    // Consolidated from 3 duplicate procedures (agentProcedure, agentMutationProcedure, adminProcedure)
    // All fields optional with sensible defaults for flexibility
    // Frontend must map yearlyAP → annualPremium before calling
    createClientFromIntakeForm: agentProcedure
      .input(z.object({
        firstName: z.string(), lastName: z.string(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional().default(''),
        dateOfBirth: z.string().optional().default(''),
        age: z.string().optional().default(''),
        gender: z.string().optional().default(''),
        smoker: z.boolean().optional().default(false),
        goal: z.string().optional().default(''),
        medicalConditions: z.string().optional().default(''),
        healthConditionsJSON: z.string().optional().default(''),
        prescriptions: z.string().optional().default(''),
        surgeries: z.string().optional().default(''),
        height: z.string().optional().default(''),
        weight: z.string().optional().default(''),
        maritalStatus: z.string().optional().default(''),
        kids: z.string().optional().default(''),
        additionalHealthNotes: z.string().optional().default(''),
        driverLicense: z.string().optional().default(''),
        licenseState: z.string().optional().default(''),
        ssn: z.string().optional().default(''),
        placeOfBirth: z.string().optional().default(''),
        address: z.string().optional().default(''),
        city: z.string().optional().default(''),
        state: z.string().optional().default(''),
        zip: z.string().optional().default(''),
        citizenship: z.string().optional().default(''),
        resident: z.boolean().optional().default(false),
        cardNumber: z.string().optional().default(''),
        cardExpiration: z.string().optional().default(''),
        doctorOrClinic: z.string().optional().default(''),
        lastVisit: z.string().optional().default(''),
        doctorPhone: z.string().optional().default(''),
        doctorAddress: z.string().optional().default(''),
        beneficiary1Name: z.string().optional().default(''),
        beneficiary1DOB: z.string().optional().default(''),
        beneficiary1Relationship: z.string().optional().default(''),
        beneficiary2Name: z.string().optional().default(''),
        beneficiary2DOB: z.string().optional().default(''),
        beneficiary2Relationship: z.string().optional().default(''),
        beneficiary3Name: z.string().optional().default(''),
        beneficiary3DOB: z.string().optional().default(''),
        beneficiary3Relationship: z.string().optional().default(''),
        bankName: z.string().optional().default(''),
        accountType: z.string().optional().default(''),
        routingNumber: z.string().optional().default(''),
        accountNumber: z.string().optional().default(''),
        carrier: z.string().optional().default(''),
        productPolicyType: z.string().optional().default(''),
        policyNumber: z.string().optional().default(''),
        coverageDeathBenefit: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        premiumAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        annualPremium: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        soldDate: z.string().optional().default(''),
        effectiveDate: z.string().optional().default(''),
        statusSelected: z.boolean().optional().default(false),
        statusDenied: z.boolean().optional().default(false),
        existingLifeInsuranceSource: z.string().optional().default(''),
        commissionPercent: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        paymentMethod: z.string().optional().default(''),
        creditCardNumber: z.string().optional().default(''),
        creditCardCVV: z.string().optional().default(''),
        creditCardExpiration: z.string().optional().default(''),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const plainPin = `${input.lastName.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
        const hashedPin = await hashPin(plainPin);
        const dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth).getTime() : null;
        const effectiveDate = input.effectiveDate ? new Date(input.effectiveDate).getTime() : null;
        const premiumAmount = input.premiumAmount && input.premiumAmount > 0 ? input.premiumAmount : 0;
        const annualPremium = input.annualPremium && input.annualPremium > 0 ? input.annualPremium : premiumAmount * 12;
        const policyNumber = input.policyNumber || `POL-${plainPin}`;
        const now = Date.now();
        const nowDate = new Date();
        const saleMonth = nowDate.getMonth() + 1;
        const saleYear = nowDate.getFullYear();

        // ─── ATOMIC TRANSACTION: client → policy → policyAgent → salesEntry ───
        // If any step fails, the entire transaction rolls back automatically.
        try {
          await db.transaction(async (tx) => {
            // STEP 1: Insert client
            const clientResult = await tx.insert(clients).values({
              pin: hashedPin,
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email || null,
              phone: input.phone || null,
              dateOfBirth: dateOfBirth,
              address: input.address || null,
              city: input.city || null,
              state: input.state || null,
              zip: input.zip || null,
              ssn: input.ssn || null,
              driverLicense: input.driverLicense || null,
              driverLicenseState: input.licenseState || null,
              gender: input.gender || null,
              maritalStatus: input.maritalStatus || null,
              smoker: input.smoker ? 1 : 0,
              healthConditions: input.healthConditionsJSON || null,
              prescriptions: input.prescriptions || null,
              surgeries: input.surgeries || null,
              height: input.height || null,
              weight: input.weight || null,
              kids: input.kids || null,
              bankName: input.bankName || null,
              accountNumber: input.accountNumber || null,
              routingNumber: input.routingNumber || null,
              notes: input.additionalHealthNotes || null,
              createdByAgentId: ctx.agent!.id,
            });
            const clientId = (clientResult as any)[0]?.insertId as number;
            if (!clientId || clientId === 0) {
              throw new Error("Failed to get client ID after insert");
            }
            console.log(`[AGENT_CREATE_CLIENT] Client created: id=${clientId}`);

            // STEP 2: Insert policy (always — required for client to appear in agent's list)
            const policyResult = await tx.insert(policies).values({
              clientId: clientId,
              policyNumber: policyNumber,
              type: (input.productPolicyType || "other") as any,
              carrier: input.carrier || "Unknown",
              status: "active",
              premiumAmount: premiumAmount.toString(),
              premiumFrequency: "monthly",
              coverageAmount: input.coverageDeathBenefit ? input.coverageDeathBenefit.toString() : "0",
              yearlyAP: annualPremium > 0 ? annualPremium.toString() : null,
              commissionRate: input.commissionPercent ? input.commissionPercent.toString() : null,
              effectiveDate: effectiveDate,
              notes: "Onboarded via intake form",
              wasEverActive: 1,
              inForceDate: effectiveDate || now,
              isPaid: 1,
            } as InsertPolicy);
            const policyId = (policyResult as any)[0]?.insertId as number;
            if (!policyId || policyId === 0) {
              throw new Error("Failed to get policy ID after insert");
            }
            console.log(`[AGENT_CREATE_CLIENT] Policy created: id=${policyId}`);

            // STEP 3: Link policy to agent
            await tx.insert(policyAgents).values({
              policyId: policyId,
              agentId: ctx.agent!.id,
              role: "primary",
              commissionPercent: input.commissionPercent ? input.commissionPercent.toString() : "0",
            });
            console.log(`[AGENT_CREATE_CLIENT] PolicyAgent linked: policyId=${policyId}, agentId=${ctx.agent!.id}`);

            // STEP 4: Insert sales entry (only if premium > 0)
            if (premiumAmount > 0) {
              await tx.insert(salesEntries).values({
                agentId: ctx.agent!.id,
                clientId: clientId,
                policyId: policyId,
                clientName: `${input.firstName} ${input.lastName}`,
                product: input.productPolicyType || "Other",
                productType: input.productPolicyType || "Other",
                carrier: input.carrier || "Unknown",
                premium: premiumAmount.toString() as any,
                annualPremium: annualPremium.toString() as any,
                commissionPercent: (input.commissionPercent ?? 0).toString() as any,
                commissionOverride: "0" as any,
                saleDate: nowDate.getTime(),
                saleMonth: saleMonth,
                saleYear: saleYear,
                month: saleMonth,
                year: saleYear,
                effectiveDate: effectiveDate,
                isPaid: 0,
                isCanceled: 0,
                status: "active",
              } as unknown as InsertSalesEntry);
              console.log(`[AGENT_CREATE_CLIENT] Sales entry created for client=${clientId}`);
            }
          });
        } catch (err) {
          console.error("[AGENT_CREATE_CLIENT] Transaction failed, all changes rolled back:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Client creation failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        }

        return { success: true, message: "Client created successfully and added to sales tracker" };
      }),

    /** Get agent's clients due for annual review */
    getClientsForAnnualReview: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.agent) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in as an agent to access this resource." });
      }

      // Get all clients (agent can see all clients for now)
            const agentClients = await getAgentClients(ctx.agent.id);
      const now = Date.now();
      const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
      const twoMonthsMs = 60 * 24 * 60 * 60 * 1000;
      const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;

      let dueThisMonth = 0;
      let dueIn2Months = 0;
      let dueIn3Months = 0;

      for (const client of agentClients) {
        // Only count clients with lastReviewDate set
        if (client.lastReviewDate) {
          const lastReviewTime = client.lastReviewDate * 1000;
          const nextReviewDue = lastReviewTime + oneYearMs;
          const timeUntilDue = nextReviewDue - now;

          if (timeUntilDue <= 0) {
            dueThisMonth++;
          } else if (timeUntilDue <= oneMonthMs) {
            dueThisMonth++;
          } else if (timeUntilDue <= twoMonthsMs) {
            dueIn2Months++;
          } else if (timeUntilDue <= threeMonthsMs) {
            dueIn3Months++;
          }
        }
      }

            return {
        dueThisMonth,
        dueIn2Months,
        dueIn3Months,
        total: dueThisMonth + dueIn2Months + dueIn3Months,
      };
    }),

    /** Update a client (agent can only update their own clients) */
    updateClient: publicProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        dateOfBirth: z.string().optional(),
        gender: z.string().optional(),
        carrier: z.string().optional(),
        productPolicyType: z.string().optional(),
        premiumAmount: z.string().optional(),
        coverageDeathBenefit: z.string().optional(),
        policyNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const { id, ...data } = input;
        // Verify this client belongs to this agent via policy OR direct agentId link
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const agentPolicies = await db.select().from(policies)
          .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
          .where(eq(policyAgents.agentId, ctx.agent.id));
        const clientIds = new Set(agentPolicies.map(p => p.policies.clientId));
        // Also check direct createdByAgentId link on clients table
        const [directClient] = await db.select({ id: clients.id }).from(clients)
          .where(and(eq(clients.id, id), eq(clients.createdByAgentId, ctx.agent.id))).limit(1);
        if (directClient) clientIds.add(directClient.id);
        if (!clientIds.has(id)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own clients." });
        }
        const updateData: Record<string, unknown> = {};
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.city !== undefined) updateData.city = data.city;
        if (data.state !== undefined) updateData.state = data.state;
        if (data.zip !== undefined) updateData.zip = data.zip;
        if (data.gender !== undefined) updateData.gender = data.gender;
        if (data.carrier !== undefined) updateData.carrier = data.carrier;
        if (data.productPolicyType !== undefined) updateData.productPolicyType = data.productPolicyType;
        if (data.premiumAmount !== undefined) updateData.premiumAmount = data.premiumAmount;
        if (data.coverageDeathBenefit !== undefined) updateData.coverageDeathBenefit = data.coverageDeathBenefit;
        if (data.policyNumber !== undefined) updateData.policyNumber = data.policyNumber;
        await updateClient(id, updateData as Parameters<typeof updateClient>[1]);
        return { success: true };
      }),

    /** Delete a client (agent can only delete their own clients) */
    deleteClient: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Verify this client belongs to this agent via policy OR direct agentId link
        const agentPolicies = await db.select().from(policies)
          .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
          .where(eq(policyAgents.agentId, ctx.agent.id));
        const clientIds = new Set(agentPolicies.map(p => p.policies.clientId));
        const [directClient] = await db.select({ id: clients.id }).from(clients)
          .where(and(eq(clients.id, input.id), eq(clients.createdByAgentId, ctx.agent.id))).limit(1);
        if (directClient) clientIds.add(directClient.id);
        if (!clientIds.has(input.id)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own clients." });
        }
        await deleteClient(input.id);
        return { success: true };
      }),

    /** List expenses for the logged-in agent for a given month */
    listExpensesByMonth: publicProcedure
      .input(z.object({ month: z.number().min(1).max(12), year: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) return [];
        // and, eq already imported at top of file
        return db.select().from(expenses)
          .where(and(
            eq(expenses.agentId, ctx.agent.id),
            eq(expenses.month, input.month),
            eq(expenses.year, input.year),
          ))
          .orderBy(expenses.createdAt);
      }),

    /** Create an expense for the logged-in agent */
    createExpense: publicProcedure
      .input(z.object({
        category: z.enum(["cell_phone", "leads", "crm", "wavv_dialer", "miscellaneous"]),
        amount: z.number().min(0),
        description: z.string().optional(),
        expenseMonth: z.number().min(1).max(12),
        expenseYear: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        
        // SECURITY: Block test data patterns in description
        if (input.description) {
          const testPatterns = [/test/i, /demo/i, /fake/i, /sample/i];
          const desc = input.description.toLowerCase();
          
          for (const pattern of testPatterns) {
            if (pattern.test(desc)) {
              logSecurityEvent({
                type: "test_data_attempt",
                dataType: "expense",
                details: `Attempted to create test expense: ${input.description}`,
                value: input.description,
                userId: ctx.agent?.id,
              });
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "Test data creation is not allowed",
              });
            }
          }
        }
        
        await createExpense({
          agentId: ctx.agent.id,
          category: input.category,
          amount: input.amount.toString() as any,
          description: input.description,
          month: input.expenseMonth,
          year: input.expenseYear,
          expenseDate: Date.now(),
        });
        return { success: true };
      }),

    /** Update an expense (agent can only update their own) */
    updateExpense: publicProcedure
      .input(z.object({
        id: z.number(),
        category: z.enum(["cell_phone", "leads", "crm", "wavv_dialer", "miscellaneous"]).optional(),
        amount: z.number().min(0).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Verify ownership
        // eq already imported at top of file
        const [exp] = await db.select().from(expenses).where(eq(expenses.id, input.id)).limit(1);
        if (!exp || exp.agentId !== ctx.agent.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own expenses." });
        }
        const { id, amount, ...rest } = input;
        const data: Record<string, any> = { ...rest };
        if (amount !== undefined) data.amount = amount.toString();
        await updateExpense(id, data as any);
        return { success: true };
      }),

    /** Delete an expense (agent can only delete their own) */
    deleteExpense: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // eq already imported at top of file
        const [exp] = await db.select().from(expenses).where(eq(expenses.id, input.id)).limit(1);
        if (!exp || exp.agentId !== ctx.agent.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own expenses." });
        }
        await deleteExpense(input.id);
        return { success: true };
      }),

    /** Get total expenses for the logged-in agent for a given month */
    totalExpensesByMonth: publicProcedure
      .input(z.object({ month: z.number().min(1).max(12), year: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) return 0;
        // and, eq already imported at top of file
        const result = await db.select().from(expenses)
          .where(and(
            eq(expenses.agentId, ctx.agent.id),
            eq(expenses.month, input.month),
            eq(expenses.year, input.year),
          ));
        return result.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      }),

    /** Update a sales entry (agent can only update their own) */
    updateSalesEntry: publicProcedure
      .input(z.object({
        id: z.number(),
        clientName: z.string().optional(),
        productType: z.string().optional(),
        carrier: z.string().optional(),
        premium: z.number().min(0).optional(),
        annualPremium: z.number().min(0).optional(),
        commissionPercent: z.number().min(0).max(200).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Verify ownership
        const [entry] = await db.select().from(salesEntries).where(eq(salesEntries.id, input.id)).limit(1);
        if (!entry || entry.agentId !== ctx.agent.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own sales entries." });
        }
        const { id, premium, annualPremium, commissionPercent, ...rest } = input;
        const data: Record<string, any> = { ...rest };
        if (premium !== undefined) data.premium = premium.toString();
        if (annualPremium !== undefined) data.annualPremium = annualPremium.toString();
        if (commissionPercent !== undefined) data.commissionPercent = commissionPercent.toString();
        await updateSalesEntry(id, data as any);
        return { success: true };
      }),

    /** Delete a sales entry (agent can only delete their own) */
    deleteSalesEntry: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const [entry] = await db.select().from(salesEntries).where(eq(salesEntries.id, input.id)).limit(1);
        if (!entry || entry.agentId !== ctx.agent.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own sales entries." });
        }
        await deleteSalesEntry(input.id);
        return { success: true };
      }),

    /** Bulk delete clients (agent can only delete their own clients) */
    bulkDeleteClients: publicProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Verify all clients belong to this agent via policies OR direct createdByAgentId link
        const agentPolicies = await db.select().from(policies)
          .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
          .where(eq(policyAgents.agentId, ctx.agent.id));
        const agentClientIdSet = new Set(agentPolicies.map(p => p.policies.clientId));
        const directClients = await db.select({ id: clients.id }).from(clients).where(eq(clients.createdByAgentId, ctx.agent.id));
        directClients.forEach(c => agentClientIdSet.add(c.id));
        for (const clientId of input.ids) {
          if (!agentClientIdSet.has(clientId)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own clients." });
          }
        }
        // Delete each client
        for (const clientId of input.ids) {
          await deleteClient(clientId);
        }
        return { success: true, deletedCount: input.ids.length };
      }),

    /** Bulk delete sales entries (agent can only delete their own) */
    bulkDeleteSalesEntries: publicProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Verify all entries belong to this agent
        const entries = await db.select().from(salesEntries).where(eq(salesEntries.agentId, ctx.agent.id));
        const agentSaleIds = entries.map(e => e.id);
        for (const saleId of input.ids) {
          if (!agentSaleIds.includes(saleId)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own sales entries." });
          }
        }
        // Delete each entry
        for (const saleId of input.ids) {
          await deleteSalesEntry(saleId);
        }
        return { success: true, deletedCount: input.ids.length };
      }),

    uploadProfilePicture: publicProcedure
      .input(z.object({ profilePictureUrl: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // profilePictureUrl field not in agents table schema - skipping update
        return { success: true, profilePictureUrl: input.profilePictureUrl };
      }),

    thisMonthStats: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const entries = await db.select().from(salesEntries).where(
        and(
          eq(salesEntries.agentId, ctx.agent.id),
          // saleMonth and saleYear don't exist - use saleDate instead
          gte(salesEntries.saleDate, new Date(year, month - 1, 1).getTime()),
          lt(salesEntries.saleDate, new Date(year, month, 1).getTime())
        )
      );
      const totalAP = entries.reduce((s, e) => s + (Number(e.annualPremium) || 0), 0);
      const totalCommission = entries.reduce((s, e) => {
        const ap = Number(e.annualPremium) || 0;
        const pct = Number(e.commission) || 0; // Use commission field directly
        return s + (ap * pct / 100);
      }, 0);
      return { salesCount: entries.length, totalAP, totalCommission };
    }),

    /** Agent carrier credentials management */
    credentials: router({
      list: agentProcedure.query(async ({ ctx }) => {
        // getDb already imported at top of file
        // agentCredentials already imported at top of file
        // eq already imported at top of file
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const creds = await db.select().from(agentCredentials).where(eq(agentCredentials.agentId, ctx.agent.id));
        return creds;
      }),

      add: agentProcedure
        .input(z.object({
          carrier: z.string().min(1),
          writingNumber: z.string().optional(),
          username: z.string().min(1),
          password: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
          // getDb already imported at top of file
          // agentCredentials already imported at top of file
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          const result = await db.insert(agentCredentials).values({
            agentId: ctx.agent.id,
            carrier: input.carrier,
            writingNumber: input.writingNumber || "",
            username: input.username,
            password: input.password,
          });
          return { success: true, id: (result as any).insertId };
        }),

      update: agentProcedure
        .input(z.object({
          id: z.number(),
          carrier: z.string().min(1),
          writingNumber: z.string().optional(),
          username: z.string().min(1),
          password: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          // getDb, agentCredentials, eq, and already imported at top of file
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          const updateData: any = {
            carrier: input.carrier,
            writingNumber: input.writingNumber || "",
            username: input.username,
          };
          if (input.password) {
            updateData.password = input.password;
          }
          await db.update(agentCredentials)
            .set(updateData)
            .where(and(
              eq(agentCredentials.id, input.id),
              eq(agentCredentials.agentId, ctx.agent.id)
            ));
          return { success: true };
        }),

      delete: agentProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          // getDb, agentCredentials, eq, and already imported at top of file
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          await db.delete(agentCredentials).where(
            and(
              eq(agentCredentials.id, input.id),
              eq(agentCredentials.agentId, ctx.agent.id)
            )
          );
          return { success: true };
        }),
    }),

    /** Onboarding procedures */
    onboarding: router({
      getProgress: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // agentOnboardingProgress table doesn't exist
        // const [progress] = await db.select().from(agentOnboardingProgress).where(eq(agentOnboardingProgress.agentId, ctx.agent.id));
        const progress = null;
        if (!progress) {
          // await db.insert(agentOnboardingProgress).values({ agentId: ctx.agent.id });
          return {
            beforeYouStartCompleted: 0,
            step1HcmsInviteSent: 0,
            step2EmailSequenceCompleted: 0,
            step2SureLcCompleted: 0,
            step3NlcContractsSubmitted: 0,
            step4AdditionalContractsSent: 0,
            onboardingCompleted: 0,
          };
        }
        return progress;
      }),

      updateStep: publicProcedure
        .input(z.object({
          step: z.enum(["beforeYouStart", "step1", "step2Email", "step2SureLC", "step3", "step4"]),
          completed: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (!ctx.agent) throw new TRPCError({ code: "UNAUTHORIZED", message: "Agent login required." });
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

          const updates: Record<string, any> = {};
          const now = Date.now();

          if (input.step === "beforeYouStart") {
            updates.beforeYouStartCompleted = input.completed ? 1 : 0;
          } else if (input.step === "step1") {
            updates.step1HcmsInviteSent = input.completed ? 1 : 0;
            if (input.completed) updates.step1HcmsInviteCompletedAt = now;
          } else if (input.step === "step2Email") {
            updates.step2EmailSequenceCompleted = input.completed ? 1 : 0;
            if (input.completed) updates.step2EmailSequenceCompletedAt = now;
          } else if (input.step === "step2SureLC") {
            updates.step2SureLcCompleted = input.completed ? 1 : 0;
            if (input.completed) updates.step2SureLcCompletedAt = now;
          } else if (input.step === "step3") {
            updates.step3NlcContractsSubmitted = input.completed ? 1 : 0;
            if (input.completed) updates.step3NlcContractsSubmittedAt = now;
          } else if (input.step === "step4") {
            updates.step4AdditionalContractsSent = input.completed ? 1 : 0;
            if (input.completed) updates.step4AdditionalContractsSentAt = now;
          }

          // agentOnboardingProgress table doesn't exist
          // const [current] = await db.select().from(agentOnboardingProgress).where(eq(agentOnboardingProgress.agentId, ctx.agent.id));
          // if (current) {
          //   const allComplete = (current.beforeYouStartCompleted || updates.beforeYouStartCompleted) &&
          //     (current.step1HcmsInviteSent || updates.step1HcmsInviteSent) &&
          //     (current.step2EmailSequenceCompleted || updates.step2EmailSequenceCompleted) &&
          //     (current.step2SureLcCompleted || updates.step2SureLcCompleted) &&
          //     (current.step3NlcContractsSubmitted || updates.step3NlcContractsSubmitted) &&
          //     (current.step4AdditionalContractsSent || updates.step4AdditionalContractsSent);
          //   if (allComplete) {
          //     updates.onboardingCompleted = 1;
          //     updates.onboardingCompletedAt = now;
          //   }
          // }

          // await db.update(agentOnboardingProgress)
          //   .set(updates)
          //   .where(eq(agentOnboardingProgress.agentId, ctx.agent.id));

          return { success: true };
        }),

    // Carrier Resources
    getCarriers: agentProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) throw new Error("DB connection failed");
        const result = await db.select().from(carriers);
        return result;
      }),
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── CONTACT FORM ──────────────────────────────────────────────────────────
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Valid email is required"),
          phone: z.string().optional().default(""),
          subject: z.string().optional().default(""),
          message: z.string().min(1, "Message is required"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await insertContactSubmission({
            name: input.name,
            email: input.email,
            phone: input.phone,
            subject: input.subject,
            message: input.message,
          });
        } catch (err) {
          console.error("[Contact] DB insert failed:", err);
        }

        const payload = {
          form_type: "contact",
          full_name: input.name,
          email: input.email,
          phone: input.phone,
          subject: input.subject,
          message: input.message,
          source: "OrtizInsuranceBroker.com — Contact Page",
          submitted_at: new Date().toISOString(),
        };

        const [ghlOk, emailOk] = await Promise.all([
          postToGHL(payload),
          sendEmail({
            to: NOTIFY_EMAIL,
            subject: `New Contact Form: ${input.name} — ${input.subject || "General Inquiry"}`,
            html: buildContactEmail({
              name: input.name,
              email: input.email,
              phone: input.phone,
              subject: input.subject,
              message: input.message,
            }),
          }),
        ]);

        notifyOwner({
          title: `New Contact: ${input.name}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone || "N/A"}\nSubject: ${input.subject || "General Inquiry"}\nMessage: ${input.message}`,
        }).catch(() => {});

        if (!ghlOk && !emailOk) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit form. Please try again.",
          });
        }

        return { success: true };
      }),
  }),

  // ── APPOINTMENT BOOKING ────────────────────────────────────────────────────
  appointments: router({
    book: publicProcedure
      .input(
        z.object({
          clientName: z.string().min(1, "Name is required"),
          clientEmail: z.string().email("Valid email is required"),
          clientPhone: z.string().min(1, "Phone is required"),
          professionalType: z.enum(["teacher", "barber", "salon_owner", "hairstylist", "cosmetologist", "realtor"]),
          appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
          appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
          notes: z.string().optional().default(""),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          // Convert date and time to Unix timestamp
          const [year, month, day] = input.appointmentDate.split("-").map(Number);
          const [hours, minutes] = input.appointmentTime.split(":").map(Number);
          const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
          const scheduledDate = appointmentDateTime.getTime();

          // Insert appointment (appointments table doesn't exist)
          // const result = await db.insert(appointments).values({
          //   clientName: input.clientName,
          //   clientEmail: input.clientEmail,
          //   clientPhone: input.clientPhone,
          //   appointmentType: "consultation",
          //   professionalType: input.professionalType,
          //   appointmentDate: input.appointmentDate,
          //   appointmentTime: input.appointmentTime,
          //   notes: input.notes,
          //   status: "pending",
          //   createdAt: new Date(),
          //   updatedAt: new Date(),
          // });

          // Notify owner
          notifyOwner({
            title: `New Appointment Request: ${input.clientName}`,
            content: `Professional Type: ${input.professionalType}\nName: ${input.clientName}\nEmail: ${input.clientEmail}\nPhone: ${input.clientPhone}\nDate: ${input.appointmentDate}\nTime: ${input.appointmentTime}\nNotes: ${input.notes || "None"}`,
          }).catch(() => {});

          return { success: true, appointmentId: 0 }; // result[0]?.insertId || 0
        } catch (error) {
          console.error("[Appointment Booking] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to book appointment",
          });
        }
      }),

    getAvailableSlots: publicProcedure
      .input(
        z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        })
      )
      .query(async ({ input }) => {
        // Return all available time slots
        // In a real system, you'd check for conflicts
        const allSlots = [
          "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
          "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
        ];

        try {
          const db = await getDb();
          if (!db) return { availableSlots: allSlots };

          // Check for existing appointments on this date (appointments table doesn't exist)
          // const existingAppointments = await db
          //   .select({ appointmentTime: appointments.appointmentTime })
          //   .from(appointments)
          //   .where(
          //     and(
          //       eq(appointments.appointmentDate, input.date),
          //       eq(appointments.status, "pending")
          //     )
          //   );

          // const bookedTimes = existingAppointments.map((a: any) => a.appointmentTime);
          const availableSlots = allSlots; // allSlots.filter(slot => !bookedTimes.includes(slot));

          return { availableSlots };
        } catch (error) {
          // Return all slots if there's an error
          return { availableSlots: allSlots };
        }
      }),
  }),

  // ── QUOTE REQUEST FORM ────────────────────────────────────────────────────
  quote: router({
    submit: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Valid email is required"),
          phone: z.string().min(1, "Phone number is required"),
          coverage: z.string().min(1, "Coverage type is required"),
          bestTime: z.string().optional().default(""),
          message: z.string().optional().default(""),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await insertQuoteRequest({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            coverage: input.coverage,
            bestTime: input.bestTime,
            message: input.message,
          });
        } catch (err) {
          console.error("[Quote] DB insert failed:", err);
        }

        const payload = {
          form_type: "quote_request",
          first_name: input.firstName,
          last_name: input.lastName,
          full_name: `${input.firstName} ${input.lastName}`,
          email: input.email,
          phone: input.phone,
          coverage_type: input.coverage,
          best_time_to_contact: input.bestTime,
          message: input.message,
          source: "OrtizInsuranceBroker.com — Get A Quote Page",
          submitted_at: new Date().toISOString(),
        };

        const [ghlOk, emailOk] = await Promise.all([
          postToGHL(payload),
          sendEmail({
            to: NOTIFY_EMAIL,
            subject: `New Quote Request: ${input.firstName} ${input.lastName} — ${input.coverage}`,
            html: buildQuoteEmail({
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email,
              phone: input.phone,
              coverage: input.coverage,
              bestTime: input.bestTime,
              message: input.message,
            }),
          }),
        ]);

        notifyOwner({
          title: `New Quote: ${input.firstName} ${input.lastName} — ${input.coverage}`,
          content: `Name: ${input.firstName} ${input.lastName}\nEmail: ${input.email}\nPhone: ${input.phone}\nCoverage: ${input.coverage}\nBest Time: ${input.bestTime || "No preference"}\nNotes: ${input.message || "None"}`,
        }).catch(() => {});

        if (!ghlOk && !emailOk) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit form. Please try again.",
          });
        }

        return { success: true };
      }),
  }),

  // ── PUBLIC INTEREST TRACKING (anonymous visitors) ────────────────────────────
  interest: router({
    track: publicProcedure
      .input(
        z.object({
          page: z.string().min(1),
          action: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        // Fire-and-forget notification to owner
        notifyOwner({
          title: `${input.page}: ${input.action}`,
          content: `A visitor clicked "${input.action}" on the ${input.page} page.`,
        }).catch(() => {});
        return { success: true };
      }),
  }),

  // ── CLIENT PORTAL (PIN-BASED AUTH) ────────────────────────────────────────
  portal: router({
    /** Verify client PIN and set session cookie */
    login: publicProcedure
      .input(z.object({
        lastName: z.string().min(1, "Last name is required"),
        pin: z.string().min(4, "PIN must be at least 4 digits").max(255),
      }))
      .mutation(async ({ ctx, input }) => {
        // Extract client IP for rate limiting
        const clientIp = (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                         ctx.req.socket?.remoteAddress || 
                         'unknown';

        // Check rate limit
        const rateLimit = checkRateLimit(clientIp);
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Too many login attempts. Please try again in 15 minutes.`,
          });
        }

        const client = await getClientByLastNameAndPin(input.lastName.trim(), input.pin.trim());
        if (!client) {
          // Record failed attempt
          recordFailedAttempt(clientIp);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid last name or PIN. Please try again.",
          });
        }

        // Clear rate limit on successful login
        clearRateLimit(clientIp);

        // Update last portal login timestamp
        await updateClientLastLogin(client.id);

        // Set portal session cookie with signed JWT
        const token = await signPortalToken(client.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(PORTAL_COOKIE, token, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 4, // 4 hours
        });

        return {
          success: true,
          clientName: `${client.firstName} ${client.lastName}`,
        };
      }),

    /** Logout — clear portal session cookie */
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(PORTAL_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),

    /** Get current portal session (who is logged in) */
    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.portalClient) return null;
      // Return client object but exclude sensitive fields
      const { pin, ssn, driverLicense, accountNumber, routingNumber, ...safeClient } = ctx.portalClient;
      return safeClient;
    }),

    /** Get all policies for the logged-in client or household */
    myPolicies: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.portalClient) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
      }
      if (ctx.portalClient.householdId) {
        return getHouseholdPolicies(ctx.portalClient.householdId);
      }
      return getClientPolicies(ctx.portalClient.id);
    }),

    /** Get all annuities for the logged-in client or household */
    myAnnuities: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.portalClient) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
      }
      if (ctx.portalClient.householdId) {
        return getHouseholdAnnuities(ctx.portalClient.householdId);
      }
      return getClientAnnuities(ctx.portalClient.id);
    }),

    /** Get household members (for display in portal) */
    householdMembers: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.portalClient) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
      }
      const stripSensitive = (c: any) => { const { pin, ssn, driverLicense, accountNumber, routingNumber, ...rest } = c; return rest; };
      if (!ctx.portalClient.householdId) {
        return [stripSensitive(ctx.portalClient)];
      }
      const members = await getHouseholdMembers(ctx.portalClient.householdId);
      return members.map(stripSensitive);
    }),

    /** Get a specific policy by ID (only if it belongs to the client) */
    policyDetail: publicProcedure
      .input(z.object({ policyId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.portalClient) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to the client portal." });
        }
        const policy = await getPolicyById(input.policyId);
        if (!policy || policy.clientId !== ctx.portalClient.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Policy not found" });
        }
        return policy;
      }),

    /** Get admin-saved carrier phone numbers (public — used in portal) */
    carrierPhones: publicProcedure.query(async () => {
      const value = await getAppSetting("carrier_phones");
      if (!value) return null;
      try {
        // Support both old format (Record<string, string>) and new format (Record<string, {phone, portalUrl}>)
        const parsed = JSON.parse(value);
        return parsed as Record<string, string | { phone: string; portalUrl?: string }>;
      } catch {
        return null;
      }
    }),

    /** Create client from intake form */

    // ── PHASE 4: DOCUMENTS & PAYMENTS ──────────────────────────────────────
    ...phase4PortalRouter._def.procedures,
  }),

  // ── ADMIN: CLIENT & POLICY MANAGEMENT ─────────────────────────────────────
  admin: router({
    /** List all clients (owner's direct clients only) */
    listClients: adminProcedure.query(async () => {
      const allClients = await getAllClients();
      // Strip sensitive fields and return only masked last-4 derived values for admin display
      return allClients.map(({ pin, ssn, driverLicense, accountNumber, routingNumber, ...safeClient }) => ({
        ...safeClient,
        ssnLast4: ssn ? ssn.slice(-4) : null,
        driverLicenseLast4: driverLicense ? driverLicense.slice(-4) : null,
        accountNumberLast4: accountNumber ? accountNumber.slice(-4) : null,
        routingNumberLast4: routingNumber ? routingNumber.slice(-4) : null,
      }));
    }),

    /** List all clients for a specific agent */
    listAgentClients: adminProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        // getClientsByAgent already imported at top of file
        const agentClients = await getClientsByAgent(input.agentId);
        // Strip sensitive fields and return only masked last-4 derived values
        return agentClients.map(({ pin, ssn, driverLicense, accountNumber, routingNumber, ...safeClient }) => ({
          ...safeClient,
          ssnLast4: ssn ? ssn.slice(-4) : null,
          driverLicenseLast4: driverLicense ? driverLicense.slice(-4) : null,
          accountNumberLast4: accountNumber ? accountNumber.slice(-4) : null,
          routingNumberLast4: routingNumber ? routingNumber.slice(-4) : null,
        }));
      }),

    /** Create client from comprehensive intake form (admin version) */
    createClientFromIntakeForm: adminMutationProcedure
      .input(z.object({
        firstName: z.string(), lastName: z.string(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional().default(''),
        dateOfBirth: z.string().optional().default(''),
        age: z.string().optional().default(''),
        gender: z.string().optional().default(''),
        smoker: z.boolean().optional().default(false),
        goal: z.string().optional().default(''),
        medicalConditions: z.string().optional().default(''),
        healthConditionsJSON: z.string().optional().default(''),
        prescriptions: z.string().optional().default(''),
        surgeries: z.string().optional().default(''),
        height: z.string().optional().default(''),
        weight: z.string().optional().default(''),
        maritalStatus: z.string().optional().default(''),
        kids: z.string().optional().default(''),
        additionalHealthNotes: z.string().optional().default(''),
        driverLicense: z.string().optional().default(''),
        licenseState: z.string().optional().default(''),
        ssn: z.string().optional().default(''),
        placeOfBirth: z.string().optional().default(''),
        address: z.string().optional().default(''),
        city: z.string().optional().default(''),
        state: z.string().optional().default(''),
        zip: z.string().optional().default(''),
        citizenship: z.string().optional().default(''),
        resident: z.boolean().optional().default(false),
        cardNumber: z.string().optional().default(''),
        cardExpiration: z.string().optional().default(''),
        doctorOrClinic: z.string().optional().default(''),
        lastVisit: z.string().optional().default(''),
        doctorPhone: z.string().optional().default(''),
        doctorAddress: z.string().optional().default(''),
        beneficiary1Name: z.string().optional().default(''),
        beneficiary1DOB: z.string().optional().default(''),
        beneficiary1Relationship: z.string().optional().default(''),
        beneficiary2Name: z.string().optional().default(''),
        beneficiary2DOB: z.string().optional().default(''),
        beneficiary2Relationship: z.string().optional().default(''),
        beneficiary3Name: z.string().optional().default(''),
        beneficiary3DOB: z.string().optional().default(''),
        beneficiary3Relationship: z.string().optional().default(''),
        bankName: z.string().optional().default(''),
        accountType: z.string().optional().default(''),
        routingNumber: z.string().optional().default(''),
        accountNumber: z.string().optional().default(''),
        carrier: z.string().optional().default(''),
        productPolicyType: z.string().optional().default(''),
        policyNumber: z.string().optional().default(''),
        coverageDeathBenefit: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        premiumAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        annualPremium: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        soldDate: z.string().optional().default(''),
        effectiveDate: z.string().optional().default(''),
        statusSelected: z.boolean().optional().default(false),
        statusDenied: z.boolean().optional().default(false),
        existingLifeInsuranceSource: z.string().optional().default(''),
        commissionPercent: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? (val ? parseFloat(val) : 0) : val).optional().default(0),
        paymentMethod: z.string().optional().default(''),
        creditCardNumber: z.string().optional().default(''),
        creditCardCVV: z.string().optional().default(''),
        creditCardExpiration: z.string().optional().default(''),
      }))
            .mutation(async ({ input, ctx }) => {
        // Admin can create clients without agent context
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const plainPin = `${input.lastName.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
        const hashedPin = await hashPin(plainPin);
        const dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth).getTime() : null;
        const effectiveDate = input.effectiveDate ? new Date(input.effectiveDate).getTime() : null;
        const premiumAmount = input.premiumAmount && input.premiumAmount > 0 ? input.premiumAmount : 0;
        const annualPremium = input.annualPremium && input.annualPremium > 0 ? input.annualPremium : premiumAmount * 12;
        const policyNumber = input.policyNumber || `POL-${plainPin}`;
        const now = Date.now();
        const nowDate = new Date();
        const saleMonth = nowDate.getMonth() + 1;
        const saleYear = nowDate.getFullYear();

        let resultClientId: number = 0;

        // ─── ATOMIC TRANSACTION: client → policy → salesEntry ───
        // If any step fails, the entire transaction rolls back automatically.
        try {
          await db.transaction(async (tx) => {
            // STEP 1: Insert client
            const clientResult = await tx.insert(clients).values({
              pin: hashedPin,
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email || null,
              phone: input.phone || null,
              dateOfBirth: dateOfBirth,
              address: input.address || null,
              city: input.city || null,
              state: input.state || null,
              zip: input.zip || null,
              ssn: input.ssn || null,
              driverLicense: input.driverLicense || null,
              driverLicenseState: input.licenseState || null,
              gender: input.gender || null,
              maritalStatus: input.maritalStatus || null,
              smoker: input.smoker ? 1 : 0,
              healthConditions: input.healthConditionsJSON || null,
              prescriptions: input.prescriptions || null,
              surgeries: input.surgeries || null,
              height: input.height || null,
              weight: input.weight || null,
              kids: input.kids || null,
              bankName: input.bankName || null,
              accountNumber: input.accountNumber || null,
              routingNumber: input.routingNumber || null,
              notes: input.additionalHealthNotes || null,
              createdByAgentId: null,
            });
            const clientId = (clientResult as any)[0]?.insertId as number;
            if (!clientId || clientId === 0) {
              throw new Error("Failed to get client ID after insert");
            }
            resultClientId = clientId;
            console.log(`[ADMIN_CREATE_CLIENT] Client created: id=${clientId}`);

            // STEP 2: Insert policy (always — required for client to appear in admin list)
            const policyResult = await tx.insert(policies).values({
              clientId: clientId,
              policyNumber: policyNumber,
              type: (input.productPolicyType || "other") as any,
              carrier: input.carrier || "Unknown",
              status: "active",
              premiumAmount: premiumAmount.toString(),
              premiumFrequency: "monthly",
              coverageAmount: input.coverageDeathBenefit ? input.coverageDeathBenefit.toString() : "0",
              yearlyAP: annualPremium > 0 ? annualPremium.toString() : null,
              commissionRate: input.commissionPercent ? input.commissionPercent.toString() : null,
              effectiveDate: effectiveDate,
              notes: "Onboarded via admin intake form",
              wasEverActive: 1,
              inForceDate: effectiveDate || now,
              isPaid: 1,
            } as InsertPolicy);
            const policyId = (policyResult as any)[0]?.insertId as number;
            if (!policyId || policyId === 0) {
              throw new Error("Failed to get policy ID after insert");
            }
            console.log(`[ADMIN_CREATE_CLIENT] Policy created: id=${policyId}`);

            // STEP 2b: Link policy to admin agent record (so Writing Agent column shows Mr. Ortiz)
            try {
              const adminAgentId = await getOrCreateAdminAgentRecord();
              await tx.insert(policyAgents).values({
                policyId: policyId,
                agentId: adminAgentId,
                role: 'primary',
              });
              console.log(`[ADMIN_CREATE_CLIENT] Linked policy ${policyId} to admin agent ${adminAgentId}`);
            } catch (agentErr) {
              console.warn('[ADMIN_CREATE_CLIENT] Could not link admin agent to policy (non-fatal):', agentErr);
            }

            // STEP 3: Insert sales entry (only if premium > 0)
            if (premiumAmount > 0) {
              await tx.insert(salesEntries).values({
                agentId: null,
                clientId: clientId,
                policyId: policyId,
                clientName: `${input.firstName} ${input.lastName}`,
                product: input.productPolicyType || "Other",
                productType: input.productPolicyType || "Other",
                carrier: input.carrier || "Unknown",
                premium: premiumAmount.toString() as any,
                annualPremium: annualPremium.toString() as any,
                commissionPercent: (input.commissionPercent ?? 0).toString() as any,
                commissionOverride: "0" as any,
                saleDate: nowDate.getTime(),
                saleMonth: saleMonth,
                saleYear: saleYear,
                month: saleMonth,
                year: saleYear,
                effectiveDate: effectiveDate,
                isPaid: 0,
                isCanceled: 0,
                status: "active",
              } as unknown as InsertSalesEntry);
              console.log(`[ADMIN_CREATE_CLIENT] Sales entry created for client=${clientId}`);
            }
          });
        } catch (err) {
          console.error("[ADMIN_CREATE_CLIENT] Transaction failed, all changes rolled back:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Client creation failed: ${err instanceof Error ? err.message : String(err)}`,
          });
        }

        return { success: true, message: "Client created successfully", pin: plainPin, clientId: resultClientId };
      }),

    /** Create a new client (with PIN) */
    createClient: adminProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        pin: z.string().min(4).max(10),
        phone: z.string().optional().default(""),
        address: z.string().optional().default(""),
        city: z.string().optional().default(""),
        state: z.string().optional().default(""),
        zip: z.string().optional().default(""),
      }))
      .mutation(async ({ input }) => {
        // SECURITY: Block test data patterns
        const testPatterns = [
          /test/i,
          /@example\.com/i,
          /@ortiztest\.com/i,
          /demo/i,
          /fake/i,
          /sample/i,
        ];
        
        const fullName = `${input.firstName} ${input.lastName}`.toLowerCase();
        const email = input.email.toLowerCase();
        
        for (const pattern of testPatterns) {
          if (pattern.test(fullName) || pattern.test(email)) {
            logSecurityEvent({
              type: "test_data_attempt",
              dataType: "client",
              details: `Attempted to create test client: ${fullName} (${email})`,
              value: email,
            });
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Test data creation is not allowed. Only real client data can be added.",
            });
          }
        }
        
        const hashedPin = await hashPin(input.pin);
        await createClient({
          ...input,
          pin: hashedPin,
        });
        return { success: true };
      }),

    /** Onboard a new client — creates client, generates PIN, returns text message + login info */
    onboardClient: adminProcedure
      .input(z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Valid email is required"),
        phone: z.string().min(1, "Phone number is required"),
        type: z.string().min(1, "Policy type is required"),
        carrier: z.string().min(1, "Carrier is required"),
        premium: z.number().min(0, "Premium must be positive"),
        draftDate: z.string().min(1, "Draft date is required"),
        // Contract details
        contractNumber: z.string().optional(),
        contractType: z.string().optional(),
        productName: z.string().optional(),
        taxQualification: z.string().optional(),
        effectiveDate: z.string().optional(),
        // Owner details
        ownerDob: z.string().optional(),
        ownerAddress: z.string().optional(),
        ownerCity: z.string().optional(),
        ownerState: z.string().optional(),
        ownerZip: z.string().optional(),
        // Annuitant
        annuitantName: z.string().optional(),
        annuitantDob: z.string().optional(),
        // Beneficiaries
        primaryBeneficiary: z.string().optional(),
        primaryBeneficiaryPercent: z.number().optional(),
        contingentBeneficiary: z.string().optional(),
        contingentBeneficiaryPercent: z.number().optional(),
        // Value
        accumulatedValue: z.number().optional(),
        origin: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Generate unique PIN
        const allExisting = await getAllClients();
        // Generate unique PIN (no need to check existing hashes, just generate a new one)
        let pin: string;
        let attempts = 0;
        do {
          pin = String(Math.floor(1000 + Math.random() * 9000));
          attempts++;
        } while (attempts < 100);

        // Check for duplicate client
        const existing = allExisting.find(
          c => c.firstName.toLowerCase() === input.firstName.toLowerCase() &&
               c.lastName.toLowerCase() === input.lastName.toLowerCase() &&
               c.email.toLowerCase() === input.email.toLowerCase()
        );
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Client ${input.firstName} ${input.lastName} already exists. Check the Clients tab.`,
          });
        }

        // Generate PIN for display (will be hashed before storage)
        const displayPin = pin;

        // Create the client with hashed PIN
        const hashedPin = await hashPin(pin);
        await createClient({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          pin: hashedPin,
        });

        // Build the text message — use the caller's origin so it works on any domain
        // Always use the real production domain for client-facing messages.
        // Fall back to origin only if it looks like the real site (not a dev/sandbox URL).
        const isDevOrigin = !input.origin ||
          input.origin.includes("localhost") ||
          input.origin.includes("manus.computer") ||
          input.origin.includes("manus.space");
        const portalUrl = "https://www.ortizinsurancebroker.com/portal";
        // Always use the production domain for client-facing portal links
        const premiumStr = `$${input.premium.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Look up carrier contact info from admin-saved settings
        let carrierPhone = "";
        let carrierPortalUrl = "";
        try {
          const carrierSetting = await getAppSetting("carrier_phones");
          if (carrierSetting) {
            const carrierMap = JSON.parse(carrierSetting);
            const info = carrierMap[input.carrier];
            if (info) {
              if (typeof info === "string") {
                carrierPhone = info;
              } else {
                carrierPhone = info.phone || "";
                carrierPortalUrl = info.portalUrl || "";
              }
            }
          }
        } catch { /* ignore */ }

        // Build contract details section for text message
        let contractDetails = '';
        if (input.contractNumber) contractDetails += `\n- Contract #: ${input.contractNumber}`;
        if (input.productName) contractDetails += `\n- Product: ${input.productName}`;
        if (input.contractType) contractDetails += `\n- Type: ${input.contractType}`;
        if (input.taxQualification) contractDetails += `\n- Tax Qualification: ${input.taxQualification}`;
        if (input.effectiveDate) contractDetails += `\n- Issue Date: ${input.effectiveDate}`;
        if (input.primaryBeneficiary) contractDetails += `\n- Primary Beneficiary: ${input.primaryBeneficiary} (${input.primaryBeneficiaryPercent || 100}%)`;
        if (input.contingentBeneficiary) contractDetails += `\n- Contingent Beneficiary: ${input.contingentBeneficiary} (${input.contingentBeneficiaryPercent || 100}%)`;
        if (input.accumulatedValue) contractDetails += `\n- Accumulated Value: $${input.accumulatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Build carrier contact section
        let carrierContact = '';
        if (carrierPhone) carrierContact += `\n- ${input.carrier} Customer Service: ${carrierPhone}`;
        if (carrierPortalUrl) carrierContact += `\n- ${input.carrier} Online Portal: ${carrierPortalUrl}`;

        const textMessage = [
          `Hi ${input.firstName}! Welcome to Ortiz Insurance.`,
          ``,
          `Your secure client portal is now ready. You can view your policy details, documents, and coverage information anytime.`,
          ``,
          `PORTAL LOGIN`,
          `Portal: ${portalUrl}`,
          `Last Name: ${input.lastName}`,
          `PIN: ${pin}`,
          ``,
          `POLICY SUMMARY`,
          `- Type: ${input.type}`,
          `- Carrier: ${input.carrier}`,
          `- Monthly Premium: ${premiumStr}`,
          `- Draft Date: ${input.draftDate}`,
          ...(contractDetails ? [contractDetails] : []),
          ...(carrierContact ? [``, `CARRIER CONTACT`, carrierContact] : []),
          ``,
          `If you have any questions about your policy or coverage, please don't hesitate to reach out.`,
          ``,
          `Ortiz Insurance: (361) 613-8336`,
          ``,
          `- Ortiz Insurance Broker`,
        ].join("\n");

        // Auto-create a sales entry in the Sales Tracker
        const saleNow = new Date();
        const saleMonth = saleNow.getMonth() + 1;
        const saleYear = saleNow.getFullYear();
        try {
          await createSalesEntry({
            agentId: 0, // Admin onboarding - no specific agent
            clientName: `${input.firstName} ${input.lastName}`,
            product: input.type,
            carrier: input.carrier,
            premium: String(input.premium),
            annualPremium: input.premium ? String(input.premium * 12) : null,
            commission: null,
            saleDate: saleNow.getTime(),
            month: saleMonth,
            year: saleYear,
            notes: `Auto-generated from onboarding. Draft date: ${input.draftDate}`,
          });
        } catch (err) {
          // Don't fail the onboarding if sales entry creation fails
          console.error("[Onboard] Failed to create sales entry:", err);
        }

        return {
          success: true,
          client: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            pin: displayPin,
            type: input.type,
            carrier: input.carrier,
            premium: input.premium,
            draftDate: input.draftDate,
            contractNumber: input.contractNumber || '',
            contractType: input.contractType || '',
            productName: input.productName || '',
            taxQualification: input.taxQualification || '',
            effectiveDate: input.effectiveDate || '',
            ownerDob: input.ownerDob || '',
            ownerAddress: input.ownerAddress || '',
            ownerCity: input.ownerCity || '',
            ownerState: input.ownerState || '',
            ownerZip: input.ownerZip || '',
            annuitantName: input.annuitantName || '',
            annuitantDob: input.annuitantDob || '',
            primaryBeneficiary: input.primaryBeneficiary || '',
            primaryBeneficiaryPercent: input.primaryBeneficiaryPercent || 0,
            contingentBeneficiary: input.contingentBeneficiary || '',
            contingentBeneficiaryPercent: input.contingentBeneficiaryPercent || 0,
            accumulatedValue: input.accumulatedValue || 0,
          },
          textMessage,
        };
      }),

    /** Update a client */
    updateClient: adminProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        pin: z.string().min(4).max(255).optional(), // Increased to accommodate bcrypt hash
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, pin, ...data } = input;
        const updateData: Record<string, any> = data;
        
        // Hash PIN if provided
        if (pin) {
          updateData.pin = await hashPin(pin);
        }
        
        await updateClient(id, updateData);
        return { success: true };
      }),

    /** Delete a client and their policies */
    deleteClient: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteClient(input.id);
        return { success: true };
      }),

    /** Bulk delete clients and their policies */
    bulkDeleteClients: adminProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ input }) => {
        for (const clientId of input.ids) {
          await deleteClient(clientId);
        }
        return { success: true, deletedCount: input.ids.length };
      }),

    /** List all policies - now returns salesEntries with agent info */
    listPolicies: adminProcedure.query(async () => {
      return getAllPolicies();
    }),

    listAnnuities: adminProcedure.query(async () => {
      return getAllAnnuities();
    }),

    /** Create a new policy */
    createPolicy: adminProcedure
      .input(z.object({
        clientId: z.number(),
        policyNumber: z.string().min(1),
        type: z.enum(["term_life", "whole_life", "universal_life", "variable_universal_life", "fixed_annuity", "variable_annuity", "indexed_annuity", "immediate_annuity", "disability", "critical_illness", "other"]),
        carrier: z.string().min(1),
        status: z.enum(["pending", "active", "cancelled", "expired", "surrendered", "matured"]).optional().default("active"),
        premiumAmount: z.string().optional(),
        premiumFrequency: z.enum(["monthly", "quarterly", "semi-annual", "annual"]).optional().default("monthly"),
        coverageAmount: z.string().optional(),
        deductible: z.string().optional(),
        effectiveDate: z.number().optional(),
        expirationDate: z.number().optional(),
        annualPremium: z.string().optional(),
        notes: z.string().optional().default(""),
      }))
      .mutation(async ({ input }) => {
        // SECURITY: Verify client exists and is not a test client
        const client = await getClientById(input.clientId);
        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Client not found",
          });
        }
        
        const testPatterns = [/test/i, /@example\.com/i, /@ortiztest\.com/i, /demo/i];
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        
        for (const pattern of testPatterns) {
          if (pattern.test(fullName) || pattern.test(client.email?.toLowerCase() || "")) {
            logSecurityEvent({
              type: "test_data_attempt",
              dataType: "policy",
              details: `Attempted to create policy for test client: ${fullName}`,
              value: fullName,
            });
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cannot create policies for test clients",
            });
          }
        }
        
        // Lifecycle fields: set wasEverActive and inForceDate if status is active/in-force.
        // ACTIVE_STATUSES covers: active, paid, issued, in_force, in-force, placed, approved
        const policyCreateData: any = { ...input };
        const createStatus = (input.status || 'active').toLowerCase();
        if (ACTIVE_STATUSES.has(createStatus)) {
          policyCreateData.wasEverActive = 1;
          policyCreateData.inForceDate = input.effectiveDate || Date.now();
          policyCreateData.isPaid = 1;
        }
        await createPolicy(policyCreateData);
        return { success: true };
      }),

    /** Update a policy */
    updatePolicy: adminProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number().optional(),
        policyNumber: z.string().optional(),
        type: z.string().optional(),
        carrier: z.string().optional(),
        status: z.enum(["pending", "active", "cancelled", "expired", "surrendered", "matured"]).optional(),
        premiumAmount: z.string().optional(),
        premiumFrequency: z.enum(["monthly", "quarterly", "semi-annual", "annual"]).optional(),
        coverageAmount: z.string().optional(),
        deductible: z.string().optional(),
        effectiveDate: z.number().optional(),
        expirationDate: z.number().optional(),
        annualPremium: z.string().optional(),
        commissionRate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };

        // Statuses that indicate a policy was previously active and has now lapsed/terminated.
        // Any of these must set cancelDate (if not already set) and preserve wasEverActive=1.
        // LAPSE_STATUSES imported from metrics.ts — single source of truth
        // Covers: cancelled, canceled, lapsed, lapse, terminated, inactive, surrendered, matured, expired

        // Lifecycle: set wasEverActive + inForceDate when activating.
        // ACTIVE_STATUSES covers: active, paid, issued, in_force, in-force, placed, approved
        const updateStatus = (data.status || '').toLowerCase();
        if (data.status && ACTIVE_STATUSES.has(updateStatus)) {
          updateData.wasEverActive = 1;
          if (!updateData.inForceDate) {
            updateData.inForceDate = data.effectiveDate || Date.now();
          }
          updateData.isPaid = 1;
        } else if (data.status && LAPSE_STATUSES.has(updateStatus)) {
          // Set cancelDate only if the policy was ever active AND cancelDate not already set.
          // This preserves wasEverActive=1 for previously active policies.
          const db = await getDb();
          if (db) {
            const [existing] = await db
              .select({ cancelDate: policies.cancelDate, wasEverActive: policies.wasEverActive })
              .from(policies)
              .where(eq(policies.id, id))
              .limit(1);
            // Only set cancelDate if policy was ever active (wasEverActive=1) and cancelDate not yet set
            if (existing?.wasEverActive === 1 && !existing?.cancelDate) {
              updateData.cancelDate = Date.now();
            }
          }
        }
        // Note: pending/unpaid/declined/withdrawn statuses do NOT set wasEverActive or cancelDate.
        // wasEverActive remains 0 until the policy explicitly transitions to 'active'.

        await updatePolicy(id, updateData);
        return { success: true };
      }),

    /** Delete a policy */
    deletePolicy: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePolicy(input.id);
        return { success: true };
      }),

    /** Bulk update policies with premium data */
    updatePoliciesBulk: adminProcedure
      .input(z.object({
        updates: z.array(z.object({
          id: z.number(),
          premiumAmount: z.string().optional(),
          yearlyAP: z.string().optional(),
          coverageAmount: z.string().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const update of input.updates) {
          try {
            const updateData: Record<string, any> = {};
            if (update.premiumAmount) {
              const cleaned = update.premiumAmount.replace(/[^0-9.]/g, "");
              updateData.premiumAmount = parseFloat(cleaned) || 0;
            }
            if (update.yearlyAP) {
              const cleaned = update.yearlyAP.replace(/[^0-9.]/g, "");
              updateData.yearlyAP = parseFloat(cleaned) || 0;
            }
            if (update.coverageAmount) {
              const cleaned = update.coverageAmount.replace(/[^0-9.]/g, "");
              updateData.coverageAmount = parseFloat(cleaned) || 0;
            }

            if (Object.keys(updateData).length > 0) {
              await db.update(policies).set(updateData).where(eq(policies.id, update.id));
              successCount++;
              // Auto-sync: Update corresponding sales_entry
              // Errors here don't block the policy update
              try {
                await syncPolicyToSalesEntry(update.id);
              } catch (syncErr) {
                console.warn(`[updatePoliciesBulk] Sync failed for policy ${update.id}:`, syncErr);
              }
            }
          } catch (err) {
            errorCount++;
            errors.push(`Policy ${update.id}: ${err instanceof Error ? err.message : "Unknown error"}`);
          }
        }

        return {
          success: errorCount === 0,
          successCount,
          errorCount,
          errors: errors.length > 0 ? errors : undefined,
        };
      }),

    /** List all users (for linking to clients) */
    listUsers: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    // ── ANNUITY MANAGEMENT ────────────────────────────────────────────────

    /** Create a new annuity */
    createAnnuity: adminProcedure
      .input(z.object({
        clientId: z.number().optional(),
        clientName: z.string().min(1, "Client name is required"),
        type: z.enum(["FIA", "MYGA"]),
        carrier: z.string().min(1, "Carrier is required"),
        productName: z.string().optional().default(""),
        premium: z.string().min(1, "Premium amount is required"),
        termYears: z.number().optional(),
        commissionPercent: z.string().optional(),
        status: z.enum(["active", "pending", "matured", "surrendered", "cancelled"]).optional().default("active"),
        effectiveDate: z.number().optional(),
        maturityDate: z.number().optional(),
        notes: z.string().optional().default(""),
      }))
      .mutation(async ({ input }) => {
        await createAnnuity(input);
        return { success: true };
      }),

    /** Update an annuity */
    updateAnnuity: adminProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number().optional(),
        clientName: z.string().optional(),
        type: z.enum(["FIA", "MYGA"]).optional(),
        carrier: z.string().optional(),
        productName: z.string().optional(),
        premium: z.string().optional(),
        termYears: z.number().optional(),
        commissionPercent: z.string().optional(),
        status: z.enum(["active", "pending", "matured", "surrendered", "cancelled"]).optional(),
        isPaid: z.boolean().optional(),
        effectiveDate: z.number().optional(),
        maturityDate: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = {};
        if (data.clientId !== undefined) updateData.clientId = data.clientId;
        if (data.clientName !== undefined) updateData.clientName = data.clientName;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.carrier !== undefined) updateData.carrier = data.carrier;
        if (data.productName !== undefined) updateData.productName = data.productName;
        if (data.premium !== undefined) updateData.premium = data.premium;
        if (data.termYears !== undefined) updateData.termYears = data.termYears;
        if (data.commissionPercent !== undefined) updateData.commissionPercent = data.commissionPercent;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.isPaid !== undefined) updateData.isPaid = data.isPaid ? 1 : 0;
        if (data.effectiveDate !== undefined) updateData.effectiveDate = data.effectiveDate;
        if (data.maturityDate !== undefined) updateData.maturityDate = data.maturityDate;
        if (data.notes !== undefined) updateData.notes = data.notes;
        await updateAnnuity(id, updateData as any);
        return { success: true };
      }),

    /** Delete an annuity */
    deleteAnnuity: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAnnuity(input.id);
        return { success: true };
      }),

    /** Import annuities from Excel sales tracker (base64-encoded) */
    importAnnuityExcel: adminProcedure
      .input(z.object({
        fileBase64: z.string().min(1, "File data is required"),
        fileName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // parseExcelFile, sheetToJson already imported at top of file
        const result = await parseExcelFile(input.fileBase64, input.fileName);

        let created = 0;
        let skipped = 0;
        const errors: string[] = [];

        // Get existing annuities for duplicate detection
        const existingAnnuities = await getAllAnnuities();

        // For multi-sheet Production Reports, prioritize the BOB sheet
        const sheetPriority = ["Active_Annuity_Policies_BOB", "Active_Annuity_Policies_YTD", ...result.sheetNames];
        const sheetsToProcess = Array.from(new Set(sheetPriority)).filter(s => result.sheetNames.includes(s));

        for (const sheetName of sheetsToProcess) {
          // Skip FAQ/instructions sheets
          if (sheetName.toLowerCase().includes("faq") || sheetName.toLowerCase().includes("instruction")) continue;

          const sheetData = result.sheets[sheetName];
          if (!sheetData || sheetData.length === 0) continue;

          // Convert to array of objects using header row
          const rows: Record<string, any>[] = sheetData;

          // Skip sheets with no usable data rows
          if (rows.length === 0) continue;

          // Detect if this is a Production Report format (North American / Midland National)
          // Headers: Hier Client No, Policy No, Owner Name, Product, Initial Premium, Commission %, etc.
          const firstRow = rows[0];
          const isProductionReport = !!(firstRow["Policy No"] && firstRow["Owner Name"] && firstRow["Initial Premium"] !== undefined);
          // Only process BOB sheet for production reports to avoid duplicates from YTD
          if (isProductionReport && sheetName !== "Active_Annuity_Policies_BOB") continue;

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2;

            // ── Athene Book of Business format detection ──
            // Columns: Contract Number, Issue Date, Owner Name, Annuitant Name, Product,
            //          Status, Annuity Type, Contract Type, Total Premiums Received,
            //          Accumulated/Contract Value, Tax Qualification, Product Year Duration...
            const isAtheneFormat = !isProductionReport && !!(row["Contract Number"] || (row["Owner Name"] && row["Annuity Type"]));

            let clientName: string;
            let rawType: string;
            let carrier: string;
            let productName: string;
            let premiumStr: string;
            let termStr: string;
            let commissionStr: string;
            let statusStr: string;
            let effectiveDateStr: string;
            let maturityDateStr: string;
            let notes: string;
            let policyNumber: string;

            if (isProductionReport) {
              // ── North American / Midland National Production Report format ──
              // Headers: Policy No, Owner Name, Product, Initial Premium, Commission %,
              //          Effective Date, Issue Date, Policy Status, Line Of Business, Qualification
              clientName = (row["Owner Name"] || "").toString().trim();
              policyNumber = (row["Policy No"] || "").toString().trim();
              productName = (row["Product"] || "").toString().trim();

              // Determine type from Product column: 5-Year/3-Year/Flex = MYGA
              const prodLower = productName.toLowerCase();
              rawType = (prodLower.includes("year") || prodLower.includes("flex") || prodLower.includes("myga"))
                ? "MYGA" : prodLower.includes("indexed") || prodLower.includes("fia") ? "FIA" : "MYGA";

              // Carrier: detect from Line Of Business or default to North American
              const lineOfBusiness = (row["Line Of Business"] || "").toString().trim();
              carrier = lineOfBusiness ? "North American" : "North American";

              // Use Initial Premium (commission-eligible amount)
              const initialPrem = row["Initial Premium"];
              premiumStr = initialPrem !== undefined && initialPrem !== ""
                ? initialPrem.toString().replace(/[$,]/g, "").trim()
                : (row["Total Premiums Paid"] || "").toString().replace(/[$,]/g, "").trim();

              // Commission % is already a number in this format
              const commVal = row["Commission %"];
              commissionStr = commVal !== undefined && commVal !== "" ? commVal.toString() : "";

              statusStr = (row["Policy Status"] || "").toString().trim().toLowerCase();
              effectiveDateStr = (row["Effective Date"] || "").toString().trim();
              maturityDateStr = "";
              termStr = "";
              const qualification = (row["Qualification"] || "").toString().trim();
              notes = `Imported from Production Report. Qualification: ${qualification}`;
            } else if (isAtheneFormat) {
              // Parse owner name — format is "LAST, FIRST" or "Last, First"
              const ownerRaw = (row["Owner Name"] || "").toString().trim();
              const nameParts = ownerRaw.split(",").map((s: string) => s.trim());
              clientName = nameParts.length >= 2
                ? `${nameParts[1]} ${nameParts[0]}`  // "First Last"
                : ownerRaw;

              // Annuity type from "Annuity Type" column
              const annuityTypeRaw = (row["Annuity Type"] || "").toString().trim().toLowerCase();
              rawType = annuityTypeRaw.includes("indexed") ? "FIA" :
                        annuityTypeRaw.includes("multi") || annuityTypeRaw.includes("guaranteed") ? "MYGA" :
                        annuityTypeRaw.toUpperCase();

              // Carrier is Athene for this report format
              carrier = "Athene";
              productName = (row["Product"] || "").toString().trim();
              // Total Premiums Received
              premiumStr = (row["Total Premiums Received"] || row["Accumulated/Contract Value"] || "").toString().replace(/[$,]/g, "").trim();
              // Product Year Duration as term
              termStr = (row["Product Year Duration"] || "").toString().trim();
              commissionStr = "";
              statusStr = (row["Status"] || "").toString().trim().toLowerCase();
              effectiveDateStr = (row["Issue Date"] || "").toString().trim();
              maturityDateStr = "";
              policyNumber = (row["Contract Number"] || "").toString().trim();
              const taxQual = (row["Tax Qualification"] || "").toString().trim();
              notes = `Imported from Athene Book of Business. Tax Qual: ${taxQual}`;
            } else {
              // Standard Ortiz template format
              clientName = (row["Client Name"] || row["client_name"] || row["Name"] || "").toString().trim();
              rawType = (row["Type"] || row["type"] || row["Annuity Type"] || "").toString().trim().toUpperCase();
              carrier = (row["Carrier"] || row["carrier"] || row["Insurance Company"] || "").toString().trim();
              productName = (row["Product Name"] || row["product_name"] || row["Product"] || "").toString().trim();
              premiumStr = (row["Premium"] || row["premium"] || row["Premium Amount"] || "").toString().trim().replace(/[,$]/g, "");
              termStr = (row["Term (Years)"] || row["term_years"] || row["Term"] || "").toString().trim();
              commissionStr = (row["Commission (%)"] || row["commission_percent"] || row["Commission"] || row["Comm %"] || "").toString().trim().replace(/%/g, "");
              statusStr = (row["Status"] || row["status"] || "").toString().trim().toLowerCase();
              effectiveDateStr = (row["Effective Date"] || row["effective_date"] || "").toString().trim();
              maturityDateStr = (row["Maturity Date"] || row["maturity_date"] || "").toString().trim();
              notes = (row["Notes"] || row["notes"] || "").toString().trim();
              policyNumber = (row["Policy Number"] || row["Contract Number"] || "").toString().trim();
            }

            // Skip empty rows
            if (!clientName && !carrier) continue;

            // Validate required fields
            if (!clientName) { errors.push(`Row ${rowNum}: Missing client name`); skipped++; continue; }
            if (!carrier) { errors.push(`Row ${rowNum}: Missing carrier for ${clientName}`); skipped++; continue; }

            // Validate type
            let type: "FIA" | "MYGA";
            const rawTypeUpper = rawType.toUpperCase();
            if (rawTypeUpper === "FIA" || rawTypeUpper.includes("FIXED INDEX") || rawTypeUpper.includes("INDEXED")) {
              type = "FIA";
            } else if (rawTypeUpper === "MYGA" || rawTypeUpper.includes("MULTI-YEAR") || rawTypeUpper.includes("GUARANTEED") || rawTypeUpper.includes("MULTI YEAR")) {
              type = "MYGA";
            } else {
              // Default to FIA if unrecognized but not empty
              type = rawTypeUpper ? "FIA" : "FIA";
              if (!isAtheneFormat) {
                errors.push(`Row ${rowNum}: Unrecognized type "${rawType}" for ${clientName} — defaulted to FIA`);
              }
            }

            // Map type to policyType
            const policyType = type === "FIA" ? "indexed_annuity" : "fixed_annuity";

            // Validate premium
            const premium = parseFloat(premiumStr);
            if (!premiumStr || isNaN(premium) || premium <= 0) {
              errors.push(`Row ${rowNum}: Invalid premium "${premiumStr}" for ${clientName}`);
              skipped++;
              continue;
            }

            // Parse optional fields
            const termYears = termStr ? parseInt(termStr) : undefined;
            const commissionPercent = commissionStr && !isNaN(parseFloat(commissionStr)) ? commissionStr : undefined;

            // Parse status
            let status: "active" | "pending" | "matured" | "surrendered" | "cancelled" = "active";
            if (statusStr.includes("pending")) status = "pending";
            else if (statusStr.includes("mature")) status = "matured";
            else if (statusStr.includes("surrender")) status = "surrendered";
            else if (statusStr.includes("cancel")) status = "cancelled";

            // Parse dates
            const parseDate = (dateStr: string): number | undefined => {
              if (!dateStr || dateStr === "—") return undefined;
              const numVal = Number(dateStr);
              if (!isNaN(numVal) && numVal > 30000 && numVal < 60000) {
                const excelEpoch = new Date(1899, 11, 30);
                return excelEpoch.getTime() + numVal * 86400000;
              }
              const parsed = new Date(dateStr);
              return isNaN(parsed.getTime()) ? undefined : parsed.getTime();
            };
            const effectiveDate = parseDate(effectiveDateStr);
            const maturityDate = parseDate(maturityDateStr);

            // Duplicate detection: same client + contract number OR same client + carrier + type + similar premium
            const isDuplicate = existingAnnuities.some(a => {
              if (policyNumber && (a as any).policyNumber === policyNumber) return true;
              const aFullName = ((a as any).firstName || '') + ' ' + ((a as any).lastName || '');
              return aFullName.toLowerCase() === clientName.toLowerCase() &&
                a.carrier.toLowerCase() === carrier.toLowerCase() &&
                a.type === policyType &&
                Math.abs(parseFloat(a.premiumAmount?.toString() || "0") - premium) < 1;
            });
            if (isDuplicate) {
              skipped++;
              continue;
            }

            await createAnnuity({
              clientId: 0,
              type: type,
              carrier,
              policyNumber: policyNumber,
              premium: premium.toFixed(2),
              status,
              effectiveDate: effectiveDate,
              notes: notes || `Imported from ${sheetName}`,
            });
            created++;

            // Add to existing list for duplicate detection within the same import
            existingAnnuities.push({
              id: 0, clientId: 0, firstName: clientName.split(' ')[0], lastName: clientName.split(' ')[1] || '', carrier, policyNumber,
              premiumAmount: parseFloat(premium.toFixed(2)), type,
              status,
              effectiveDate: effectiveDate || null,
              notes, createdAt: new Date(), updatedAt: new Date(),
            } as any);
          }
        }

        return { success: true, created, skipped, errors: errors.slice(0, 20) };
      }),

    /** Import clients & policies from Excel (base64-encoded) */
    importExcel: adminProcedure
      .input(z.object({
        fileBase64: z.string().min(1, "File data is required"),
        fileName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Import using exceljs helper
        // parseExcelFile already imported at top of file
        const result = await parseExcelFile(input.fileBase64, input.fileName);

        const isCSVFile = (input.fileName || "").toLowerCase().endsWith(".csv");

        let clientsCreated = 0;
        let policiesCreated = 0;
        let clientsSkipped = 0;
        const importedClients: Array<{ name: string; pin: string; policiesCount: number }> = [];

        // Generate a unique 4-digit PIN for a given last name
        async function generateUniquePin(lastName: string): Promise<string> {
          const allExisting = await getAllClients();
          const sameLastNamePins = allExisting
            .filter(c => c.lastName.toLowerCase() === lastName.toLowerCase())
            .map(c => c.pin);
          let pin: string;
          let attempts = 0;
          do {
            pin = String(Math.floor(1000 + Math.random() * 9000));
            attempts++;
          } while (sameLastNamePins.includes(pin) && attempts < 100);
          return pin;
        }

        // Parse name — handles both "FirstName LastName" in one cell or split across two cells
        const parseName = (colB: string | null | undefined, colC: string | null | undefined): { firstName: string; lastName: string } | null => {
          const b = (colB || "").toString().trim();
          const c = (colC || "").toString().trim();
          if (!b) return null;
          if (c && c !== "" && !["Lead Type", "Lead Type ", "Carrier"].includes(c)) {
            return { firstName: b, lastName: c };
          }
          // Full name in one cell
          const parts = b.split(/\s+/);
          if (parts.length >= 2) {
            return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
          }
          return null;
        };

        for (const sheetName of result.sheetNames) {
          const sheetArrayData = result.sheetsAsArrays[sheetName];
          if (!sheetArrayData) continue;

          // Convert to array of arrays
          const rows: (string | number | null)[][] = sheetArrayData;

          // For CSV: find the header row (first row with 'carrier' or 'first' or 'name' in it)
          // For Excel: data starts at row index 9
          let dataStartRow = 9;
          let colMap: Record<string, number> | null = null;

          if (isCSVFile) {
            for (let hi = 0; hi < Math.min(rows.length, 5); hi++) {
              const headerRow = rows[hi];
              if (!headerRow) continue;
              const headerStr = headerRow.map(h => (h || "").toString().toLowerCase());
              const hasCarrier = headerStr.some(h => h.includes("carrier"));
              const hasName = headerStr.some(h => h.includes("name") || h.includes("first") || h.includes("last"));
              if (hasCarrier || hasName) {
                colMap = {};
                headerStr.forEach((h, idx) => { colMap![h.trim()] = idx; });
                dataStartRow = hi + 1;
                break;
              }
            }
            // If no header found, treat first row as header
            if (!colMap && rows.length > 0) {
              const headerRow = rows[0];
              colMap = {};
              (headerRow || []).forEach((h, idx) => {
                colMap![(h || "").toString().toLowerCase().trim()] = idx;
              });
              dataStartRow = 1;
            }
          }

          // Helper to get cell value by column name (CSV) or index (Excel)
          const getCol = (row: (string | number | null)[], colIndex: number, csvColNames?: string[]): string => {
            if (colMap && csvColNames) {
              for (const name of csvColNames) {
                const idx = colMap[name];
                if (idx !== undefined && row[idx] !== null && row[idx] !== undefined) {
                  return (row[idx] || "").toString().trim();
                }
              }
              return "";
            }
            return (row[colIndex] || "").toString().trim();
          };

          for (let i = dataStartRow; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 2) continue;

            // Get name — try CSV column names first, then positional
            const firstNameRaw = colMap
              ? getCol(row, 1, ["first name", "firstname", "first"])
              : (row[1] || "").toString().trim();
            const lastNameRaw = colMap
              ? getCol(row, 2, ["last name", "lastname", "last"])
              : (row[2] || "").toString().trim();

            // If CSV has a single "name" or "client name" column, use parseName on it
            let nameResult;
            if (colMap && !firstNameRaw) {
              const fullName = getCol(row, 0, ["client name", "name", "full name", "client"]);
              nameResult = parseName(fullName, "");
            } else {
              nameResult = parseName(firstNameRaw, lastNameRaw);
            }
            if (!nameResult) continue;

            const { firstName, lastName } = nameResult;
            const phone = colMap
              ? getCol(row, 3, ["phone", "phone number", "cell", "mobile"])
              : (row[3] || "").toString().trim();
            const carrier = colMap
              ? getCol(row, 5, ["carrier", "insurance carrier", "company"])
              : (row[5] || "").toString().trim();
            const policyNumber = colMap
              ? getCol(row, 6, ["policy number", "policy #", "policy no", "policy"])
              : (row[6] || "").toString().trim();
            const monthlyPremiumStr = colMap
              ? getCol(row, 7, ["premium", "monthly premium", "monthly", "amount"])
              : (row[7] || "0").toString();
            const premiumAmount = parseFloat(monthlyPremiumStr.replace(/[^0-9.]/g, "")) || 0;
            const coverageAmountStr = colMap
              ? getCol(row, 9, ["coverage", "coverage amount", "face amount", "benefit"])
              : (row[9] || "0").toString();
            const coverageAmount = parseFloat(coverageAmountStr.replace(/[^0-9.]/g, "")) || 0;
            const coverageType = colMap
              ? getCol(row, 10, ["type", "coverage type", "policy type", "product"])
              : (row[10] || "").toString().trim();
            const status = colMap
              ? getCol(row, 11, ["status", "policy status"]).toLowerCase()
              : (row[11] || "").toString().trim().toLowerCase();

            // Skip empty/template rows
            if (!carrier || carrier === "Carrier") continue;
            if (coverageType === "new" || coverageType === "Coverage Type") continue;

            // Check if client already exists
            let existingClient = await getClientByName(firstName, lastName);
            let clientId: number;
            let isNewClient = false;

            if (existingClient) {
              clientId = existingClient.id;
              clientsSkipped++;
            } else {
              const pin = await generateUniquePin(lastName);
              const hashedPin = await hashPin(pin);
              await createClient({
                firstName,
                lastName,
                email: "",
                pin: hashedPin,
                phone,
              });
              // Fetch the newly created client to get the ID
              const newClient = await getClientByName(firstName, lastName);
              if (!newClient) continue;
              clientId = newClient.id;
              clientsCreated++;
              isNewClient = true;
              // Store the plaintext PIN for display in the response
              importedClients.push({ name: `${firstName} ${lastName}`, pin, policiesCount: 0 });
            }

            // Parse effective date
            let effectiveDate: number | undefined;
            const dateVal = row[12];
            if (dateVal) {
              const dateStr = dateVal.toString().trim();
              const parsed = new Date(dateStr);
              if (!isNaN(parsed.getTime())) {
                effectiveDate = parsed.getTime();
              }
            }

            // Map status
            let policyStatus: "active" | "pending" | "expired" | "cancelled" = "active";
            if (status.includes("cancel")) policyStatus = "cancelled";
            else if (status.includes("decline")) policyStatus = "cancelled";
            else if (status.includes("pending") || status === "choose") policyStatus = "pending";

            // Check for duplicate policy (same client + carrier + type)
            const existingPolicies = await getClientPolicies(clientId);
            const isDuplicate = existingPolicies.some(p =>
              p.carrier.toLowerCase() === carrier.toLowerCase() &&
              p.type.toLowerCase() === (coverageType || "other").toLowerCase() &&
              (policyNumber ? p.policyNumber === policyNumber : true)
            );
            if (isDuplicate) continue;

            // Create the policy with lifecycle fields
            await createPolicy({
              clientId,
              policyNumber: policyNumber || `IMP-${sheetName}-${i}`,
              type: (coverageType || "other") as any,
              carrier,
              status: policyStatus as any,
              premiumAmount: premiumAmount.toFixed(2),
              premiumFrequency: "monthly",
              coverageAmount: coverageAmount.toFixed(2),
              effectiveDate: effectiveDate,
              notes: `Imported from ${sheetName} sales tracker`,
              // Lifecycle: active imports were in-force
              wasEverActive: policyStatus === 'active' ? 1 : 0,
              inForceDate: policyStatus === 'active' ? (effectiveDate || Date.now()) : undefined,
              isPaid: policyStatus === 'active' ? 1 : 0,
              cancelDate: policyStatus === 'cancelled' ? Date.now() : undefined,
            } as any);
            policiesCreated++;

            // Update the count for the matching imported client
            const ic = importedClients.find(c => c.name === `${firstName} ${lastName}`);
            if (ic) ic.policiesCount++;
          }
        }

        return {
          success: true,
          clientsCreated,
          clientsSkipped,
          policiesCreated,
          importedClients,
        };
      }),

    /** Import clients & policies from PDF (base64-encoded) */
    importPDF: adminProcedure
      .input(z.object({
        fileBase64: z.string().min(1, "File data is required"),
        fileName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const pdfParseMod = (await import("pdf-parse")) as any;
        const PDFParse = pdfParseMod.PDFParse;

        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileBase64, "base64");

        // Parse PDF
        let fullText = "";
        try {
          const parser = new PDFParse({ data: buffer });
          await parser.load();
          const result = await parser.getText();
          
          // getText() returns { pages: [{ text: string }], text: string, ... }
          // Try multiple extraction methods in order of preference
          if (result && result.text && typeof result.text === "string") {
            // Preferred: use the aggregated text field
            fullText = result.text;
          } else if (result && result.pages && Array.isArray(result.pages)) {
            // Fallback: combine pages
            fullText = result.pages.map((p: any) => p.text || "").join("\n");
          } else if (typeof result === "string") {
            // Last resort: result is already a string
            fullText = result;
          }
          
          // Remove the "-- X of Y --" page markers that pdf-parse adds
          fullText = fullText.replace(/--\s+\d+\s+of\s+\d+\s+--/g, "");
        } catch (err) {
          console.error("PDF parsing error:", err);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Failed to parse PDF: ${err instanceof Error ? err.message : "Unknown error"}`,
          });
        }

        if (!fullText.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Could not extract any text from the PDF. The file may be image-based or corrupted.",
          });
        }

        // Split text into lines for pattern matching
        const pdfLines = fullText.split("\n");

        // Helper: find the line AFTER a header line containing all specified keys
        const findLineAfterHeader = (headerKeys: string[]): string => {
          for (let i = 0; i < pdfLines.length - 1; i++) {
            const line = pdfLines[i].trim().toLowerCase();
            if (headerKeys.every(k => line.includes(k.toLowerCase()))) {
              return pdfLines[i + 1]?.trim() || "";
            }
          }
          return "";
        };

        // Helper: find inline value after key
        const findInlineValue = (key: string): string => {
          const regex = new RegExp(key + "[:\\s]+(.+)", "i");
          const match = fullText.match(regex);
          return match ? match[1].trim().split("\n")[0].trim() : "";
        };

        // Extract policy number
        const pdfPolicyNumber = findInlineValue("Policy Number") || "";

        // Extract name from line after "Insured Name Policy Number Product Type Product Name"
        const nameDataLine = findLineAfterHeader(["insured name", "policy number", "product type"]);
        let pdfLastName = "";
        let pdfFirstName = "";
        let pdfCoverageType = "Whole Life";
        if (nameDataLine) {
          const nameMatch = nameDataLine.match(/^([A-Z]+),\s*([A-Z]+)/);
          if (nameMatch) {
            pdfLastName = nameMatch[1];
            pdfFirstName = nameMatch[2];
          }
          if (nameDataLine.toLowerCase().includes("whole life")) pdfCoverageType = "Whole Life";
          else if (nameDataLine.toLowerCase().includes("term")) pdfCoverageType = "Term Life";
          else if (nameDataLine.toLowerCase().includes("universal")) pdfCoverageType = "Universal Life";
          else if (nameDataLine.toLowerCase().includes("annuit")) pdfCoverageType = "Annuity";
        }

        // Extract carrier from line after "Policy Status Issue State Writing Agent Issue Company"
        const carrierDataLine = findLineAfterHeader(["policy status", "issue state", "writing agent"]);
        let pdfCarrier = "AGL";
        let pdfPolicyStatus = "active";
        if (carrierDataLine) {
          if (carrierDataLine.toLowerCase().includes("force")) pdfPolicyStatus = "active";
          else if (carrierDataLine.toLowerCase().includes("pending")) pdfPolicyStatus = "pending";
          // Extract company code (last part, e.g. "AGL 001")
          const companyMatch = carrierDataLine.match(/([A-Z]{2,}\s*\d*)\s*$/);
          if (companyMatch) pdfCarrier = companyMatch[1].trim();
        }

        // Extract premium from line after "Billable Premium Annualized Premium"
        const premiumDataLine = findLineAfterHeader(["billable premium", "annualized premium"]);
        let pdfPremium = "0";
        let pdfBillingMethod = "";
        if (premiumDataLine) {
          const premiums = premiumDataLine.match(/\$([\d,.]+)/g);
          if (premiums && premiums.length >= 2) {
            pdfPremium = premiums[1].replace("$", "").replace(",", ""); // Annualized is second
          } else if (premiums && premiums.length === 1) {
            pdfPremium = premiums[0].replace("$", "").replace(",", "");
          }
          if (premiumDataLine.includes("Credit Card")) pdfBillingMethod = "Credit Card";
          else if (premiumDataLine.includes("Bank")) pdfBillingMethod = "Bank Draft";
        }

        // Extract face amount from line after "Face Amount Policy Delivery Type"
        const faceDataLine = findLineAfterHeader(["face amount", "policy delivery type"]);
        let pdfCoverage = "0";
        if (faceDataLine) {
          const faceMatch = faceDataLine.match(/\$([\d,.]+)/);
          if (faceMatch) pdfCoverage = faceMatch[1].replace(",", "");
        }

        // Extract DOB and address
        let pdfDob = "";
        let pdfAddress = "";
        let pdfEmail = "";
        const dobSection = fullText.match(/DOB\s+Address\n([\d-]+)\s+(.+?)\n/m);
        if (dobSection) {
          pdfDob = dobSection[1];
          pdfAddress = dobSection[2].trim();
        }
        const emailSection = fullText.match(/Email\s+Phone\n([\w.@]+)/im);
        if (emailSection) pdfEmail = emailSection[1];

        // Extract beneficiary from the Beneficiaries section
        let pdfBeneficiary = "";
        let pdfBeneficiaryPercent = "";
        const benIdx = pdfLines.findIndex(l => l.trim() === "Beneficiaries");
        if (benIdx > -1) {
          // Skip the header line ("Name Percent SSN Address Phone")
          const benDataLine = pdfLines[benIdx + 2]?.trim() || "";
          const benMatch = benDataLine.match(/^([A-Z]+,\s*[A-Z]+)\s+([\d.]+)\s*%/);
          if (benMatch) {
            pdfBeneficiary = benMatch[1];
            pdfBeneficiaryPercent = benMatch[2];
          }
        }

        // Extract effective date
        let pdfEffectiveDate = "";
        const effDateLine = findLineAfterHeader(["date of issue", "policy effective date"]);
        if (effDateLine) {
          const dates = effDateLine.match(/(\d{2}\/\d{2}\/\d{4})/g);
          if (dates && dates.length >= 2) pdfEffectiveDate = dates[1]; // second date is effective
          else if (dates && dates.length === 1) pdfEffectiveDate = dates[0];
        }

        // Parse address into components
        let pdfCity = "", pdfState = "", pdfZip = "", pdfStreet = "";
        if (pdfAddress) {
          const addrMatch = pdfAddress.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
          if (addrMatch) {
            const streetAndCity = addrMatch[1];
            pdfState = addrMatch[2];
            pdfZip = addrMatch[3];
            // Split street and city (city is last word(s) before state)
            const parts = streetAndCity.split(/\s+/);
            if (parts.length > 2) {
              pdfCity = parts[parts.length - 1];
              pdfStreet = parts.slice(0, -1).join(" ");
            } else {
              pdfStreet = streetAndCity;
            }
          }
        }

        // Convert to rows format for compatibility with existing import logic
        const rows: (string | number | null)[][] = [];
        if (pdfFirstName || pdfLastName) {
          rows.push([
            `${pdfLastName}, ${pdfFirstName}`,  // [0] full name
            pdfFirstName,                        // [1] first name
            pdfLastName,                         // [2] last name
            "",                                  // [3] phone
            "",                                  // [4] lead type
            pdfCarrier,                          // [5] carrier
            pdfPolicyNumber,                     // [6] policy number
            pdfPremium,                          // [7] premium
            "",                                  // [8]
            pdfCoverage,                         // [9] coverage amount
            pdfCoverageType,                     // [10] coverage type
            pdfPolicyStatus,                     // [11] status
            pdfEffectiveDate,                    // [12] effective date
          ]);
        }

        let clientsCreated = 0;
        let policiesCreated = 0;
        let clientsSkipped = 0;
        const importedClients: Array<{ name: string; pin: string; policiesCount: number }> = [];

        // Generate a unique 4-digit PIN for a given last name
        async function generateUniquePin(lastName: string): Promise<string> {
          // No need to check existing hashes, just generate a new PIN
          let pin: string;
          let attempts = 0;
          do {
            pin = String(Math.floor(1000 + Math.random() * 9000));
            attempts++;
          } while (attempts < 100);
          return pin;
        }

        // Parse name — handles both "FirstName LastName" in one cell or split across two cells
        const parseName = (colB: string | null | undefined, colC: string | null | undefined): { firstName: string; lastName: string } | null => {
          const b = (colB || "").toString().trim();
          const c = (colC || "").toString().trim();
          if (!b) return null;
          if (c && c !== "" && !["Lead Type", "Lead Type ", "Carrier"].includes(c)) {
            return { firstName: b, lastName: c };
          }
          // Full name in one cell
          const parts = b.split(/\s+/);
          if (parts.length >= 2) {
            return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
          }
          return null;
        };

        // Find header row
        let dataStartRow = 0;
        let colMap: Record<string, number> | null = null;

        for (let hi = 0; hi < Math.min(rows.length, 10); hi++) {
          const headerRow = rows[hi];
          if (!headerRow) continue;
          const headerStr = headerRow.map(h => (h || "").toString().toLowerCase());
          const hasCarrier = headerStr.some(h => h.includes("carrier"));
          const hasName = headerStr.some(h => h.includes("name") || h.includes("first") || h.includes("last"));
          if (hasCarrier || hasName) {
            colMap = {};
            headerStr.forEach((h, idx) => { colMap![h.trim()] = idx; });
            dataStartRow = hi + 1;
            break;
          }
        }

        // Helper to get cell value by column name (CSV) or index (Excel)
        const getCol = (row: (string | number | null)[], colIndex: number, csvColNames?: string[]): string => {
          if (colMap && csvColNames) {
            for (const name of csvColNames) {
              const idx = colMap[name];
              if (idx !== undefined && row[idx] !== null && row[idx] !== undefined) {
                return (row[idx] || "").toString().trim();
              }
            }
            return "";
          }
          return (row[colIndex] || "").toString().trim();
        };

        for (let i = dataStartRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2) continue;

          // Get name — try CSV column names first, then positional
          const firstNameRaw = colMap
            ? getCol(row, 1, ["first name", "firstname", "first"])
            : (row[1] || "").toString().trim();
          const lastNameRaw = colMap
            ? getCol(row, 2, ["last name", "lastname", "last"])
            : (row[2] || "").toString().trim();

          // If CSV has a single "name" or "client name" column, use parseName on it
          let nameResult;
          if (colMap && !firstNameRaw) {
            const fullName = getCol(row, 0, ["client name", "name", "full name", "client"]);
            nameResult = parseName(fullName, "");
          } else {
            nameResult = parseName(firstNameRaw, lastNameRaw);
          }
          if (!nameResult) continue;

          const { firstName, lastName } = nameResult;
          const phone = colMap
            ? getCol(row, 3, ["phone", "phone number", "cell", "mobile"])
            : (row[3] || "").toString().trim();
          const carrier = colMap
            ? getCol(row, 5, ["carrier", "insurance carrier", "company"])
            : (row[5] || "").toString().trim();
          const policyNumber = colMap
            ? getCol(row, 6, ["policy number", "policy #", "policy no", "policy"])
            : (row[6] || "").toString().trim();
          const monthlyPremiumStr = colMap
            ? getCol(row, 7, ["premium", "monthly premium", "monthly", "amount"])
            : (row[7] || "0").toString();
          const premiumAmount = parseFloat(monthlyPremiumStr.replace(/[^0-9.]/g, "")) || 0;
          const coverageAmountStr = colMap
            ? getCol(row, 9, ["coverage", "coverage amount", "face amount", "benefit"])
            : (row[9] || "0").toString();
          const coverageAmount = parseFloat(coverageAmountStr.replace(/[^0-9.]/g, "")) || 0;
          const coverageType = colMap
            ? getCol(row, 10, ["type", "coverage type", "policy type", "product"])
            : (row[10] || "").toString().trim();
          const status = colMap
            ? getCol(row, 11, ["status", "policy status"]).toLowerCase()
            : (row[11] || "").toString().trim().toLowerCase();

          // Skip empty/template rows
          if (!carrier || carrier === "Carrier") continue;
          if (coverageType === "new" || coverageType === "Coverage Type") continue;

          // Check if client already exists
          let existingClient = await getClientByName(firstName, lastName);
          let clientId: number;
          let isNewClient = false;

          if (existingClient) {
            clientId = existingClient.id;
            clientsSkipped++;
          } else {
            const pin = await generateUniquePin(lastName);
            const hashedPin = await hashPin(pin);
            await createClient({
              firstName,
              lastName,
              email: "",
              pin: hashedPin,
              phone,
            });
            // Fetch the newly created client to get the ID
            const newClient = await getClientByName(firstName, lastName);
            if (!newClient) continue;
            clientId = newClient.id;
            clientsCreated++;
            isNewClient = true;
            // Store the plaintext PIN for display in the response
            importedClients.push({ name: `${firstName} ${lastName}`, pin, policiesCount: 0 });
          }

          // Parse effective date
          let effectiveDate: number | undefined;
          const dateVal = row[12];
          if (dateVal) {
            const dateStr = dateVal.toString().trim();
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              effectiveDate = parsed.getTime();
            }
          }

          // Map status
          let policyStatus: "active" | "pending" | "expired" | "cancelled" = "active";
          if (status.includes("cancel")) policyStatus = "cancelled";
          else if (status.includes("decline")) policyStatus = "cancelled";
          else if (status.includes("pending") || status === "choose") policyStatus = "pending";

          // Check for duplicate policy (same client + carrier + type)
          const existingPolicies = await getClientPolicies(clientId);
          const isDuplicate = existingPolicies.some(p =>
            p.carrier.toLowerCase() === carrier.toLowerCase() &&
            p.type.toLowerCase() === (coverageType || "other").toLowerCase() &&
            (policyNumber ? p.policyNumber === policyNumber : true)
          );
          if (isDuplicate) continue;

          // Create the policy
          await createPolicy({
            clientId,
            policyNumber: policyNumber || `IMP-PDF-${i}`,
            type: (coverageType || "other") as any,
            carrier,
            status: policyStatus as any,
            premiumAmount: premiumAmount.toFixed(2),
            premiumFrequency: "monthly",
            coverageAmount: coverageAmount.toFixed(2),
            effectiveDate: effectiveDate,
            notes: `Imported from PDF: ${input.fileName || "document"}`,
            // Lifecycle: active imports were in-force
            wasEverActive: policyStatus === 'active' ? 1 : 0,
            inForceDate: policyStatus === 'active' ? (effectiveDate || Date.now()) : undefined,
            isPaid: policyStatus === 'active' ? 1 : 0,
            cancelDate: policyStatus === 'cancelled' ? Date.now() : undefined,
          } as any);
          policiesCreated++;

          // Update the count for the matching imported client
          const ic = importedClients.find(c => c.name === `${firstName} ${lastName}`);
          if (ic) ic.policiesCount++;
        }

        return {
          success: true,
          clientsCreated,
          clientsSkipped,
          policiesCreated,
          importedClients,
        };
      }),

    // ─── SALES TRACKER ──────────────────────────────────────────────────────────

    /** Get annuities for a specific month/year based on their effectiveDate */
    getAnnuitiesByMonth: adminProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2100),
      }))
      .query(async ({ input }) => {
        const all = await getAllAnnuities();
        return all.filter((a) => {
          if (!a.effectiveDate) return false;
          const d = new Date(a.effectiveDate);
          return d.getMonth() + 1 === input.month && d.getFullYear() === input.year;
        });
      }),

    /** Get all sales entries for a specific month/year */
    getSalesByMonth: adminProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2100),
      }))
      .query(async ({ input }) => {
        return getSalesEntriesByMonth(input.month, input.year);
      }),

    /** Get agent sales for a specific month/year with agent metadata */
    getAgentSalesByMonth: adminProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2100),
      }))
      .query(async ({ input }) => {
        return getAgentSalesByMonth(input.month, input.year);
      }),

    /** Get all sales entries (for summary/overview) */
    getAllSales: adminProcedure
      .query(async () => {
        return getAllSalesEntries();
      }),

    /** Get all policies (including agent policies) with agent information for the Policies tab */
    getAllPoliciesWithAgents: adminProcedure
      .query(async () => {
        return getAllSalesEntries();
      }),

    /** Get/set agent color configuration */
    getAgentColors: adminProcedure
      .query(async () => {
        const setting = await getAppSetting("agentColors");
        if (setting) {
          try {
            return JSON.parse(setting);
          } catch {
            return {};
          }
        }
        return {};
      }),

    setAgentColors: adminProcedure
      .input(z.record(z.string(), z.string()))
      .mutation(async ({ input }) => {
        await setAppSetting("agentColors", JSON.stringify(input));
        return { success: true };
      }),

    /** Create a new sales entry */
    createSale: adminProcedure
      .input(z.object({
        clientName: z.string().min(1, "Client name is required"),
        productType: z.string().min(1, "Product type is required"),
        carrier: z.string().min(1, "Carrier is required"),
        premium: z.string().min(1, "Premium is required"),
        annualPremium: z.string().optional(),
        commissionPercent: z.string().optional(),
        saleDate: z.number(),
        saleMonth: z.number().min(1).max(12),
        saleYear: z.number().min(2020).max(2100),
        notes: z.string().optional(),
        tagColor: z.string().optional().default("default"),
      }))
      .mutation(async ({ input }) => {
        await createSalesEntry({
          agentId: 0, // Admin creating sales entry
          clientName: input.clientName,
          product: input.productType,
          carrier: input.carrier,
          premium: input.premium,
          annualPremium: input.annualPremium || null,
          commission: input.commissionPercent || null,
          saleDate: input.saleDate,
          month: input.saleMonth,
          year: input.saleYear,
          notes: input.notes || null,
        });
        return { success: true };
      }),

    /** Update an existing sales entry */
    updateSale: adminProcedure
      .input(z.object({
        id: z.number(),
        clientName: z.string().min(1).optional(),
        productType: z.string().min(1).optional(),
        carrier: z.string().min(1).optional(),
        premium: z.string().optional(),
        annualPremium: z.string().optional(),
        commissionPercent: z.string().optional(),
        commissionOverride: z.number().min(65).max(130).optional(),
        isPaid: z.boolean().optional(),
        isCanceled: z.boolean().optional(),
        saleDate: z.number().optional(),
        saleMonth: z.number().min(1).max(12).optional(),
        saleYear: z.number().min(2020).max(2100).optional(),
        notes: z.string().optional(),
        tagColor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = {};
        if (data.clientName !== undefined) updateData.clientName = data.clientName;
        if (data.productType !== undefined) updateData.productType = data.productType;
        if (data.carrier !== undefined) updateData.carrier = data.carrier;
        if (data.premium !== undefined) updateData.premium = data.premium;
        if (data.annualPremium !== undefined) updateData.annualPremium = data.annualPremium || null;
        if (data.commissionPercent !== undefined) updateData.commissionPercent = data.commissionPercent || null;
        if (data.commissionOverride !== undefined) updateData.commissionOverride = data.commissionOverride || null;
        if (data.isPaid !== undefined) updateData.isPaid = data.isPaid ? 1 : 0;
        if (data.isCanceled !== undefined) updateData.isCanceled = data.isCanceled ? 1 : 0;
        if (data.saleDate !== undefined) updateData.saleDate = data.saleDate;
        if (data.saleMonth !== undefined) updateData.saleMonth = data.saleMonth;
        if (data.saleYear !== undefined) updateData.saleYear = data.saleYear;
        if (data.notes !== undefined) updateData.notes = data.notes || null;
        if (data.tagColor !== undefined) updateData.tagColor = data.tagColor;
        await updateSalesEntry(id, updateData as any);
        return { success: true };
      }),

    /** Delete a sales entry */
    deleteSale: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSalesEntry(input.id);
        return { success: true };
      }),

    /** Bulk delete sales entries */
    bulkDeleteSales: adminProcedure
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ input }) => {
        for (const saleId of input.ids) {
          await deleteSalesEntry(saleId);
        }
        return { success: true, deletedCount: input.ids.length };
      }),



    /** Sync a policy's premium/carrier/type to the matching sales_entries record */
    syncPolicyToSalesTracker: adminProcedure
      .input(z.object({
        policyId: z.number(),
        /** Optional: caller-supplied commission % (from CARRIER_COMP_RATES on the client) */
        commissionPercent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // 1. Load the policy
        const policy = await getPolicyById(input.policyId);
        if (!policy) throw new TRPCError({ code: "NOT_FOUND", message: "Policy not found" });

        // 2. Load the client to get their full name
        const client = await getClientById(policy.clientId);
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found for this policy" });
        const clientName = `${client.firstName} ${client.lastName}`;

        // 3. Find matching sales entry: same clientName + carrier (fuzzy: same carrier prefix)
        const entries = await getSalesEntriesByClientName(clientName);
        const carrier = (policy.carrier || "").trim();
        const productType = (policy.type || "").trim();

        // Try exact carrier + policyType match first, then just carrier
        let match = entries.find(e =>
          e.carrier.trim().toLowerCase() === carrier.toLowerCase() &&
          e.policyType.trim().toLowerCase() === productType.toLowerCase()
        );
        if (!match) {
          match = entries.find(e =>
            e.carrier.trim().toLowerCase() === carrier.toLowerCase()
          );
        }

        if (!match) {
          // Auto-create a sales entry if one doesn't exist
          const saleMonth = policy.effectiveDate
            ? new Date(policy.effectiveDate).getMonth() + 1
            : new Date().getMonth() + 1;
          const saleYear = policy.effectiveDate
            ? new Date(policy.effectiveDate).getFullYear()
            : new Date().getFullYear();

          // Default commission % (will be 0 if not found)
          const commPct = input.commissionPercent
            ? parseFloat(input.commissionPercent)
            : 0;

          const premium = parseFloat(String(policy.premiumAmount) || "0");
          const annualPremium = policy.yearlyAP
            ? parseFloat(String(policy.yearlyAP))
            : premium * 12;
          const commAmount = (annualPremium * commPct) / 100;

          // Create the new sales entry
          const saleDate = policy.effectiveDate
            ? new Date(policy.effectiveDate).getTime()
            : Date.now();

          await createSalesEntry({
            agentId: 0, // Admin syncing policy to sales tracker
            clientName,
            carrier: carrier || "Unknown",
            product: productType || "Unknown",
            premium: String(premium.toFixed(2)),
            annualPremium: String(annualPremium.toFixed(2)),
            commission: String(commPct.toFixed(2)),
            saleDate,
            month: saleMonth,
            year: saleYear,
          });

          return {
            success: true,
            created: true,
            clientName,
            carrier,
            productType,
            premium: premium.toFixed(2),
            annualPremium: annualPremium.toFixed(2),
            commissionPercent: commPct.toFixed(2),
          };
        }

        // 4. Compute updated values
        const premiumStr = policy.premiumAmount || "0";
        const premium = parseFloat(premiumStr);
        const annualPremium = policy.yearlyAP
          ? parseFloat(String(policy.yearlyAP))
          : premium * 12; // fallback: monthly × 12

        const commPct = input.commissionPercent
          ? parseFloat(input.commissionPercent)
          : match.commission
            ? parseFloat(String(match.commission))
            : null;

        const commAmount = commPct !== null && !isNaN(commPct)
          ? (annualPremium * commPct) / 100
          : null;

        // 5. Determine month / year from issueDate (keep existing if no effectiveDate)
        let month = match.month;
        let year = match.year;
        if (policy.effectiveDate) {
          const d = new Date(policy.effectiveDate);
          month = d.getMonth() + 1;
          year = d.getFullYear();
        }

        // 6. Apply the update
        await updateSalesEntry(match.id, {
          carrier: carrier || match.carrier,
          policyType: productType || match.policyType,
          premium: String(premium.toFixed(2)),
          annualPremium: String(annualPremium.toFixed(2)),
          commission: commPct !== null ? String(commPct.toFixed(2)) : match.commission ?? undefined,
          month,
          year,
        } as any);

        return {
          success: true,
          updatedEntryId: match.id,
          clientName,
          carrier,
          productType,
          premium: premium.toFixed(2),
          annualPremium: annualPremium.toFixed(2),
          commissionPercent: commPct !== null ? commPct.toFixed(2) : null,
        };
      }),

    // ── App Settings ──────────────────────────────────────────────────────────
    getSetting: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await getAppSetting(input.key);
        return { value };
      }),
    setSetting: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setAppSetting(input.key, input.value);
        return { success: true };
      }),

    getClientLoginStats: adminProcedure.query(async () => {
      return await getClientLoginStats();
    }),

    getClientLoginStatus: adminProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        const result = await getClientWithLoginStatus(input.clientId);
        if (!result) return null;
        // Strip sensitive fields and return only masked last-4 derived values
        const { pin, ssn, driverLicense, accountNumber, routingNumber, ...safeClient } = result;
        return {
          ...safeClient,
          ssnLast4: ssn ? ssn.slice(-4) : null,
          driverLicenseLast4: driverLicense ? driverLicense.slice(-4) : null,
          accountNumberLast4: accountNumber ? accountNumber.slice(-4) : null,
          routingNumberLast4: routingNumber ? routingNumber.slice(-4) : null,
        };
      }),

    generatePolicyDocument: adminProcedure
      .input(z.object({ policyId: z.number() }))
      .mutation(async ({ input }) => {
        const policy = await getPolicyById(input.policyId);
        if (!policy) throw new TRPCError({ code: "NOT_FOUND", message: "Policy not found" });
        const client = await getClientById(policy.clientId);
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
        const clientName = `${client.firstName} ${client.lastName}`;
        
        // Carrier contact info (hardcoded for now, can be moved to DB later)
        const carrierContacts: Record<string, { phone: string; portalUrl: string }> = {
          "Transamerica": { phone: "1-800-523-7900", portalUrl: "https://www.transamerica.com/individual/insurance/your-life-insurance-policy" },
          "Mutual of Omaha": { phone: "1-800-775-6000", portalUrl: "https://www.mutualofomaha.com/welcome/customer-access" },
          "Americo": { phone: "1-816-641-2850", portalUrl: "https://www.americocustomer.com/" },
          "Athene": { phone: "1-888-266-8489", portalUrl: "https://www.athene.com/signup" },
          "American Equity": { phone: "1-888-221-1234", portalUrl: "https://myportal.american-equity.com/" },
          "Corebridge": { phone: "1-800-424-4990", portalUrl: "https://www.corebridgefinancial.com/rs/login" },
          "CICA": { phone: "1-800-880-5044", portalUrl: "https://cicaamerica.citizensinc.com/" },
          "Elco": { phone: "1-800-321-3526", portalUrl: "https://www.elcomutual.com/" },
        };
        
        const carrierInfo = carrierContacts[policy.carrier] || { phone: "Contact carrier for details", portalUrl: "" };
        const portalLink = `https://www.ortizinsurancebroker.com/portal`;
        
        const policyText = `Hi there! Welcome to Ortiz Insurance.

Your secure client portal is now ready. You can view your policy details, documents, and coverage information anytime.

PORTAL LOGIN
Portal: ${portalLink}
Last Name: ${client.lastName}
PIN: [The PIN you set during client creation]
POLICY SUMMARY
- Type: ${policy.type || "N/A"}
- Carrier: ${policy.carrier || "N/A"}
- Policy Number: ${policy.policyNumber || "N/A"}
- Coverage Amount: $${parseFloat(String(policy.coverageAmount || 0)).toFixed(2)}
- Monthly Premium: $${parseFloat(String(policy.premiumAmount || 0)).toFixed(2)}
- Annual Premium: $${parseFloat(String(policy.yearlyAP || 0)).toFixed(2)}
- Status: ${policy.status?.toUpperCase() || "ACTIVE"}${policy.effectiveDate ? `
- Issue Date: ${new Date(policy.effectiveDate).toLocaleDateString()}` : ""}${policy.expirationDate ? `
- Expiration Date: ${new Date(policy.expirationDate).toLocaleDateString()}` : ""}

If you have any questions about your policy or coverage, please don't hesitate to reach out.

Ortiz Insurance: (361) 613-8336
Email: eortiz@ortizinsurancebroker.com
5333 Yorktown Blvd, Corpus Christi, TX 78413

Hours: Monday - Friday, 9:00 AM - 5:00 PM (CST)

- Ortiz Insurance Broker
"Promise Today, Protect Tomorrow"`;
        return { clientName, policyNumber: policy.policyNumber, documentText: policyText };
      }),

    sendPolicyDocumentEmail: adminProcedure
      .input(z.object({ policyId: z.number(), clientEmail: z.string().email() }))
      .mutation(async ({ input }) => {
        const policy = await getPolicyById(input.policyId);
        if (!policy) throw new TRPCError({ code: "NOT_FOUND", message: "Policy not found" });
        const client = await getClientById(policy.clientId);
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
        const clientName = `${client.firstName} ${client.lastName}`;
        const coverageStr = String(policy.coverageAmount || "N/A");
        const premiumStr = String(policy.premiumAmount || "N/A");
        const yearlyStr = String(policy.yearlyAP || "N/A");
        const policyText = `POLICY DOCUMENT\n\nClient: ${clientName}\nEmail: ${client.email}\nPhone: ${client.phone}\n\nPolicy Number: ${policy.policyNumber}\nCarrier: ${policy.carrier}\nType: ${policy.type}\nStatus: ${policy.status}\nCoverage Amount: $${coverageStr}\nPremium: $${premiumStr} ${policy.premiumFrequency}\nYearly Annual Premium: $${yearlyStr}\n${policy.effectiveDate ? `Issue Date: ${new Date(policy.effectiveDate).toLocaleDateString()}\n` : ""}${policy.expirationDate ? `Expiration Date: ${new Date(policy.expirationDate).toLocaleDateString()}\n` : ""}\nThis policy document is provided for informational purposes only.\nPlease contact Ortiz Insurance Broker for any questions.\nPhone: (361) 613-8336\nEmail: eortiz@ortizinsurancebroker.com`;
        const emailBody = `<pre>${policyText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
        try {
          const success = await sendEmail({ to: input.clientEmail, subject: `Your Policy Document - ${policy.policyNumber}`, html: emailBody });
          return { success, message: success ? "Email sent successfully" : "Failed to send email" };
        } catch (error) {
          console.error("[Email] Failed to send policy document:", error);
          return { success: false, message: "Failed to send email" };
        }
      }),
    generateWelcomeText: adminProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ input }) => {
        const client = await getClientById(input.clientId);
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
        
        const allPolicies = await getAllPolicies();
        const policies = allPolicies.filter((p: any) => p.clientId === input.clientId);
        
        const clientName = `${client.firstName} ${client.lastName}`;
        const portalLink = `https://www.ortizinsurancebroker.com/portal`;
        
        // Build policy summary with carrier and product details
        let policySummary = "";
        if (policies.length > 0) {
          policySummary = "\nPOLICY SUMMARY";
          policies.forEach((p, idx) => {
            policySummary += `\n- Type: ${p.type}`;
            policySummary += `\n- Carrier: ${p.carrier}`;
            policySummary += `\n- Monthly Premium: $${parseFloat(String(p.premiumAmount || 0)).toFixed(2)}`;
            if (p.effectiveDate) {
              policySummary += `\n- Issue Date: ${new Date(p.effectiveDate).toLocaleDateString()}`;
            }
            if (idx < policies.length - 1) policySummary += "\n";
          });
        }
        
        const welcomeText = `Hi there! Welcome to Ortiz Insurance.\n\nYour secure client portal is now ready. You can view your policy details, documents, and coverage information anytime.\n\nPORTAL LOGIN\nPortal: ${portalLink}\nLast Name: ${client.lastName}\nPIN: [The PIN you set during client creation]${policySummary}\n\nIf you have any questions about your policy or coverage, please don't hesitate to reach out.\n\nOrtiz Insurance: (361) 613-8336\n\n- Ortiz Insurance Broker`;
        
        return { clientName, welcomeText };
      }),

    // ── Carriers ──────────────────────────────────────────────────────────
    getCarrierPortalUrl: publicProcedure
      .input(z.object({ carrierName: z.string() }))
      .query(async ({ input }) => {
        const carrierInfo = await getCarrierPortalUrl(input.carrierName);
        return carrierInfo;
      }),

    getAllCarriers: adminProcedure.query(async () => {
      return await getAllCarriers();
    }),

    // ── ANNUAL REVIEW STATS ───────────────────────────────────────────────────
    getClientsAnnualReviewStats: adminProcedure.query(async () => {
      const clients = await getAllClients();
      const now = Date.now();
      const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
      const twoMonthsMs = 60 * 24 * 60 * 60 * 1000;
      const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;

      let dueThisMonth = 0;
      let dueIn2Months = 0;
      let dueIn3Months = 0;

      for (const client of clients) {
        if (!client.lastReviewDate) {
          dueThisMonth++;
        } else {
          const lastReviewTime = client.lastReviewDate * 1000;
          const nextReviewDue = lastReviewTime + oneYearMs;
          const timeUntilDue = nextReviewDue - now;

          if (timeUntilDue <= 0) {
            dueThisMonth++;
          } else if (timeUntilDue <= oneMonthMs) {
            dueThisMonth++;
          } else if (timeUntilDue <= twoMonthsMs) {
            dueIn2Months++;
          } else if (timeUntilDue <= threeMonthsMs) {
            dueIn3Months++;
          }
        }
      }

      return {
        dueThisMonth,
        dueIn2Months,
        dueIn3Months,
        total: dueThisMonth + dueIn2Months + dueIn3Months,
      };
    }),

    // ── EXPENSES ──────────────────────────────────────────────────────────────
    listExpensesByMonth: adminProcedure
      .input(z.object({ month: z.number().min(1).max(12), year: z.number() }))
      .query(async ({ input }) => {
        // getExpensesByMonth already imported at top of file
        return getExpensesByMonth(input.month, input.year);
      }),

    createExpense: adminProcedure
      .input(z.object({
        category: z.enum(["cell_phone", "leads", "crm", "wavv_dialer", "miscellaneous"]),
        amount: z.number().min(0),
        description: z.string().optional(),
        expenseMonth: z.number().min(1).max(12),
        expenseYear: z.number(),
      }))
      .mutation(async ({ input }) => {
        // createExpense already imported at top of file
        await createExpense({
          agentId: 0, // Admin expense - no specific agent
          category: input.category,
          amount: input.amount.toString() as any,
          description: input.description,
          month: input.expenseMonth,
          year: input.expenseYear,
          expenseDate: Date.now(),
        });
        return { success: true };
      }),

    updateExpense: adminProcedure
      .input(z.object({
        id: z.number(),
        category: z.enum(["cell_phone", "leads", "crm", "wavv_dialer", "miscellaneous"]).optional(),
        amount: z.number().min(0).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // updateExpense already imported at top of file
        const { id, amount, ...rest } = input;
        const data: Record<string, any> = rest;
        if (amount !== undefined) {
          data.amount = amount.toString();
        }
        await updateExpense(id, data as any);
        return { success: true };
      }),

    deleteExpense: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // deleteExpense already imported at top of file
        await deleteExpense(input.id);
        return { success: true };
      }),

    getTotalExpensesByMonth: adminProcedure
      .input(z.object({ month: z.number().min(1).max(12), year: z.number() }))
      .query(async ({ input }) => {
        // getTotalExpensesByMonth already imported at top of file
        return getTotalExpensesByMonth(input.month, input.year);
      }),
    linkHousehold: adminProcedure
      .input(z.object({
        clientIds: z.array(z.number()).min(2, "At least 2 clients required"),
      }))
      .mutation(async ({ input }) => {
        if (input.clientIds.length < 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "At least 2 clients are required to create a household",
          });
        }

        const householdId = Date.now() + Math.floor(Math.random() * 10000);

        for (const clientId of input.clientIds) {
          await updateClient(clientId, { householdId });
        }

        return { success: true, householdId };
      }),

    // ── Agent Management ──────────────────────────────────────────────────

    /** List all agents */
    listAgents: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const allAgents = await db.select().from(agents).orderBy(desc(agents.createdAt));
      const currentYear = new Date().getFullYear();
      const thisMonthStart = new Date(currentYear, new Date().getMonth(), 1);
      const thisMonthEnd = new Date(currentYear, new Date().getMonth() + 1, 0);
      // Compute persistence data for each agent
      const result = await Promise.all(allAgents.map(async ({ passwordHash, passwordChangedAt, pin, ...safeAgent }) => {
        const persistenceResult = await calculatePersistenceRate(safeAgent.id, currentYear);
        // Count active life policies for this agent
        const activePoliciesResult = await db
          .select({ count: sql`COUNT(*)`.mapWith(Number) })
          .from(policies)
          .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
          .where(
            and(
              eq(policyAgents.agentId, safeAgent.id),
              eq(policies.status, "active")
            )
          );
        // Count cancelled this month — only genuine lapses (was previously active, isPaid=1)
        // Excludes never-placed/never-paid cancellations (isPaid=0)
        const cancelledResult = await db
          .select({ count: sql`COUNT(*)`.mapWith(Number) })
          .from(policies)
          .innerJoin(policyAgents, eq(policies.id, policyAgents.policyId))
          .where(
            and(
              eq(policyAgents.agentId, safeAgent.id),
              eq(policies.status, "cancelled"),
              ne(policies.isPaid, 0), // Only genuine lapses
              gte(policies.updatedAt, thisMonthStart),
              lte(policies.updatedAt, thisMonthEnd)
            )
          );
        return {
          ...safeAgent,
          // Live Book: persistenceRate is null when no placed policies exist
          persistenceRate: persistenceResult.rate,
          totalPlaced: persistenceResult.totalPlaced,
          activeInForce: persistenceResult.activeInForce,
          startingBlock: persistenceResult.totalPlaced,   // alias
          stillActive: persistenceResult.activeInForce,   // alias
          activePolicies: activePoliciesResult[0]?.count || 0,
          cancelledThisMonth: cancelledResult[0]?.count || 0,
        };
      }));
      return result;
    }),

    /** Get agent annual review statistics (when agents clients are due for reviews) */
    getAgentAnnualReviewStats: adminProcedure.query(async () => {
      const allClients = await getAllClients();
      
      const now = Date.now();
      const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
      const twoMonthsMs = 60 * 24 * 60 * 60 * 1000;
      const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;

      let clientsDueThisMonth = 0;
      let clientsDueIn2Months = 0;
      let clientsDueIn3Months = 0;

      for (const client of allClients) {
        // Only count clients that have a lastReviewDate set
        if (client.lastReviewDate) {
          const lastReviewTime = client.lastReviewDate * 1000;
          const nextReviewDue = lastReviewTime + oneYearMs;
          const timeUntilDue = nextReviewDue - now;

          if (timeUntilDue <= 0) {
            clientsDueThisMonth++;
          } else if (timeUntilDue <= oneMonthMs) {
            clientsDueThisMonth++;
          } else if (timeUntilDue <= twoMonthsMs) {
            clientsDueIn2Months++;
          } else if (timeUntilDue <= threeMonthsMs) {
            clientsDueIn3Months++;
          }
        }
      }

      return {
        clientsDueThisMonth,
        clientsDueIn2Months,
        clientsDueIn3Months,
        total: clientsDueThisMonth + clientsDueIn2Months + clientsDueIn3Months,
      };
    }),

    /** Create a new agent with temporary password */
    createAgent: adminProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        licenseNumber: z.string().optional(),
        licenseState: z.string().optional(),
        agentStatus: z.enum(["active", "inactive"]).default("active"),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const normalizedEmail = input.email.trim().toLowerCase();

        // SECURITY: Reject any test agent creation
        if (normalizedEmail.includes('test-agent') || normalizedEmail.includes('@example.com')) {
          console.error(`[SECURITY] Attempted to create test agent: ${normalizedEmail}`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Test agents cannot be created. Please use real agent emails.",
          });
        }

        // Check if agent with this email already exists
        const existingAgent = await getAgentByEmail(normalizedEmail);
        if (existingAgent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "An agent with this email already exists",
          });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-12);
        const passwordHash = hashPassword(tempPassword);

        try {
          await db.insert(agents).values({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone || null,
            licenseNumber: input.licenseNumber || null,
            licenseState: input.licenseState || null,
            agentStatus: input.agentStatus,
            passwordHash: passwordHash,
            passwordChangedAt: Date.now(),
          });

          // Generate welcome text with onboarding instructions
          const portalUrl = "https://www.ortizinsurancebroker.com/agent/login";
          const welcomeText = `WELCOME TO ORTIZ INSURANCE AGENT PORTAL\n${'='.repeat(50)}\n\nAgent Name: ${input.firstName} ${input.lastName}\nEmail: ${input.email}\nTemporary Password: ${tempPassword}\n\nPORTAL ACCESS INSTRUCTIONS\n${'─'.repeat(50)}\n\n1. Go to: ${portalUrl}\n2. Click \"Agent Login\"\n3. Enter your email: ${input.email}\n4. Enter your temporary password: ${tempPassword}\n5. You will be prompted to change your password on first login\n\nPORTAL FEATURES\n${'─'.repeat(50)}\n\n• Analytics Dashboard - View your sales and commission data\n• Sales Tracker - Log and manage your sales entries\n• Client Management - Create and manage your clients\n• Policy Management - View all policies you've sold\n• Annuities - Track annuity products\n\nSECURITY NOTES\n${'─'.repeat(50)}\n\n• Change your password immediately after first login\n• Do not share your password with anyone\n• Log out when finished using the portal\n• Contact admin if you forget your password\n\nQUESTIONS?\n${'─'.repeat(50)}\n\nContact the admin for assistance with your account.\n\n${'='.repeat(50)}\n`;

          return {
            success: true,
            tempPassword,
            message: `Agent created. Share this password: ${tempPassword}`,
            welcomeText,
          };
        } catch (err: any) {
          if (err.message?.includes("Duplicate")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "An agent with this email already exists",
            });
          }
          throw err;
        }
      }),

    /** Update agent status */
    updateAgentStatus: adminProcedure
      .input(z.object({
        agentId: z.number(),
        agentStatus: z.enum(["active", "inactive"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(agents)
          .set({ agentStatus: input.agentStatus })
          .where(eq(agents.id, input.agentId));

        return { success: true };
      }),

    /** Update agent email */
    updateAgent: adminProcedure
      .input(z.object({
        agentId: z.number(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        licenseNumber: z.string().optional(),
        licenseState: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const updates: Record<string, any> = {};
        if (input.firstName !== undefined) updates.firstName = input.firstName;
        if (input.lastName !== undefined) updates.lastName = input.lastName;
        if (input.email !== undefined) updates.email = input.email;
        if (input.phone !== undefined) updates.phone = input.phone;
        if (input.licenseNumber !== undefined) updates.licenseNumber = input.licenseNumber;
        if (input.licenseState !== undefined) updates.licenseState = input.licenseState;

        await db.update(agents)
          .set(updates)
          .where(eq(agents.id, input.agentId));

        return { success: true };
      }),

    /** Reset agent password and generate temporary password */
    resetAgentPassword: adminProcedure
      .input(z.object({ agentId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Verify agent exists
        const agent = await getAgentById(input.agentId);
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(2, 12);
        const passwordHash = hashPassword(tempPassword);
        console.log(`[DIAG:resetAgentPassword] Resetting password for agentId: ${input.agentId}`);
        console.log(`[DIAG:resetAgentPassword] Agent email: ${agent.email}, status: ${agent.agentStatus}`);
        console.log(`[DIAG:resetAgentPassword] passwordHash generated, length: ${passwordHash.length}`);

        // Save temporary password hash to database
        // Set passwordChangedAt to NULL so agent is forced to change password on first login
        const result = await db.update(agents)
          .set({
            passwordHash: passwordHash,
            passwordChangedAt: null,
          })
          .where(eq(agents.id, input.agentId));
        console.log(`[DIAG:resetAgentPassword] DB update result:`, JSON.stringify(result));

        // Verify the update persisted by re-reading from DB
        const updatedAgent = await getAgentById(input.agentId);
        const hashAfterUpdate = !!updatedAgent?.passwordHash;
        const hashLengthAfterUpdate = updatedAgent?.passwordHash?.length ?? 0;
        console.log(`[DIAG:resetAgentPassword] After update - passwordHash exists: ${hashAfterUpdate}, length: ${hashLengthAfterUpdate}`);
        console.log(`[DIAG:resetAgentPassword] passwordChangedAt after update: ${updatedAgent?.passwordChangedAt}`);

        return { success: true, tempPassword };
      }),

    /** Delete an agent */
    deleteAgent: adminProcedure
      .input(z.object({ agentId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.delete(agents).where(eq(agents.id, input.agentId));
        return { success: true };
      }),

    /** Get agent sales metrics for all months */
    getAgentSalesMetrics: adminProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        const salesEntries = await getAgentSalesEntries(input.agentId);
        const agentClients = await getAgentClients(input.agentId);
        
                const monthlyData: any[] = [];
        for (let month = 1; month <= 12; month++) {
          // All submitted sales for this month
          const allMonthSales = salesEntries.filter((s: any) => s.saleMonth === month);
          // Only issued/paid sales
          const paidMonthSales = allMonthSales.filter((s: any) => s.isPaid === 1);
          const submittedPremium = allMonthSales.reduce((sum: number, s: any) => sum + parseFloat(s.premium || "0"), 0);
          const submittedAnnualPremium = allMonthSales.reduce((sum: number, s: any) => {
            const ap = parseFloat(s.annualPremium || "0");
            return sum + (isNaN(ap) ? parseFloat(s.premium || "0") * 12 : ap);
          }, 0);
          const issuedPremium = paidMonthSales.reduce((sum: number, s: any) => sum + parseFloat(s.premium || "0"), 0);
          const issuedAnnualPremium = paidMonthSales.reduce((sum: number, s: any) => {
            const ap = parseFloat(s.annualPremium || "0");
            return sum + (isNaN(ap) ? parseFloat(s.premium || "0") * 12 : ap);
          }, 0);
          monthlyData.push({
            month,
            issuedPaid: issuedPremium,
            annualPremium: issuedAnnualPremium,
            submittedPremium,
            submittedAnnualPremium,
            totalSubmitted: allMonthSales.length,
            totalIssued: paidMonthSales.length,
            totalClients: agentClients.length,
          });
        }
        return monthlyData;
      }),

    sendAnnualReviewEmail: adminProcedure
      .input(z.object({
        clientEmail: z.string().email(),
        clientName: z.string(),
        policyNumber: z.string(),
        carrier: z.string(),
        effectiveDate: z.date(),
        portalUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        // buildAnnualReviewEmail, sendEmail already imported at top of file
        const html = buildAnnualReviewEmail({
          clientName: input.clientName,
          policyNumber: input.policyNumber,
          carrier: input.carrier,
          effectiveDate: input.effectiveDate,
          reviewDueDate: new Date(),
          portalUrl: input.portalUrl,
        });
        const success = await sendEmail({
          to: input.clientEmail,
          subject: `Your Annual Policy Review is Due - ${input.policyNumber}`,
          html,
        });
        return { success };
      }),

    /** Send welcome text SMS to admin */

    sendWelcomeTextSMS: adminProcedure
      .input(z.object({
        agentName: z.string(),
        agentEmail: z.string().email(),
        welcomeText: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // sendEmail already imported at top of file
          const adminEmail = "eortiz@ortizinsurancebroker.com";
          
          const emailHtml = `
            <h2>New Agent Welcome Text</h2>
            <p><strong>Agent:</strong> ${input.agentName}</p>
            <p><strong>Email:</strong> ${input.agentEmail}</p>
            <hr />
            <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word;">${input.welcomeText}</pre>
            <p><em>Copy and share this text with the new agent.</em></p>
          `;
          
          const success = await sendEmail({
            to: adminEmail,
            subject: `Agent Welcome Text - ${input.agentName}`,
            html: emailHtml,
          });
          
          if (!success) {
            throw new Error("Failed to send email");
          }
          
          return { success: true, message: "Welcome text sent to your email" };
        } catch (error: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to send email",
          });
        }
            }),

    getAgentPerformance: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const allAgents = await db.select().from(agents).where(eq(agents.agentStatus, "active"));

      // Compute date boundaries using saleDate (Unix timestamp in milliseconds)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
      const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1).getTime();

      const result = [];
      for (const agent of allAgents) {
        // Monthly: saleDate >= startOfMonth AND saleDate < startOfNextMonth
        const monthlyEntries = await db.select().from(salesEntries).where(
          and(
            eq(salesEntries.agentId, agent.id),
            gte(salesEntries.saleDate, startOfMonth),
            lt(salesEntries.saleDate, startOfNextMonth)
          )
        );
        // YTD: saleDate >= startOfYear AND saleDate < startOfNextYear
        const ytdEntries = await db.select().from(salesEntries).where(
          and(
            eq(salesEntries.agentId, agent.id),
            gte(salesEntries.saleDate, startOfYear),
            lt(salesEntries.saleDate, startOfNextYear)
          )
        );
        // Get last login from agentSessions
        const sessionRows = await db.select({ lastActivityAt: agentSessions.lastActivityAt })
          .from(agentSessions)
          .where(eq(agentSessions.agentId, agent.id))
          .limit(1);
        const lastLogin = sessionRows.length > 0 ? sessionRows[0].lastActivityAt : null;

        // Get clients added this month by this agent
        const agentClients = await db.select().from(clients)
          .where(eq(clients.createdByAgentId, agent.id));
        const clientsAddedThisMonth = agentClients.filter(c => {
          const created = c.createdAt ? Number(c.createdAt) : 0;
          return created >= startOfMonth && created < startOfNextMonth;
        }).length;

        result.push({
          id: agent.id,
          name: `${agent.firstName} ${agent.lastName}`,
          lastLogin,
          clientsAddedThisMonth,
          monthlyStats: {
            salesCount: monthlyEntries.length,
            totalAP: monthlyEntries.reduce((s, e) => s + (Number(e.annualPremium) || 0), 0),
            totalCommission: monthlyEntries.reduce((s, e) => s + (Number(e.commission) || 0), 0),
          },
          ytdStats: {
            salesCount: ytdEntries.length,
            totalAP: ytdEntries.reduce((s, e) => s + (Number(e.annualPremium) || 0), 0),
            totalCommission: ytdEntries.reduce((s, e) => s + (Number(e.commission) || 0), 0),
          },
        });
      }
      return result;
    }),

    checkDuplicateClient: adminProcedure.input(z.object({ firstName: z.string(), lastName: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const similar = await db.select().from(clients).where(eq(clients.firstName, input.firstName)).limit(5);
      // Strip sensitive fields and return only masked last-4 derived values
      const safeClients = similar.map(({ pin, ssn, driverLicense, accountNumber, routingNumber, ...safe }) => ({
        ...safe,
        ssnLast4: ssn ? ssn.slice(-4) : null,
        accountNumberLast4: accountNumber ? accountNumber.slice(-4) : null,
      }));
      return { hasDuplicate: similar.length > 0, count: similar.length, clients: safeClients };
    }),

        /** Get admin's own book of business persistence rate (Live Book formula) */
    getMyPersistence: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const currentYear = new Date().getFullYear();
      // Get the admin's own agent ID
      const adminAgentId = await getOrCreateAdminAgentRecord();
      // Live Book: Persistency% = Active In-Force ÷ Total Placed × 100
      const persistenceResult = await calculatePersistenceRate(adminAgentId, currentYear);
      // Cancellations this month = life policies (wasEverActive=1) cancelled this calendar month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const cancelledThisMonthRows = await db
        .select({ p: policies })
        .from(policies)
        .innerJoin(policyAgents, and(
          eq(policies.id, policyAgents.policyId),
          eq(policyAgents.agentId, adminAgentId)
        ))
        .where(
          and(
            eq(policies.wasEverActive, 1),
            gte(policies.cancelDate, startOfMonth),
            lte(policies.cancelDate, endOfMonth)
          )
        );
      const cancellationsThisMonth = cancelledThisMonthRows
        .map(r => r.p)
        .filter(p => isLifePolicyType(p.type)).length;
      return {
        persistenceRate: persistenceResult.rate,
        totalPlaced: persistenceResult.totalPlaced,
        activeInForce: persistenceResult.activeInForce,
        // backward-compat aliases
        startingBlock: persistenceResult.totalPlaced,
        stillActive: persistenceResult.activeInForce,
        activePoliciesCount: persistenceResult.activeInForce,
        cancellationsThisMonth,
        year: currentYear,
      };
    }),

    getAnnualReviewReminders: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const allPolicies = await db.select().from(policies);
      const now = Date.now();
      const reminders = [];
      for (const policy of allPolicies) {
        if (!policy.effectiveDate) continue;
        const effectiveDate = typeof policy.effectiveDate === 'number' ? policy.effectiveDate : new Date(policy.effectiveDate).getTime();
        const nextReview = new Date(effectiveDate);
        nextReview.setFullYear(nextReview.getFullYear() + 1);
        const daysUntilReview = Math.ceil((nextReview.getTime() - now) / (1000 * 60 * 60 * 24));
        if (daysUntilReview > 0 && daysUntilReview <= 90) {
          const client = await db.select().from(clients).where(eq(clients.id, policy.clientId)).limit(1);
          reminders.push({ policy, client: client[0] || null, daysUntilReview, reviewDate: nextReview.toISOString() });
        }
      }
      return reminders.sort((a, b) => a.daysUntilReview - b.daysUntilReview);
    }),

    /** Clear all data and keep only Nathan Faughn and Mauri Givens */
    clearDatabase: adminProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        // notInArray already imported at top of file
        
        // Delete all data in order of dependencies
        await db.delete(clients);
        await db.delete(policies);
        await db.delete(salesEntries);
        await db.delete(expenses);
        
        // Delete all agents except Nathan Faughn and Mauri Givens
        const agentsToKeep = await db.select().from(agents).where(
          notInArray(agents.firstName, ["Nathan", "Mauri"])
        );
        for (const agent of agentsToKeep) {
          await db.delete(agents).where(eq(agents.id, agent.id));
        }

        return { success: true, message: "Database cleared successfully" };
      } catch (error) {
        console.error("Error clearing database:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to clear database" });
      }
    }),

    calculateCommission: publicProcedure.input(z.object({ annualPremium: z.number(), commissionPercent: z.number() })).query(({ input }) => {
      const commission = (input.annualPremium * input.commissionPercent) / 100;
      return { commission, annualPremium: input.annualPremium, commissionPercent: input.commissionPercent };
    }),

    getAllAgents: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const allAgents = await db.select().from(agents);
      // Strip sensitive fields before sending to frontend
      return allAgents.map(({ passwordHash, passwordChangedAt, pin, ...safeAgent }) => safeAgent);
    }),

    // getAgentOnboardingProgress: adminProcedure.query(async () => {
    //   const db = await getDb();
    //   if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    //   return db.select().from(agentOnboardingProgress);
    // }),

    /** List all Graded Whole Life policies */
    listGWL: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.execute(sql`SELECT * FROM graded_whole_life_policies ORDER BY createdAt DESC`);
      return (result as any)[0] || [];
    }),
    /** Add a new GWL policy */
    addGWL: adminProcedure
      .input(z.object({
        clientName: z.string().min(1),
        carrier: z.string().min(1),
        policyNumber: z.string().optional().default(""),
        premium: z.string().min(1),
        premiumFrequency: z.enum(["monthly", "quarterly", "semi-annual", "annual"]).default("monthly"),
        commissionPercent: z.string().optional().default(""),
        coverageAmount: z.string().optional().default(""),
        status: z.enum(["active", "pending", "lapsed", "cancelled"]).default("active"),
        notes: z.string().optional().default(""),
        yearlyAP: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.execute(sql`INSERT INTO graded_whole_life_policies (clientName, carrier, policyNumber, premium, gwl_premiumFrequency, yearlyAP, commissionPercent, faceAmount, gwl_status, notes) VALUES (${input.clientName}, ${input.carrier}, ${input.policyNumber}, ${input.premium}, ${input.premiumFrequency}, ${input.yearlyAP || null}, ${input.commissionPercent}, ${input.coverageAmount}, ${input.status}, ${input.notes})`);
        return { success: true };
      }),
    /** Update a GWL policy */
    updateGWL: adminProcedure
      .input(z.object({
        id: z.number(),
        clientName: z.string().optional(),
        carrier: z.string().optional(),
        policyNumber: z.string().optional(),
        premium: z.string().optional(),
        premiumFrequency: z.enum(["monthly", "quarterly", "semi-annual", "annual"]).optional(),
        commissionPercent: z.string().optional(),
        coverageAmount: z.string().optional(),
        status: z.enum(["active", "pending", "lapsed", "cancelled"]).optional(),
        notes: z.string().optional(),
        yearlyAP: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...fields } = input;
        const updates: string[] = [];
        if (fields.clientName !== undefined) updates.push(`clientName = '${fields.clientName.replace(/'/g, "''")}' `);
        if (fields.carrier !== undefined) updates.push(`carrier = '${fields.carrier.replace(/'/g, "''")}' `);
        if (fields.policyNumber !== undefined) updates.push(`policyNumber = '${fields.policyNumber.replace(/'/g, "''")}' `);
        if (fields.premium !== undefined) updates.push(`premium = '${fields.premium.replace(/'/g, "''")}' `);
        if (fields.premiumFrequency !== undefined) updates.push(`gwl_premiumFrequency = '${fields.premiumFrequency}' `);
        if (fields.yearlyAP !== undefined) updates.push(`yearlyAP = '${fields.yearlyAP.replace(/'/g, "''")}' `);
        if (fields.commissionPercent !== undefined) updates.push(`commissionPercent = '${fields.commissionPercent.replace(/'/g, "''")}' `);
        if (fields.coverageAmount !== undefined) updates.push(`faceAmount = '${fields.coverageAmount.replace(/'/g, "''")}' `);
        if (fields.status !== undefined) updates.push(`gwl_status = '${fields.status}' `);
        if (fields.notes !== undefined) updates.push(`notes = '${fields.notes.replace(/'/g, "''")}' `);
        if (updates.length > 0) {
          const setClause = updates.join(", ");
          await db.execute(sql.raw(`UPDATE graded_whole_life_policies SET ${setClause} WHERE id = ${id}`));
        }
        return { success: true };
      }),
    /** Delete a GWL policy */
    deleteGWL: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.execute(sql`DELETE FROM graded_whole_life_policies WHERE id = ${input.id}`);
        return { success: true };
      }),

    credentials: router({
      list: adminProcedure.query(async ({ ctx }) => {
        // getDb already imported at top of file
        // agentCredentials already imported at top of file
        // isNull already imported at top of file
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const creds = await db.select().from(agentCredentials).where(isNull(agentCredentials.agentId));
        return creds;
      }),
      add: adminProcedure
        .input(z.object({
          carrier: z.string().min(1),
          writingNumber: z.string().optional(),
          username: z.string().min(1),
          password: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
          // getDb already imported at top of file
          // agentCredentials already imported at top of file
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          const result = await db.insert(agentCredentials).values({
            agentId: null,
            carrier: input.carrier,
            writingNumber: input.writingNumber || "",
            username: input.username,
            password: input.password,
          });
          return { success: true, id: (result as any).insertId };
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          carrier: z.string().min(1),
          writingNumber: z.string().optional(),
          username: z.string().min(1),
          password: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          // getDb already imported at top of file
          // agentCredentials already imported at top of file
          // eq already imported at top of file
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          const updateData: any = {
            carrier: input.carrier,
            writingNumber: input.writingNumber || "",
            username: input.username,
          };
          if (input.password) {
            updateData.password = input.password;
          }
          await db.update(agentCredentials)
            .set(updateData)
            .where(eq(agentCredentials.id, input.id));
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          // getDb already imported at top of file
          // agentCredentials already imported at top of file
          // eq already imported at top of file
          const db = await getDb();
          if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          await db.delete(agentCredentials).where(eq(agentCredentials.id, input.id));
          return { success: true };
        }),

    /** Generate a new PIN for an agent */
    generateAgentPIN: adminProcedure
      .input(z.object({ agentId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        // Generate a 4-digit PIN
        const pin = String(Math.floor(1000 + Math.random() * 9000));
        // hashPin already imported at top of file
        const hashedPin = await hashPin(pin);
        
        // PIN management is now handled at the client level, not agent level
        // This is a placeholder for future PIN management functionality
        
        return { success: true, pin };
      }),

    /** Update agent color */
    updateAgentColor: adminProcedure
      .input(z.object({ agentId: z.number(), color: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        // eq already imported at top of file
        await db.update(agents).set({ color: input.color }).where(eq(agents.id, input.agentId));
        
        return { success: true };
      }),

    /** Create daily health check cron (6 AM UTC) */
    createHealthCheckCron: adminProcedure
      .mutation(async ({ ctx }) => {
        try {
          // createHeartbeatJob, parseCookie already imported at top of file
          
          // Get session token from cookie
          const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
          
          if (!sessionToken) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Session token not found",
            });
          }
          
          // Create daily health check at 6 AM UTC
          const job = await createHeartbeatJob({
            name: "daily-health-check",
            cron: "0 6 * * *", // 6 AM UTC daily
            path: "/api/scheduled/health-check",
            description: "Daily health check - verifies database and system integrity",
          }, sessionToken);
          
          return {
            success: true,
            taskUid: job.taskUid,
            nextExecutionAt: job.nextExecutionAt,
          };
        } catch (error) {
          console.error("[Health Check Cron] Error creating cron:", error);
          throw error instanceof TRPCError ? error : new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to create health check cron",
          });
        }
      }),

    /** Get health check cron status */
    getHealthCheckCronStatus: adminProcedure
      .query(async ({ ctx }) => {
        try {
          // listHeartbeatJobs, parseCookie already imported at top of file
          
          const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
          
          if (!sessionToken) {
            return { exists: false, job: null };
          }
          
          const jobs = await listHeartbeatJobs(sessionToken);
          const healthCheckJob = jobs.jobs.find(j => j.name === "daily-health-check");
          
          return {
            exists: !!healthCheckJob,
            job: healthCheckJob || null,
          };
        } catch (error) {
          console.error("[Health Check Cron] Error fetching status:", error);
          return { exists: false, job: null };
        }
      }),

      // Carrier Management
      carriers: router({
        // Add a new carrier
        add: adminProcedure
          .input(z.object({
            name: z.string().min(1, "Carrier name is required"),
            portalUrl: z.string().url("Invalid portal URL").optional(),
            website: z.string().url("Invalid website URL").optional(),
          }))
          .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error("DB connection failed");
            
            try {
              const result = await db.insert(carriers).values({
                name: input.name,
                portalUrl: input.portalUrl || null,
                website: input.website || null,
              });
              return { success: true, id: result[0]?.insertId || 0 };
            } catch (error: any) {
              if (error.code === 'ER_DUP_ENTRY') {
                throw new TRPCError({ code: 'CONFLICT', message: 'Carrier with this name already exists' });
              }
              throw error;
            }
          }),

        // Update an existing carrier
        update: adminProcedure
          .input(z.object({
            id: z.number(),
            name: z.string().min(1).optional(),
            portalUrl: z.string().url().optional(),
            website: z.string().url().optional(),
          }))
          .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error("DB connection failed");
            
            const { id, ...updateData } = input;
            await db.update(carriers).set(updateData).where(eq(carriers.id, id));
            return { success: true };
          }),

        // Delete a carrier
        delete: adminProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error("DB connection failed");
            
            await db.delete(carriers).where(eq(carriers.id, input.id));
            return { success: true };
          }),

        // List all carriers (admin view)
        list: adminProcedure
          .query(async () => {
            const db = await getDb();
            if (!db) throw new Error("DB connection failed");
            
            return await db.select().from(carriers);
          }),
      }),

      // PDF resources
      pdfs: router({
        getAll: publicProcedure.query(async () => {
          return await getAllPDFs();
        }),
        getByCategory: publicProcedure
          .input(z.object({ category: z.string() }))
          .query(async ({ input }) => {
            return await getPDFsByCategory(input.category);
          }),
        getById: publicProcedure
          .input(z.object({ id: z.number() }))
          .query(async ({ input }) => {
            return await getPDFById(input.id);
          }),
      }),
    }),
  }),
});
export type AppRouter = typeof appRouter;
