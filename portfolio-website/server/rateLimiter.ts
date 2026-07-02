/**
 * In-memory rate limiter for portal login attempts.
 * Tracks failed login attempts per IP address and implements exponential backoff.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minute lockout after max attempts
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Clean up old entries every hour

/**
 * Check if an IP is rate limited.
 * Returns { allowed: boolean, remainingAttempts: number, lockedUntil?: number }
 */
export function checkRateLimit(ipAddress: string, maxAttempts: number = MAX_ATTEMPTS, windowMs: number = WINDOW_MS): {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(ipAddress);

  // No entry = first attempt
  if (!entry) {
    return { allowed: true, remainingAttempts: maxAttempts };
  }

  // Check if currently locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil,
    };
  }

  // Reset if outside the time window
  if (now - entry.firstAttemptTime > windowMs) {
    rateLimitStore.delete(ipAddress);
    return { allowed: true, remainingAttempts: maxAttempts };
  }

  // Within window: check attempt count
  const remaining = maxAttempts - entry.attempts;
  if (remaining > 0) {
    return { allowed: true, remainingAttempts: remaining };
  }

  // Max attempts reached: lock out
  return {
    allowed: false,
    remainingAttempts: 0,
    lockedUntil: now + LOCKOUT_MS,
  };
}

/**
 * Record a failed login attempt for an IP address.
 */
export function recordFailedAttempt(ipAddress: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(ipAddress);

  if (!entry) {
    rateLimitStore.set(ipAddress, {
      attempts: 1,
      firstAttemptTime: now,
    });
  } else {
    entry.attempts++;
    if (entry.attempts >= MAX_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

/**
 * Clear rate limit for an IP (called on successful login).
 */
export function clearRateLimit(ipAddress: string): void {
  rateLimitStore.delete(ipAddress);
}

/**
 * Start periodic cleanup of old entries (call once on server startup).
 */
export function startRateLimitCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    rateLimitStore.forEach((entry, ip) => {
      // Remove entries that are outside the window and not locked
      if (now - entry.firstAttemptTime > WINDOW_MS && (!entry.lockedUntil || now > entry.lockedUntil)) {
        entriesToDelete.push(ip);
      }
    });
    
    entriesToDelete.forEach(ip => rateLimitStore.delete(ip));
  }, CLEANUP_INTERVAL_MS);
}
