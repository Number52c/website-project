import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import * as jose from "jose";
import { ENV } from "./env";
import { User } from "../../drizzle/schema";
import { Client } from "../../drizzle/schema";
import { Agent } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { parse as parseCookieHeader } from "cookie";
import { getTenantByDomain, getDefaultTenant, TenantConfig } from "./tenants";
import { recordSessionActivity, isSessionValid, hasSession, startSessionCleanup } from "../sessionActivity";
import { getClientById, getAgentById } from "../db";
import { isSessionExpired } from "./session-timeout";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "../adminAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  portalClient: Client | null;
  agent: Agent | null;
  tenant: TenantConfig;
  sessionLastActivity?: number;
};

const PORTAL_COOKIE = "portal_session";
const AGENT_COOKIE = "agent_session";
const SESSION_ACTIVITY_HEADER = "x-session-activity";

/** Create a signed JWT for the portal session */
export async function signPortalToken(clientId: number): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  return new jose.SignJWT({ clientId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("4h")
    .sign(secret);
}

/** Verify and decode a portal session JWT */
async function verifyPortalToken(token: string): Promise<number | null> {
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    return typeof payload.clientId === "number" ? payload.clientId : null;
  } catch {
    return null;
  }
}

/** Create a signed JWT for the agent session */
export async function signAgentToken(agentId: number): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  return new jose.SignJWT({ agentId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

/** Verify and decode an agent session JWT */
async function verifyAgentToken(token: string): Promise<number | null> {
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    return typeof payload.agentId === "number" ? payload.agentId : null;
  } catch {
    return null;
  }
}

/** Parse a specific cookie from the raw Cookie header */
function getCookieFromHeader(req: CreateExpressContextOptions["req"], name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const parsed = parseCookieHeader(cookieHeader);
  return parsed[name] || undefined;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const sessionLastActivity = Date.now();
  let user: User | null = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  // Verify admin session via signed JWT cookie (replaces insecure x-pin-verified header)
  const adminCookie = getCookieFromHeader(opts.req, ADMIN_COOKIE_NAME);
  if (adminCookie) {
    const isValidAdmin = await verifyAdminToken(adminCookie);
    if (isValidAdmin) {
      if (!user) {
        // Create admin user context from valid admin session token
        user = {
          id: 0,
          openId: "pin-admin",
          name: "Admin",
          email: "admin@ortiz.local",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User;
      } else {
        // Elevate existing user to admin role
        user.role = "admin";
      }
    }
  }

  // Parse portal client session from signed JWT cookie
  let portalClient: Client | null = null;
  const portalCookie = getCookieFromHeader(opts.req, PORTAL_COOKIE);
  if (portalCookie) {
    try {
      const clientId = await verifyPortalToken(portalCookie);
      if (clientId) {
        // getClientById already imported at top of file
        const client = await getClientById(clientId);
        if (client) {
          portalClient = client;
        }
      }
    } catch {
      portalClient = null;
    }
  }

  // Parse agent session from signed JWT cookie
  let agent: Agent | null = null;
  const agentCookie = getCookieFromHeader(opts.req, AGENT_COOKIE);
  if (agentCookie) {
    try {
      const agentId = await verifyAgentToken(agentCookie);
      if (agentId) {
        // getAgentById already imported at top of file
        const agentData = await getAgentById(agentId);
        if (agentData && agentData.agentStatus === "active") {
          // Check session validity in DB — works across server restarts
          const valid = await isSessionValid(agentId);
          if (valid) {
            // Update last activity timestamp
            recordSessionActivity(agentId);
            agent = agentData;
          }
        }
      }
    } catch {
      agent = null;
    }
  }

  // Extract tenant from request domain
  const host = opts.req.headers.host || "localhost";
  const tenant = getTenantByDomain(host) || getDefaultTenant();

  return {
    req: opts.req,
    res: opts.res,
    user,
    portalClient,
    agent,
    tenant,
    sessionLastActivity,
  };
}

// Initialize session cleanup on module load
startSessionCleanup();
