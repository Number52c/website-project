/**
 * Rate Limiter Utility
 * 
 * In-memory rate limiting for sensitive endpoints.
 * For production, integrate with Redis or similar distributed cache.
 */

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
}

export const RATE_LIMIT_CONFIGS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  adminPin: { maxAttempts: 3, windowMs: 30 * 60 * 1000 }, // 3 attempts per 30 minutes
  apiEndpoint: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  sensitiveOperation: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 operations per minute
};

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

// In-memory rate limit store (keyed by identifier)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request is rate limited
 */
export function isRateLimited(
  identifier: string,
  config: RateLimitConfig
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or window has expired
  if (!entry || now > entry.resetTime) {
    return false;
  }

  // Check if max attempts exceeded
  return entry.attempts >= config.maxAttempts;
}

/**
 * Record an attempt
 */
export function recordAttempt(
  identifier: string,
  config: RateLimitConfig
): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      attempts: 1,
      resetTime: now + config.windowMs,
    });
  } else {
    // Existing window
    entry.attempts += 1;
  }
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(
  identifier: string,
  config: RateLimitConfig
): number {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    return config.maxAttempts;
  }

  return Math.max(0, config.maxAttempts - entry.attempts);
}

/**
 * Get reset time in milliseconds
 */
export function getResetTime(identifier: string): number | null {
  const entry = rateLimitStore.get(identifier);
  if (!entry) return null;
  return Math.max(0, entry.resetTime - Date.now());
}

/**
 * Reset rate limit for identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clear all rate limits (use with caution)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
  return rateLimitStore.get(identifier) || null;
}

/**
 * Cleanup expired entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
