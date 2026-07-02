/**
 * One-time script to reset the password hash for a specific agent.
 * Run with: node reset-agent-password.mjs
 */
import { scryptSync, randomBytes } from 'crypto';
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const EMAIL = 'texascovered13@gmail.com';
const TEMP_PASSWORD = '5micv7fysm';

// Generate fresh scrypt hash using EXACT same format as hashPassword() in auth.ts
// hashPassword() does: Buffer.concat([salt, hash]).toString('base64')
const saltBuf = randomBytes(16);
const hashBuf = scryptSync(TEMP_PASSWORD, saltBuf, 64);
const combined = Buffer.concat([saltBuf, hashBuf]);
const passwordHash = combined.toString('base64');

console.log(`Resetting password for: ${EMAIL}`);
console.log(`New hash length: ${passwordHash.length}`);

const conn = await createConnection(DATABASE_URL);

try {
  // First check what columns exist
  const [cols] = await conn.execute('SHOW COLUMNS FROM agents');
  const colNames = cols.map(c => c.Field);
  console.log('Columns in agents table:', colNames);

  // Find the password hash column
  const pwCol = colNames.find(c => c.toLowerCase().includes('password'));
  console.log('Password column:', pwCol);

  if (!pwCol) {
    console.error('ERROR: No password column found!');
    process.exit(1);
  }

  const [result] = await conn.execute(
    `UPDATE agents SET \`${pwCol}\` = ? WHERE email = ?`,
    [passwordHash, EMAIL]
  );
  console.log(`Rows affected: ${result.affectedRows}`);
  if (result.affectedRows === 0) {
    console.log('WARNING: No rows updated — agent not found with that email');
    const [agentRows] = await conn.execute('SELECT id, email FROM agents LIMIT 10');
    console.log('Existing agents:', agentRows);
  } else {
    console.log(`SUCCESS: Password hash reset for ${EMAIL}`);
    console.log(`Temp password is: ${TEMP_PASSWORD}`);
  }
} finally {
  await conn.end();
}
