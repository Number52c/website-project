// Diagnostic script to check agent password hash in database
import { config } from "dotenv";
config();

import { createConnection } from "mysql2/promise";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

const db = await createConnection(process.env.DATABASE_URL);

// 1. Check what's in the database
const [rows] = await db.execute(
  "SELECT id, email, LEFT(passwordHash, 20) as hash_prefix, LENGTH(passwordHash) as hash_length, passwordChangedAt FROM agents WHERE email = ?",
  ["texascovered13@gmail.com"]
);

console.log("=== DB Record ===");
console.log(rows[0] || "NOT FOUND");

if (rows[0]) {
  const agent = rows[0];
  console.log("\n=== Hash Analysis ===");
  console.log("Hash length:", agent.hash_length);
  console.log("Hash prefix:", agent.hash_prefix);
  
  // Get full hash
  const [fullRows] = await db.execute(
    "SELECT passwordHash FROM agents WHERE email = ?",
    ["texascovered13@gmail.com"]
  );
  const fullHash = fullRows[0].passwordHash;
  console.log("Full hash:", fullHash);
  
  // Try to verify the temp password
  const tempPassword = "5micv7fysm";
  
  console.log("\n=== Verification Test ===");
  try {
    if (fullHash.startsWith("$2a$") || fullHash.startsWith("$2b$") || fullHash.startsWith("$2y$")) {
      console.log("Hash type: bcrypt");
      const bcrypt = await import("bcrypt");
      const result = bcrypt.default.compareSync(tempPassword, fullHash);
      console.log("Bcrypt verify result:", result);
    } else {
      console.log("Hash type: scrypt (base64)");
      const combined = Buffer.from(fullHash, "base64");
      console.log("Decoded buffer length:", combined.length);
      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);
      console.log("Salt length:", salt.length);
      console.log("Stored hash length:", storedHash.length);
      const testHash = scryptSync(tempPassword, salt, 64);
      const result = timingSafeEqual(storedHash, testHash);
      console.log("Scrypt verify result:", result);
    }
  } catch (err) {
    console.log("Verification error:", err.message);
  }
}

await db.end();
