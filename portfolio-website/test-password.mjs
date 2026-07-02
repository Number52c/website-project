import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  const combined = Buffer.concat([salt, hash]);
  return combined.toString("base64");
}

function verifyPassword(password, storedHash) {
  try {
    const combined = Buffer.from(storedHash, "base64");
    const salt = combined.slice(0, 16);
    const hash = combined.slice(16);
    const testHash = scryptSync(password, salt, 64);
    return timingSafeEqual(hash, testHash);
  } catch (err) {
    console.error("Verification error:", err.message);
    return false;
  }
}

// Test with the actual temporary password
const testPassword = "5micv7fysm";
console.log(`\n=== Testing password: "${testPassword}" ===\n`);

// Hash it
const hashedPassword = hashPassword(testPassword);
console.log(`Hashed password (base64): ${hashedPassword}`);
console.log(`Hash length: ${hashedPassword.length}`);

// Verify it immediately
const isValid = verifyPassword(testPassword, hashedPassword);
console.log(`\nImmediate verification: ${isValid}`);

// Try with wrong password
const isWrong = verifyPassword("wrongpassword", hashedPassword);
console.log(`Wrong password verification: ${isWrong}`);

// Try with extra spaces
const isWithSpaces = verifyPassword("5micv7fysm ", hashedPassword);
console.log(`Password with trailing space: ${isWithSpaces}`);

console.log("\n=== Test complete ===\n");
