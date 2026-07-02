import { AuditAction as AuditActionType, logAuditEvent } from "./audit-logger";

export const AuditAction = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  ADMIN_ACTION: "ADMIN_ACTION",
  DOCUMENT_ACCESS: "DOCUMENT_ACCESS",
  DOCUMENT_DOWNLOAD: "DOCUMENT_DOWNLOAD",
  PAYMENT_METHOD_ACCESS: "PAYMENT_METHOD_ACCESS",
  PAYMENT_HISTORY_ACCESS: "PAYMENT_HISTORY_ACCESS",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  DATA_EXPORT: "DATA_EXPORT",
  POLICY_ACCESS: "POLICY_ACCESS",
  CLIENT_ACCESS: "CLIENT_ACCESS",
  PROCEDURE_CALL: "PROCEDURE_CALL",
} as const;

export type AuditAction = AuditActionType;

export function logSecurityEvent(action: AuditAction, metadata?: Record<string, any>) {
  const { status, ...restMetadata } = metadata || {};
  logAuditEvent({
    action,
    status: status || "success", // Default to success, allow override
    ...restMetadata,
  });
}
