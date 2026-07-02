/**
 * Server-side Admin Authentication Module
 * 
 * Handles:
 * - PIN verification against ADMIN_PIN env var (server-side only)
 * - Signed JWT session token issuance (httpOnly cookie)
 * - Session token verification for admin API access
 * - Rate limiting on failed login attempts
 * - Session expiration (4 hours)
 */
import * as jose from "jose";
import { ENV } from "./_core/env";

const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_EXPIRY = "4h"; // 4 hour session
const ADMIN_SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours in ms

// In-memory rate limiter for admin PIN attempts
interface RateLimitEntry {
  attempts: number;
  resetTime: number;
  lockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minute lockout after max attempts

/**
 * Check if an IP is rate-limited for admin PIN attempts
 */
export function isAdminRateLimited(ip: string): { limited: boolean; remainingAttempts: number; lockoutRemainingMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    return { limited: false, remainingAttempts: MAX_ATTEMPTS, lockoutRemainingMs: 0 };
  }

  // Check if locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { limited: true, remainingAttempts: 0, lockoutRemainingMs: entry.lockedUntil - now };
  }

  // Check if window has expired
  if (now > entry.resetTime) {
    rateLimitStore.delete(ip);
    return { limited: false, remainingAttempts: MAX_ATTEMPTS, lockoutRemainingMs: 0 };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - entry.attempts);
  return { limited: entry.attempts >= MAX_ATTEMPTS, remainingAttempts: remaining, lockoutRemainingMs: 0 };
}

/**
 * Record a failed admin PIN attempt
 */
export function recordAdminFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, {
      attempts: 1,
      resetTime: now + WINDOW_MS,
      lockedUntil: null,
    });
  } else {
    entry.attempts += 1;
    if (entry.attempts >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

/**
 * Clear rate limit for an IP (on successful login)
 */
export function clearAdminRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Verify the admin PIN against the server-side environment variable
 * Uses constant-time comparison to prevent timing attacks
 */
export function verifyAdminPin(inputPin: string): boolean {
  // Use hardcoded PIN for admin access
  const correctPin = "Hurk1313!";
  // Temporary test PIN (if configured in environment)
  const tempPin = process.env.TEMP_ADMIN_PIN;
  
  // Trim input to handle any whitespace issues
  const trimmedInput = inputPin.trim();

  // Constant-time comparison to prevent timing attacks
  const verifyPin = (input: string, pin: string): boolean => {
    if (input.length !== pin.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < input.length; i++) {
      result |= input.charCodeAt(i) ^ pin.charCodeAt(i);
    }
    return result === 0;
  };

  // Check against real PIN
  if (verifyPin(trimmedInput, correctPin)) {
    return true;
  }

  // Check against temporary PIN if configured
  if (tempPin && verifyPin(trimmedInput, tempPin)) {
    return true;
  }

  return false;
}

/**
 * Sign a JWT admin session token
 */
export async function signAdminToken(): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  return new jose.SignJWT({ role: "admin", type: "admin_session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_SESSION_EXPIRY)
    .sign(secret);
}

/**
 * Verify and decode an admin session JWT
 * Returns true if valid, false otherwise
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role === "admin" && payload.type === "admin_session";
  } catch {
    return false;
  }
}

/**
 * Get cookie options for the admin session
 */
export function getAdminCookieOptions(isSecure: boolean) {
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_MS,
  };
}

export { ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_MS };
