/**
 * Permission Checks Utility
 * 
 * Centralized permission checking for all sensitive operations.
 * Ensures consistent authorization across all tRPC procedures.
 */

import { TRPCError } from '@trpc/server';
import type { User } from '../../drizzle/schema';

/**
 * Check if user is admin
 */
export function requireAdmin(user: User | null): asserts user is User {
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  if (user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
}

/**
 * Check if user is agent
 */
export function requireAgent(user: User | null): asserts user is User {
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  if (user.role !== 'agent') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Agent access required',
    });
  }
}

/**
 * Check if user is client
 */
export function requireClient(user: User | null): asserts user is User {
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  if (user.role !== 'user') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Client access required',
    });
  }
}

/**
 * Check if user owns the resource (by ID)
 */
export function requireOwnership(userId: string, resourceOwnerId: string): void {
  if (userId !== resourceOwnerId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: resource does not belong to you',
    });
  }
}

/**
 * Check if agent owns the client
 */
export function requireAgentOwnsClient(
  agentId: string,
  clientAgentId: string | null
): void {
  if (clientAgentId !== agentId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: client does not belong to your agency',
    });
  }
}

/**
 * Check if agent owns the policy
 */
export function requireAgentOwnsPolicy(
  agentId: string,
  policyAgentId: string | null
): void {
  if (policyAgentId !== agentId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: policy does not belong to your agency',
    });
  }
}

/**
 * Check if client owns the document
 */
export function requireClientOwnsDocument(
  clientId: string,
  documentClientId: string
): void {
  if (clientId !== documentClientId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: document does not belong to you',
    });
  }
}

/**
 * Check if client owns the payment method
 */
export function requireClientOwnsPaymentMethod(
  clientId: string,
  paymentMethodClientId: string
): void {
  if (clientId !== paymentMethodClientId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: payment method does not belong to you',
    });
  }
}

/**
 * Check if client owns the payment history
 */
export function requireClientOwnsPaymentHistory(
  clientId: string,
  paymentHistoryClientId: string
): void {
  if (clientId !== paymentHistoryClientId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: payment history does not belong to you',
    });
  }
}

/**
 * Verify resource exists
 */
export function requireResourceExists<T>(
  resource: T | null | undefined,
  resourceName: string
): asserts resource is T {
  if (!resource) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${resourceName} not found`,
    });
  }
}
