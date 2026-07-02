import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";

// Scrypt functions
function hashPasswordScrypt(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  const combined = Buffer.concat([salt, hash]);
  return combined.toString("base64");
}

// Combined verification function (the fix)
function verifyPassword(password, storedHash) {
  try {
    if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
      // This is a bcrypt hash
      return bcrypt.compareSync(password, storedHash);
    } else {
      // This is a scrypt hash (base64 encoded)
      const combined = Buffer.from(storedHash, "base64");
      const salt = combined.slice(0, 16);
      const hash = combined.slice(16);
      const testHash = scryptSync(password, salt, 64);
      return timingSafeEqual(hash, testHash);
    }
  } catch (err) {
    console.error("Verification error:", err.message);
    return false;
  }
}

console.log("\n=== Testing Scrypt Password ===\n");
const scryptPassword = "5micv7fysm";
const scryptHash = hashPasswordScrypt(scryptPassword);
console.log(`Scrypt Hash (base64): ${scryptHash}`);
console.log(`Hash length: ${scryptHash.length}`);
const scryptValid = verifyPassword(scryptPassword, scryptHash);
console.log(`Scrypt verification: ${scryptValid}`);

console.log("\n=== Testing Bcrypt Password ===\n");
const bcryptPassword = "testpassword123";
const bcryptHash = bcrypt.hashSync(bcryptPassword, 10);
console.log(`Bcrypt Hash: ${bcryptHash}`);
console.log(`Hash length: ${bcryptHash.length}`);
const bcryptValid = verifyPassword(bcryptPassword, bcryptHash);
console.log(`Bcrypt verification: ${bcryptValid}`);

console.log("\n=== Testing Wrong Passwords ===\n");
const wrongScrypt = verifyPassword("wrongpassword", scryptHash);
console.log(`Wrong password (scrypt): ${wrongScrypt}`);
const wrongBcrypt = verifyPassword("wrongpassword", bcryptHash);
console.log(`Wrong password (bcrypt): ${wrongBcrypt}`);

console.log("\n=== Test Complete ===\n");
