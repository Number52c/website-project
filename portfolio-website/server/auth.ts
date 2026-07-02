import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";

/**
 * Hash a password using scrypt (built-in Node crypto).
 * Returns a string in format: salt$hash (base64 encoded)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  // Combine salt and hash, encode as base64 for storage
  const combined = Buffer.concat([salt, hash]);
  return combined.toString("base64");
}

/**
 * Verify a password against a stored hash.
 * Supports both scrypt (108 chars) and bcrypt (60 chars) hashes.
 * Returns true if password matches, false otherwise.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    // Detect hash type by length
    // Bcrypt hashes are ~60 characters and start with $2a$, $2b$, or $2y$
    // Scrypt hashes (base64) are 108 characters
    
    if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
      // This is a bcrypt hash
      return bcrypt.compareSync(password, storedHash);
    } else {
      // This is a scrypt hash (base64 encoded)
      const combined = Buffer.from(storedHash, "base64");
      const salt = combined.slice(0, 16);
      const hash = combined.slice(16);
      const testHash = scryptSync(password, salt, 64);
      // Use timingSafeEqual to prevent timing attacks
      return timingSafeEqual(hash, testHash);
    }
  } catch (err) {
    return false;
  }
}
