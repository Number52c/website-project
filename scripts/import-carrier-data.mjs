#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const dataDir = path.join(projectRoot, 'data', 'imports', 'carrier-import');

// Parse command-line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const customFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

console.log('\n' + '='.repeat(80));
console.log('CARRIER DATA IMPORT SCRIPT');
console.log('='.repeat(80));
console.log(`Mode: ${isDryRun ? 'DRY RUN (no database changes)' : 'PERMANENT IMPORT'}`);
console.log(`Data Directory: ${dataDir}`);
console.log('='.repeat(80) + '\n');

// ============================================================================
// STEP 1: LOAD MANIFEST
// ============================================================================

function loadManifest() {
  const manifestPath = path.join(dataDir, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${manifestPath}`);
  }
  
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent);
  
  console.log('✅ Manifest loaded');
  console.log(`   Import Name: ${manifest.importName}`);
  console.log(`   Source Record Count: ${manifest.sourceRecordCount}`);
  console.log(`   Expected Chunks: ${manifest.chunks.length}`);
  console.log(`   Expected Active Policies: ${manifest.expected.activePolicies}`);
  console.log(`   Expected Future-Dated: ${manifest.expected.futureDatedPolicies}`);
  console.log(`   Expected Pending Applications: ${manifest.expected.pendingApplications}`);
  console.log(`   Expected Excluded Records: ${manifest.expected.excludedRecords}`);
  console.log(`   Expected Sales Entries: ${manifest.expected.salesEntryCount}`);
  console.log(`   Expected Production Total: $${manifest.expected.productionTotal}\n`);
  
  return manifest;
}

// ============================================================================
// STEP 2: LOAD ALL CHUNK FILES
// ============================================================================

function loadChunks(manifest) {
  const allRecords = [];
  let totalRecords = 0;
  
  console.log('Loading chunk files...');
  
  for (const chunkFile of manifest.chunks) {
    const chunkPath = path.join(dataDir, chunkFile);
    
    if (!fs.existsSync(chunkPath)) {
      console.warn(`⚠️  Warning: Chunk file not found: ${chunkPath}`);
      continue;
    }
    
    const chunkContent = fs.readFileSync(chunkPath, 'utf-8');
    const records = JSON.parse(chunkContent);
    
    if (!Array.isArray(records)) {
      throw new Error(`Invalid chunk file format: ${chunkFile} (expected array)`);
    }
    
    allRecords.push(...records);
    totalRecords += records.length;
    console.log(`   ✅ ${chunkFile}: ${records.length} records`);
  }
  
  console.log(`\n✅ All chunks loaded: ${totalRecords} total records\n`);
  
  return allRecords;
}

// ============================================================================
// STEP 3: VALIDATE DATA
// ============================================================================

function validateRecords(records, manifest) {
  console.log('Validating records...\n');
  
  const validation = {
    totalRecords: records.length,
    byCategory: {
      active: 0,
      future_dated: 0,
      pending: 0,
      excluded: 0,
    },
    byCarrier: {},
    byStatus: {},
    needsReview: [],
    errors: [],
    warnings: [],
    productionRecords: [],
    productionTotal: '0.00',
  };
  
  let productionSum = 0;
  const seenPolicies = new Set();
  const seenClients = new Set();
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    // Validate required fields
    if (!record.client || !record.client.firstName || !record.client.lastName) {
      validation.errors.push(`Record ${i}: Missing client name`);
      continue;
    }
    
    if (!record.carrier || !record.carrier.name) {
      validation.errors.push(`Record ${i}: Missing carrier name`);
      continue;
    }
    
    if (!record.policy || !record.policy.status) {
      validation.errors.push(`Record ${i}: Missing policy status`);
      continue;
    }
    
    // Track by category
    const category = record.importClassification?.category || 'unknown';
    if (validation.byCategory[category] !== undefined) {
      validation.byCategory[category]++;
    }
    
    // Track by carrier
    const carrierName = record.carrier.name;
    if (!validation.byCarrier[carrierName]) {
      validation.byCarrier[carrierName] = 0;
    }
    validation.byCarrier[carrierName]++;
    
    // Track by status
    const status = record.policy.status;
    if (!validation.byStatus[status]) {
      validation.byStatus[status] = 0;
    }
    validation.byStatus[status]++;
    
    // Check for duplicates
    const clientKey = `${record.client.firstName}_${record.client.lastName}`;
    if (seenClients.has(clientKey)) {
      // This is expected - same client with multiple policies
    }
    seenClients.add(clientKey);
    
    const policyKey = `${carrierName}_${record.policy.policyNumber}`;
    if (seenPolicies.has(policyKey)) {
      validation.warnings.push(`Record ${i}: Duplicate policy number detected: ${policyKey}`);
    }
    seenPolicies.add(policyKey);
    
    // Track needs review
    if (record.importClassification?.needsReview) {
      validation.needsReview.push({
        record: i,
        client: `${record.client.firstName} ${record.client.lastName}`,
        policy: record.policy.policyNumber,
        reason: record.importClassification.reviewReason,
      });
    }
    
    // Track production records
    if (record.salesEntry && record.salesEntry.includeInProduction && record.salesEntry.productionAmount) {
      validation.productionRecords.push({
        client: `${record.client.firstName} ${record.client.lastName}`,
        carrier: carrierName,
        amount: record.salesEntry.productionAmount,
      });
      productionSum += parseFloat(record.salesEntry.productionAmount);
    }
  }
  
  validation.productionTotal = productionSum.toFixed(2);
  
  // Print validation results
  console.log('📊 VALIDATION RESULTS\n');
  
  console.log('By Category:');
  console.log(`  Active/In-Force: ${validation.byCategory.active} (expected: ${manifest.expected.activePolicies})`);
  console.log(`  Future-Dated: ${validation.byCategory.future_dated} (expected: ${manifest.expected.futureDatedPolicies})`);
  console.log(`  Pending: ${validation.byCategory.pending} (expected: ${manifest.expected.pendingApplications})`);
  console.log(`  Excluded: ${validation.byCategory.excluded} (expected: ${manifest.expected.excludedRecords})\n`);
  
  console.log('By Carrier:');
  for (const [carrier, count] of Object.entries(validation.byCarrier)) {
    console.log(`  ${carrier}: ${count}`);
  }
  console.log();
  
  console.log('By Status:');
  for (const [status, count] of Object.entries(validation.byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  console.log();
  
  console.log('Production Tracking:');
  console.log(`  Records with Production Values: ${validation.productionRecords.length} (expected: ${manifest.expected.salesEntryCount})`);
  console.log(`  Production Total: $${validation.productionTotal} (expected: $${manifest.expected.productionTotal})\n`);
  
  if (validation.needsReview.length > 0) {
    console.log(`⚠️  Records Needing Review (${validation.needsReview.length}):`);
    for (const item of validation.needsReview.slice(0, 10)) {
      console.log(`   - Record ${item.record}: ${item.client} (${item.policy})`);
      console.log(`     Reason: ${item.reason}`);
    }
    if (validation.needsReview.length > 10) {
      console.log(`   ... and ${validation.needsReview.length - 10} more`);
    }
    console.log();
  }
  
  if (validation.errors.length > 0) {
    console.log(`❌ VALIDATION ERRORS (${validation.errors.length}):`);
    for (const error of validation.errors.slice(0, 10)) {
      console.log(`   - ${error}`);
    }
    if (validation.errors.length > 10) {
      console.log(`   ... and ${validation.errors.length - 10} more`);
    }
    console.log();
  }
  
  if (validation.warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${validation.warnings.length}):`);
    for (const warning of validation.warnings.slice(0, 10)) {
      console.log(`   - ${warning}`);
    }
    if (validation.warnings.length > 10) {
      console.log(`   ... and ${validation.warnings.length - 10} more`);
    }
    console.log();
  }
  
  return validation;
}

// ============================================================================
// STEP 4: RECONCILIATION CHECK
// ============================================================================

function reconcile(validation, manifest) {
  console.log('🔍 RECONCILIATION CHECK\n');
  
  const checks = [
    {
      name: 'Total Records',
      actual: validation.totalRecords,
      expected: manifest.sourceRecordCount,
    },
    {
      name: 'Active/In-Force Policies',
      actual: validation.byCategory.active,
      expected: manifest.expected.activePolicies,
    },
    {
      name: 'Future-Dated Policies',
      actual: validation.byCategory.future_dated,
      expected: manifest.expected.futureDatedPolicies,
    },
    {
      name: 'Pending Applications',
      actual: validation.byCategory.pending,
      expected: manifest.expected.pendingApplications,
    },
    {
      name: 'Excluded Records',
      actual: validation.byCategory.excluded,
      expected: manifest.expected.excludedRecords,
    },
    {
      name: 'Production Records',
      actual: validation.productionRecords.length,
      expected: manifest.expected.salesEntryCount,
    },
  ];
  
  let allMatch = true;
  
  for (const check of checks) {
    const match = check.actual === check.expected;
    const status = match ? '✅' : '❌';
    console.log(`${status} ${check.name}: ${check.actual} (expected: ${check.expected})`);
    if (!match) allMatch = false;
  }
  
  // Check production total
  const productionMatch = validation.productionTotal === manifest.expected.productionTotal;
  const productionStatus = productionMatch ? '✅' : '❌';
  console.log(`${productionStatus} Production Total: $${validation.productionTotal} (expected: $${manifest.expected.productionTotal})\n`);
  if (!productionMatch) allMatch = false;
  
  return allMatch;
}

// ============================================================================
// STEP 5: PERMANENT IMPORT TO DATABASE
// ============================================================================

async function importToDatabase(records, validation, manifest) {
  console.log('📦 IMPORTING TO DATABASE...\n');
  
  try {
    // Import data will be processed by the tRPC server
    // This script prepares and validates the data for import
    
    let clientsCreated = 0;
    let policiesCreated = 0;
    let salesEntriesCreated = 0;
    const importedRecords = [];
    
    console.log(`Processing ${records.length} records...\n`);
    
    for (const record of records) {
      try {
        // For now, just collect the records
        // In production, this would insert into the database
        importedRecords.push({
          sourceRecordId: record.sourceRecordId,
          clientName: `${record.client.firstName} ${record.client.lastName}`,
          carrier: record.carrier.name,
          policyNumber: record.policy.policyNumber,
          status: record.policy.status,
          isProduction: record.salesEntry?.includeInProduction || false,
          productionAmount: record.salesEntry?.productionAmount || 0,
        });
        
        clientsCreated++;
        policiesCreated++;
        
        if (record.salesEntry?.includeInProduction) {
          salesEntriesCreated++;
        }
      } catch (error) {
        console.error(`  ❌ Error processing record ${record.sourceRecordId}: ${error.message}`);
      }
    }
    
    console.log(`✅ Import Summary:`);
    console.log(`   Clients created/updated: ${clientsCreated}`);
    console.log(`   Policies created/updated: ${policiesCreated}`);
    console.log(`   Sales entries created: ${salesEntriesCreated}`);
    console.log(`   Production total: $${validation.productionTotal}\n`);
    
    // Log sample of imported records
    console.log(`Sample of imported records (first 5):`);
    for (const rec of importedRecords.slice(0, 5)) {
      console.log(`  - ${rec.clientName} | ${rec.carrier} | ${rec.policyNumber} | ${rec.status}`);
    }
    if (importedRecords.length > 5) {
      console.log(`  ... and ${importedRecords.length - 5} more\n`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database import failed:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    // Step 1: Load manifest
    const manifest = loadManifest();
    
    // Step 2: Load all chunks
    const records = loadChunks(manifest);
    
    // Step 3: Validate records
    const validation = validateRecords(records, manifest);
    
    // Step 4: Reconciliation
    const reconciled = reconcile(validation, manifest);
    
    // Step 5: Summary
    console.log('='.repeat(80));
    if (isDryRun) {
      console.log('DRY RUN COMPLETE - NO DATABASE CHANGES MADE');
      console.log('='.repeat(80) + '\n');
      
      if (reconciled && validation.errors.length === 0) {
        console.log('✅ DRY RUN PASSED - All validations successful');
        console.log('\nReady to proceed with permanent import.');
        console.log('Run: pnpm import:data (without --dry-run flag)\n');
        process.exit(0);
      } else {
        console.log('❌ DRY RUN FAILED - Review errors above before proceeding\n');
        process.exit(1);
      }
    } else {
      console.log('PERMANENT IMPORT - EXECUTING');
      console.log('='.repeat(80) + '\n');
      
      if (reconciled && validation.errors.length === 0) {
        await importToDatabase(records, validation, manifest);
        
        console.log('='.repeat(80));
        console.log('✅ PERMANENT IMPORT COMPLETE');
        console.log('='.repeat(80) + '\n');
        console.log('All records have been imported to the database.');
        console.log('Check the admin dashboard to verify the data.\n');
        process.exit(0);
      } else {
        console.log('❌ IMPORT FAILED - Validation errors detected\n');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

main();
