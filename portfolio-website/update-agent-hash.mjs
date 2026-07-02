import 'dotenv/config';
import mysql from 'mysql2/promise';
import { URL } from 'url';

const dbUrl = new URL(process.env.DATABASE_URL);
const pool = mysql.createPool({
  connectionLimit: 1,
  host: dbUrl.hostname,
  port: dbUrl.port || 4000,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});

const freshHash = 'SktVozziQN8GnbksFK93iD3wy3buPULkYFLCMSBIDimqWUcIeVQJIIvAXHW92sD+MBLBYPTkJJe2O8I5G1Vq9aY53DmiG5PWnXm3DHuOCNY=';

try {
  const conn = await pool.getConnection();
  
  const [result] = await conn.execute(
    'UPDATE agents SET passwordHash = ? WHERE email = ?',
    [freshHash, 'texascovered13@gmail.com']
  );
  
  console.log('✅ Updated agent password hash');
  console.log('Rows affected:', result.affectedRows);
  
  // Verify
  const [rows] = await conn.execute(
    'SELECT email, LENGTH(passwordHash) as hashLength, SUBSTRING(passwordHash, 1, 30) as hashPrefix FROM agents WHERE email = ?',
    ['texascovered13@gmail.com']
  );
  
  if (rows.length > 0) {
    console.log('✅ Verification:');
    console.log('  Email:', rows[0].email);
    console.log('  Hash length:', rows[0].hashLength);
    console.log('  Hash prefix:', rows[0].hashPrefix);
  }
  
  conn.release();
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await pool.end();
}
