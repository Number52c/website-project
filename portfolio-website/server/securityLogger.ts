/**
 * Security Logger
 * Logs all attempted test data creation and security violations
 */

import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), ".manus-logs", "security.log");

export interface SecurityLogEntry {
  timestamp: string;
  type: "test_data_attempt" | "unauthorized_access" | "security_violation";
  dataType: "client" | "policy" | "expense" | "agent" | "sales_entry";
  details: string;
  value?: string;
  userId?: number;
}

export function logSecurityEvent(entry: Omit<SecurityLogEntry, "timestamp">) {
  const logEntry: SecurityLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  try {
    // Ensure log directory exists
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Append to log file
    const logLine = JSON.stringify(logEntry) + "\n";
    fs.appendFileSync(LOG_FILE, logLine, "utf-8");

    // Also log to console for immediate visibility
    console.error(`[SECURITY] ${entry.type}: ${entry.details}`);
  } catch (err) {
    console.error("[SECURITY_LOGGER] Failed to write security log:", err);
  }
}

export function getRecentSecurityEvents(hours: number = 24): SecurityLogEntry[] {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }

    const content = fs.readFileSync(LOG_FILE, "utf-8");
    const lines = content.trim().split("\n").filter((line) => line.length > 0);

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return lines
      .map((line) => {
        try {
          return JSON.parse(line) as SecurityLogEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is SecurityLogEntry => {
        return entry !== null && new Date(entry.timestamp) > cutoffTime;
      });
  } catch (err) {
    console.error("[SECURITY_LOGGER] Failed to read security log:", err);
    return [];
  }
}
