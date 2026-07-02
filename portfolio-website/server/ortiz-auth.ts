/**
 * Ortiz Dashboard PIN Authentication
 * PIN verification is now handled server-side via adminAuth.ts
 * This module is kept for backward compatibility with any remaining references.
 */

import { TRPCError } from "@trpc/server";
import { verifyAdminPin } from "./adminAuth";

const PIN_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

interface PINSession {
  userId: number;
  authenticatedAt: number;
  expiresAt: number;
}

// In-memory PIN sessions (in production, use Redis or database)
const pinSessions = new Map<number, PINSession>();

/**
 * Verify PIN and create session
 */
export function verifyOrtizPin(pin: string, userId: number): boolean {
  if (!verifyAdminPin(pin)) {
    return false;
  }

  // Create session
  const now = Date.now();
  pinSessions.set(userId, {
    userId,
    authenticatedAt: now,
    expiresAt: now + PIN_SESSION_DURATION,
  });

  return true;
}

/**
 * Check if user has valid PIN session
 */
export function hasValidPINSession(userId: number): boolean {
  const session = pinSessions.get(userId);
  if (!session) return false;

  const now = Date.now();
  if (now > session.expiresAt) {
    pinSessions.delete(userId);
    return false;
  }

  return true;
}

/**
 * Invalidate PIN session
 */
export function invalidatePINSession(userId: number): void {
  pinSessions.delete(userId);
}

/**
 * Get session expiration time
 */
export function getPINSessionExpiration(userId: number): number | null {
  const session = pinSessions.get(userId);
  if (!session) return null;
  return session.expiresAt;
}

/**
 * Middleware to protect Ortiz Dashboard procedures
 * Usage: protectedProcedure.use(ortizDashboardMiddleware)
 */
export async function ortizDashboardMiddleware({ ctx, next }: any) {
  // Only allow owner (admin) access
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can access the Ortiz Dashboard",
    });
  }

  // Check if user has valid PIN session
  if (!hasValidPINSession(ctx.user.id)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "PIN authentication required. Please enter your PIN to access the Ortiz Dashboard.",
    });
  }

  return next({ ctx });
}

/**
 * Get remaining session time in milliseconds
 */
export function getRemainingSessionTime(userId: number): number {
  const expiration = getPINSessionExpiration(userId);
  if (!expiration) return 0;

  const remaining = expiration - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Get remaining session time as formatted string
 */
export function getFormattedRemainingTime(userId: number): string {
  const remaining = getRemainingSessionTime(userId);
  if (remaining === 0) return "Expired";

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
