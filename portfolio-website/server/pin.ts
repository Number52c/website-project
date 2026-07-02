import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 10;

/**
 * Hash a PIN using bcrypt.
 * Returns a bcrypt hash string (~60 characters).
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

/**
 * Verify a PIN against a stored bcrypt hash.
 * Returns true if PIN matches, false otherwise.
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(pin, hash);
  } catch (err) {
    console.error("[PIN] Verification error:", err);
    return false;
  }
}
