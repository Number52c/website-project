/**
 * Session activity tracker — DB-backed so sessions survive server restarts.
 * Agents stay logged in across deploys and server restarts.
 * Sessions expire after 8 hours of inactivity.
 */

import { getDb } from "./db";
import { agentSessions } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

// 8 hours idle timeout — long enough for a full workday
const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

/**
 * Record activity for an agent session.
 * Creates the session row if it doesn't exist, updates lastActivityAt otherwise.
 * Fire-and-forget: never throws, so it won't break request handling.
 */
export function recordSessionActivity(agentId: number): void {
  const now = Date.now();
  getDb().then((db) => {
    if (!db) return;
    db.select({ id: agentSessions.id })
      .from(agentSessions)
      .where(eq(agentSessions.agentId, agentId))
      .limit(1)
      .then((rows) => {
        if (rows.length > 0) {
          return db.update(agentSessions)
            .set({ lastActivityAt: now })
            .where(eq(agentSessions.agentId, agentId));
        } else {
          return db.insert(agentSessions).values({
            agentId,
            lastActivityAt: now,
            createdAt: now,
          });
        }
      })
      .catch(() => {});
  }).catch(() => {});
}

/**
 * Check if a session is still valid (not idle for more than IDLE_TIMEOUT_MS).
 * Returns true if active, false if timed out.
 * Fails open (returns true) if DB is unavailable so agents aren't locked out.
 */
export async function isSessionValid(agentId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return true; // Fail open — don't lock out agents if DB is down

    const rows = await db.select({ lastActivityAt: agentSessions.lastActivityAt })
      .from(agentSessions)
      .where(eq(agentSessions.agentId, agentId))
      .limit(1);

    if (rows.length === 0) {
      // No session row — fresh login or server restarted. Create it and allow.
      const now = Date.now();
      await db.insert(agentSessions).values({
        agentId,
        lastActivityAt: now,
        createdAt: now,
      }).catch(() => {});
      return true;
    }

    const timeSinceLastActivity = Date.now() - rows[0].lastActivityAt;
    return timeSinceLastActivity < IDLE_TIMEOUT_MS;
  } catch {
    return true; // Fail open
  }
}

/**
 * Check if a session exists in the DB.
 */
export async function hasSession(agentId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const rows = await db.select({ id: agentSessions.id })
      .from(agentSessions)
      .where(eq(agentSessions.agentId, agentId))
      .limit(1);
    return rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Clear a session (called on logout).
 */
export function clearSession(agentId: number): void {
  getDb().then((db) => {
    if (!db) return;
    db.delete(agentSessions).where(eq(agentSessions.agentId, agentId)).catch(() => {});
  }).catch(() => {});
}

/**
 * Get remaining time until session expires (in milliseconds).
 */
export async function getSessionTimeRemaining(agentId: number): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return IDLE_TIMEOUT_MS;
    const rows = await db.select({ lastActivityAt: agentSessions.lastActivityAt })
      .from(agentSessions)
      .where(eq(agentSessions.agentId, agentId))
      .limit(1);
    if (rows.length === 0) return IDLE_TIMEOUT_MS;
    const timeSinceLastActivity = Date.now() - rows[0].lastActivityAt;
    return Math.max(0, IDLE_TIMEOUT_MS - timeSinceLastActivity);
  } catch {
    return IDLE_TIMEOUT_MS;
  }
}

/**
 * Start periodic cleanup of expired sessions from the DB.
 * Call once on server startup.
 */
export function startSessionCleanup(): void {
  setInterval(async () => {
    try {
      const db = await getDb();
      if (!db) return;
      const cutoff = Date.now() - IDLE_TIMEOUT_MS;
      await db.delete(agentSessions)
        .where(sql`${agentSessions.lastActivityAt} < ${cutoff}`)
        .catch(() => {});
    } catch {
      // Ignore cleanup errors
    }
  }, 60 * 60 * 1000); // Run every hour
}
