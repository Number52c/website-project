/**
 * Session Timeout Middleware
 * 
 * Validates session timeouts for tRPC procedures
 */

import { TRPCError } from '@trpc/server';
import { isSessionExpired, SESSION_TIMEOUT_MS, type SessionMetadata } from './session-timeout';
import type { TrpcContext } from './context';

/**
 * Determine user role and ID from context
 */
function getUserInfo(ctx: TrpcContext): { role: 'admin' | 'agent' | 'client'; userId: string } | null {
  if (ctx.user?.role === 'admin') {
    return { role: 'admin', userId: String(ctx.user.id) };
  }
  if (ctx.agent) {
    return { role: 'agent', userId: String(ctx.agent.id) };
  }
  if (ctx.portalClient) {
    return { role: 'client', userId: String(ctx.portalClient.id) };
  }
  return null;
}

/**
 * Validate session timeout for authenticated users
 */
export function validateSessionTimeout(ctx: TrpcContext): void {
  const userInfo = getUserInfo(ctx);
  if (!userInfo || !ctx.sessionLastActivity) {
    return; // No session to validate
  }

  const metadata: SessionMetadata = {
    lastActivity: ctx.sessionLastActivity,
    role: userInfo.role,
    userId: userInfo.userId,
  };

  const expired = isSessionExpired(metadata);
  if (expired) {
    const timeoutMinutes = SESSION_TIMEOUT_MS[userInfo.role] / (60 * 1000);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: `Your session has expired due to ${timeoutMinutes} minutes of inactivity. Please log in again.`,
    });
  }
}

/**
 * Middleware for session timeout validation
 * Use in protected procedures to enforce session timeouts
 */
export function sessionTimeoutMiddleware() {
  return async ({ ctx, next }: { ctx: TrpcContext; next: () => Promise<any> }) => {
    validateSessionTimeout(ctx);
    return next();
  };
}
