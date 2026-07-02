#!/usr/bin/env node
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

// Parse connection string
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 1,
};

async function executeImport() {
  let connection;
  try {
    console.log('📂 Reading import-fixed.sql...');
    const importPath = path.resolve('./data/imports/carrier-import/import-fixed.sql');
    const sql = fs.readFileSync(importPath, 'utf-8');
    
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('⏳ Executing import...');
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim());
    let count = 0;
    
    for (const stmt of statements) {
      if (!stmt.trim()) continue;
      try {
        await connection.query(stmt);
        count++;
        if (count % 20 === 0) {
          console.log(`  ✓ Executed ${count} statements...`);
        }
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          console.error(`  ❌ Error on statement ${count}:`, err.message);
        }
      }
    }
    
    console.log(`✅ Executed ${count} statements`);
    
    // Verify
    console.log('\n📋 Verifying...');
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
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executeImport();
