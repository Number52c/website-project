/**
 * Audit Logger Utility
 * 
 * Centralized audit logging for sensitive operations.
 * Logs important events without exposing sensitive data.
 */

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'ADMIN_ACTION'
  | 'DOCUMENT_ACCESS'
  | 'DOCUMENT_DOWNLOAD'
  | 'PAYMENT_METHOD_ACCESS'
  | 'PAYMENT_HISTORY_ACCESS'
  | 'PERMISSION_DENIED'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED_ACCESS'
  | 'DATA_EXPORT'
  | 'POLICY_ACCESS'
  | 'CLIENT_ACCESS'
  | 'PROCEDURE_CALL';

export interface AuditLogEntry {
  timestamp: number;
  action: AuditAction;
  userId?: string;
  userRole?: 'admin' | 'agent' | 'user';
  resourceType?: string;
  resourceId?: string;
  status: 'success' | 'failure';
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory audit log (will be replaced with persistent storage in production)
const auditLogs: AuditLogEntry[] = [];

/**
 * Log an audit event
 */
export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const auditEntry: AuditLogEntry = {
    ...entry,
    timestamp: Date.now(),
  };

  auditLogs.push(auditEntry);

  // Keep only last 1000 entries in memory
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(auditEntry));
  }
}

/**
 * Log successful login
 */
export function logLoginSuccess(
  userId: string,
  userRole: 'admin' | 'agent' | 'user',
  ipAddress?: string
): void {
  logAuditEvent({
    action: 'LOGIN_SUCCESS',
    userId,
    userRole,
    status: 'success',
    ipAddress,
  });
}

/**
 * Log failed login
 */
export function logLoginFailed(
  userId: string,
  reason: string,
  ipAddress?: string
): void {
  logAuditEvent({
    action: 'LOGIN_FAILED',
    userId,
    status: 'failure',
    details: reason,
    ipAddress,
  });
}

/**
 * Log logout
 */
export function logLogout(userId: string, userRole: 'admin' | 'agent' | 'user'): void {
  logAuditEvent({
    action: 'LOGOUT',
    userId,
    userRole,
    status: 'success',
  });
}

/**
 * Log document access
 */
export function logDocumentAccess(
  userId: string,
  documentId: string,
  action: 'VIEW' | 'DOWNLOAD'
): void {
  logAuditEvent({
    action: action === 'DOWNLOAD' ? 'DOCUMENT_DOWNLOAD' : 'DOCUMENT_ACCESS',
    userId,
    resourceType: 'document',
    resourceId: documentId,
    status: 'success',
  });
}

/**
 * Log payment data access
 */
export function logPaymentDataAccess(
  userId: string,
  accessType: 'METHODS' | 'HISTORY'
): void {
  logAuditEvent({
    action: accessType === 'METHODS' ? 'PAYMENT_METHOD_ACCESS' : 'PAYMENT_HISTORY_ACCESS',
    userId,
    resourceType: 'payment_data',
    status: 'success',
  });
}

/**
 * Log permission denied
 */
export function logPermissionDenied(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string
): void {
  logAuditEvent({
    action: 'PERMISSION_DENIED',
    userId,
    resourceType,
    resourceId,
    status: 'failure',
    details: action,
  });
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(
  userId: string | undefined,
  action: string,
  resourceType: string,
  ipAddress?: string
): void {
  logAuditEvent({
    action: 'UNAUTHORIZED_ACCESS',
    userId,
    resourceType,
    status: 'failure',
    details: action,
    ipAddress,
  });
}

/**
 * Log session expiration
 */
export function logSessionExpired(userId: string, userRole: 'admin' | 'agent' | 'user'): void {
  logAuditEvent({
    action: 'SESSION_EXPIRED',
    userId,
    userRole,
    status: 'success',
  });
}

/**
 * Get audit logs (for admin viewing)
 */
export function getAuditLogs(limit: number = 100): AuditLogEntry[] {
  return auditLogs.slice(-limit);
}

/**
 * Get audit logs by user
 */
export function getAuditLogsByUser(userId: string, limit: number = 100): AuditLogEntry[] {
  return auditLogs
    .filter((log) => log.userId === userId)
    .slice(-limit);
}

/**
 * Get audit logs by action
 */
export function getAuditLogsByAction(action: AuditAction, limit: number = 100): AuditLogEntry[] {
  return auditLogs
    .filter((log) => log.action === action)
    .slice(-limit);
}

/**
 * Clear audit logs (use with caution)
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0;
}
