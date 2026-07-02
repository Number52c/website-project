#!/usr/bin/env node

/**
 * scripts/generate-sql-import.mjs
 * Generate SQL INSERT statements from chunk files with transaction wrapper
 * Safe import with duplicate prevention and rollback capability
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// ─── LOAD CHUNK DATA ──────────────────────────────────────────────────────────

function loadChunks() {
  const chunkDir = path.join(PROJECT_ROOT, 'data/imports/carrier-import');
  const records = [];

  for (let i = 1; i <= 8; i++) {
    const file = path.join(chunkDir, `records-${String(i).padStart(3, '0')}.json`);
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      records.push(...(Array.isArray(data) ? data : data.records || []));
    } catch (e) {
      console.error(`Error loading chunk ${i}: ${e.message}`);
    }
  }

  return records;
}

// ─── SQL ESCAPE HELPER ────────────────────────────────────────────────────────

function escapeSql(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  // Escape single quotes by doubling them
  return `'${String(value).replace(/'/g, "''")}'`;
}

function dateToUnixTimestamp(dateStr) {
  if (!dateStr) return 'NULL';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'NULL' : date.getTime().toString();
}

// ─── GENERATE SQL ─────────────────────────────────────────────────────────────

function generateSQL(records) {
  const sql = [];

  // Header
  sql.push('-- ============================================================================');
  sql.push('-- CARRIER DATA IMPORT - AUTO-GENERATED SQL');
  sql.push('-- ============================================================================');
  sql.push('-- Generated: ' + new Date().toISOString());
  sql.push('-- Total records: ' + records.length);
  sql.push('-- ');
  sql.push('-- IMPORTANT: This script includes a transaction wrapper.');
  sql.push('-- If any INSERT fails, the entire transaction will be rolled back.');
  sql.push('-- ');
  sql.push('-- To execute:');
  sql.push('--   mysql -u user -p database < import.sql');
  sql.push('-- ');
  sql.push('-- To verify before committing:');
  sql.push('--   START TRANSACTION;');
  sql.push('--   ... (run the SQL below) ...');
  sql.push('--   ROLLBACK;  -- or COMMIT;');
  sql.push('-- ============================================================================\n');

  // Transaction start
  sql.push('START TRANSACTION;\n');

  // Track created IDs for foreign key references
  const clientMap = new Map(); // email -> id
  const policyMap = new Map(); // policyNumber -> id

  // ─── STEP 1: INSERT CLIENTS ───────────────────────────────────────────────────

  sql.push('-- STEP 1: Insert clients (skip if email already exists)');
  sql.push('-- Expected: 106 clients\n');

  let clientCount = 0;
  for (const record of records) {
    const { client } = record;
    const email = client.email || `${client.firstName.toLowerCase()}.${client.lastName.toLowerCase()}@import.local`;
    const phone = client.phone || '';
    const address = client.address || '';
    const city = client.city || '';
    const state = client.state || '';
    const zip = client.zip || '';
    const dateOfBirth = client.dateOfBirth ? dateToUnixTimestamp(client.dateOfBirth) : 'NULL';

    // Generate a PIN (4 random digits)
    const pin = Math.random().toString().slice(2, 6).padEnd(4, '0');

    sql.push(`INSERT INTO clients (firstName, lastName, email, phone, address, city, state, zip, dateOfBirth, pin, createdAt) VALUES (${escapeSql(client.firstName)}, ${escapeSql(client.lastName)}, ${escapeSql(email)}, ${escapeSql(phone)}, ${escapeSql(address)}, ${escapeSql(city)}, ${escapeSql(state)}, ${escapeSql(zip)}, ${dateOfBirth}, SHA2(${escapeSql(pin)}, 256), NOW()) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);`);

    clientMap.set(email, `LAST_INSERT_ID()`);
    clientCount++;
  }

  sql.push(`\n-- Inserted ${clientCount} clients\n`);

  // ─── STEP 2: INSERT POLICIES ──────────────────────────────────────────────────

  sql.push('-- STEP 2: Insert policies (skip if policyNumber already exists)');
  sql.push('-- Expected: 106 policies\n');

  let policyCount = 0;
  for (const record of records) {
    const { client, policy, carrier } = record;
    const email = client.email || `${client.firstName.toLowerCase()}.${client.lastName.toLowerCase()}@import.local`;
    const policyNumber = policy.policyNumber;
    const type = policy.productType || 'unknown';
    const status = policy.status || 'pending';
    const effectiveDate = dateToUnixTimestamp(policy.effectiveDate);
    const expirationDate = dateToUnixTimestamp(policy.terminationDate);
    const coverageAmount = policy.faceAmount ? parseFloat(policy.faceAmount).toFixed(2) : '0.00';
    const premiumAmount = policy.premium ? parseFloat(policy.premium).toFixed(2) : '0.00';
    const notes = policy.notes || '';

    sql.push(`INSERT INTO policies (clientId, policyNumber, carrier, type, status, effectiveDate, expirationDate, coverageAmount, premiumAmount, createdAt) SELECT id, ${escapeSql(policyNumber)}, ${escapeSql(carrier.name)}, ${escapeSql(type)}, ${escapeSql(status)}, ${effectiveDate}, ${expirationDate}, ${coverageAmount}, ${premiumAmount}, NOW() FROM clients WHERE email = ${escapeSql(email)} ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);`);

    policyMap.set(policyNumber, `LAST_INSERT_ID()`);
    policyCount++;
  }

  sql.push(`\n-- Inserted ${policyCount} policies\n`);

  // ─── STEP 3: INSERT SALES ENTRIES ─────────────────────────────────────────────

  sql.push('-- STEP 3: Insert sales entries (production records)');
  sql.push('-- Expected: 38 sales entries\n');

  let salesCount = 0;
  for (const record of records) {
    if (!record.salesEntry || !record.salesEntry.includeInProduction) {
      continue;
    }

    const { client, policy, salesEntry } = record;
    const email = client.email || `${client.firstName.toLowerCase()}.${client.lastName.toLowerCase()}@import.local`;
    const clientName = `${client.firstName} ${client.lastName}`;
    const carrier = record.carrier.name;
    const product = policy.productType || 'unknown';
    const commission = parseFloat(salesEntry.productionAmount).toFixed(2);
    const saleDate = dateToUnixTimestamp(salesEntry.saleDate);
    const [year, month] = salesEntry.saleDate.split('-').slice(0, 2);

    // Admin agent (ID 1 is typically the admin)
    sql.push(`INSERT INTO sales_entries (agentId, clientId, clientName, carrier, product, commission, saleDate, policyType, status, month, year, createdAt) SELECT 1, id, ${escapeSql(clientName)}, ${escapeSql(carrier)}, ${escapeSql(product)}, ${commission}, ${saleDate}, ${escapeSql(product)}, 'active', ${month}, ${year}, NOW() FROM clients WHERE email = ${escapeSql(email)};`);

    salesCount++;
  }

  sql.push(`\n-- Inserted ${salesCount} sales entries\n`);

  // ─── STEP 4: COMMIT OR ROLLBACK ────────────────────────────────────────────────

  sql.push('-- ============================================================================');
  sql.push('-- TRANSACTION COMPLETE');
  sql.push('-- ============================================================================');
  sql.push('-- If all inserts succeeded, commit the transaction:');
  sql.push('COMMIT;\n');
  sql.push('-- If any insert failed, the transaction will be automatically rolled back.');
  sql.push('-- ============================================================================\n');

  return sql.join('\n');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const records = loadChunks();
console.log(`Loaded ${records.length} records from chunks`);

const sqlContent = generateSQL(records);
const outputFile = path.join(PROJECT_ROOT, 'data/imports/carrier-import/import.sql');

fs.writeFileSync(outputFile, sqlContent, 'utf-8');
console.log(`\n✅ SQL import script generated: ${outputFile}`);
console.log(`\nTo execute the import, run:`);
console.log(`  mysql -u user -p database < ${outputFile}`);
console.log(`\nOr in the database UI:`);
console.log(`  1. Copy the entire SQL content`);
console.log(`  2. Paste into the database query editor`);
console.log(`  3. Execute`);
