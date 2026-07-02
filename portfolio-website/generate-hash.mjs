#!/usr/bin/env node

import { scryptSync, randomBytes } from 'crypto';

const password = 'TempPass123!';
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

// Combine salt and hash, encode as base64 (matching the hashPassword function in auth.ts)
const combined = Buffer.concat([salt, hash]);
const fullHash = combined.toString('base64');

console.log('\n✅ Password Hash Generated\n');
console.log('Password:', password);
console.log('Hash (base64):', fullHash);
console.log('\nUse this hash in the SQL UPDATE command below:\n');
console.log(`UPDATE agents SET "passwordHash" = '${fullHash}', "passwordChangedAt" = NULL WHERE id = 360001;\n`);
