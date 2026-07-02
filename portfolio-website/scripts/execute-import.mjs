#!/usr/bin/env node
/**
 * Execute Carrier Data Import - Policies and Sales Entries
 * Reads the complete import.sql and executes it against the database
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ca = require('fs').readFileSync('/etc/ssl/certs/ca-certificates.crt', 'utf-8');
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

// Parse DATABASE_URL (mysql://user:pass@host:port/database)
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  ssl: { ca },
};

async function executeImport() {
  let connection;
  try {
    console.log('📂 Reading import.sql...');
    const importPath = path.resolve('./data/imports/carrier-import/import.sql');
    const sql = fs.readFileSync(importPath, 'utf-8');
    
    console.log('🔗 Connecting to database...');
    const pool = mysql.createPool(config);
    connection = await pool.getConnection();
    
    console.log('⏳ Executing import (this may take a moment)...');
    const result = await connection.query(sql);
    
    console.log('✅ Import completed successfully!');
    console.log(`📊 Rows affected: ${result.affectedRows || 'N/A'}`);
    
    // Verify import
    console.log('\n📋 Verifying import...');
    const [clients] = await connection.query(
      'SELECT COUNT(*) as count FROM clients WHERE email LIKE "%.local"'
    );
    const [policies] = await connection.query(
      'SELECT COUNT(*) as count FROM policies WHERE carrier IN ("American Equity", "Americo", "Corebridge", "Athene", "ELCO Life", "ELCO Annuity")'
    );
    const [sales] = await connection.query(
      'SELECT COUNT(*) as count, SUM(CAST(commission as DECIMAL(12,2))) as total FROM sales_entries WHERE agentId = 1'
    );
    
    console.log(`✅ Clients: ${clients[0]?.count || 0}`);
    console.log(`✅ Policies: ${policies[0]?.count || 0}`);
    console.log(`✅ Sales entries: ${sales[0]?.count || 0}`);
    console.log(`✅ Production total: $${sales[0]?.total || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

executeImport();
