/**
 * Session Timeout Middleware
 * 
 * Implements 30-minute inactivity timeout for admin and agent sessions.
 * Client sessions have longer timeout (60 minutes).
 */

export const SESSION_TIMEOUT_MS = {
  admin: 30 * 60 * 1000, // 30 minutes
  agent: 30 * 60 * 1000, // 30 minutes
  client: 60 * 60 * 1000, // 60 minutes
};

export interface SessionMetadata {
  lastActivity: number;
  role: 'admin' | 'agent' | 'client';
  userId: string;
}

/**
 * Check if session has expired based on inactivity
 */
export function isSessionExpired(metadata: SessionMetadata): boolean {
  const timeoutMs = SESSION_TIMEOUT_MS[metadata.role];
  const now = Date.now();
  const elapsed = now - metadata.lastActivity;
  return elapsed > timeoutMs;
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(metadata: SessionMetadata): SessionMetadata {
  return {
    ...metadata,
    lastActivity: Date.now(),
  };
}

/**
 * Format timeout duration for user message
 */
export function formatTimeoutDuration(role: 'admin' | 'agent' | 'client'): string {
  const minutes = SESSION_TIMEOUT_MS[role] / (60 * 1000);
  return `${minutes} minutes`;
}

/**
 * Get remaining session time in milliseconds
 */
export function getRemainingSessionTime(metadata: SessionMetadata): number {
  const timeoutMs = SESSION_TIMEOUT_MS[metadata.role];
  const now = Date.now();
  const elapsed = now - metadata.lastActivity;
  const remaining = Math.max(0, timeoutMs - elapsed);
  return remaining;
}

/**
 * Get remaining session time as formatted string
 */
export function formatRemainingSessionTime(metadata: SessionMetadata): string {
  const remaining = getRemainingSessionTime(metadata);
  const minutes = Math.floor(remaining / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
