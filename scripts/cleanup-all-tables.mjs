#!/usr/bin/env node

import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
};

const tables = [
  'paymentHistory',
  'paymentMethods',
  'client_documents',
  'policyAgents',
  'beneficiaries',
  'sales_entries',
  'policies',
  'clients',
];

async function cleanup() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    for (const table of tables) {
      try {
        const result = await connection.execute(`DELETE FROM ${table};`);
        console.log(`✅ Deleted from ${table}: ${result[0].affectedRows} rows`);
      } catch (err) {
        console.error(`❌ Error deleting from ${table}:`, err.message);
      }
    }

    // Verify cleanup
    console.log('\n📊 Verification:');
    const verifyTables = ['clients', 'policies', 'sales_entries'];
    for (const table of verifyTables) {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table};`);
      console.log(`${table}: ${rows[0].count} rows`);
    }

    console.log('\n✅ Cleanup complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

cleanup();
