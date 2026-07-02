import mysql from 'mysql2/promise';

async function checkSchema() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const [rows] = await connection.execute('DESCRIBE carriers');
    console.log('Carriers table columns:', rows);
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
