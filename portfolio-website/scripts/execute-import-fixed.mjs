#!/usr/bin/env node
/**
 * Execute Carrier Data Import - Fixed Version
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const url = new URL(DATABASE_URL);

// Parse connection string
const [userPass, hostDb] = DATABASE_URL.split('://')[1].split('@');
const [user, password] = userPass.split(':');
const [host, portDb] = hostDb.split('/');
const [port, database] = portDb.split('/');

const config = {
  host,
  port: parseInt(port) || 3306,
  user,
  password,
  database,
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
};

async function executeImport() {
  let connection;
  try {
    console.log('📂 Reading import-fixed.sql...');
    const importPath = path.resolve('./data/imports/carrier-import/import-fixed.sql');
    const sql = fs.readFileSync(importPath, 'utf-8');
    
    console.log('🔗 Connecting to database...');
    // Add SSL/TLS support for TiDB
    const tlsOptions = {
      rejectUnauthorized: false,
    };
    const pool = mysql.createPool({
      ...config,
      ssl: tlsOptions,
    });
    connection = await pool.getConnection();
    
    console.log('⏳ Executing import (this may take a moment)...');
    const result = await connection.query(sql);
    
    console.log('✅ Import completed successfully!');
    
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
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

executeImport();
