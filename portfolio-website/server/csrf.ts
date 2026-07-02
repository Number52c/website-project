import { randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

/**
 * Generate a CSRF token for a session.
 * Returns a signed JWT that expires in 1 hour.
 */
export async function generateCsrfToken(): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const token = randomBytes(32).toString("hex");

  return new SignJWT({ token })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

/**
 * Verify a CSRF token.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyCsrfToken(csrfToken: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    await jwtVerify(csrfToken, secret);
    return true;
  } catch {
    return false;
  }
}
