const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'vehicle_parking_db';
  const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  console.log(`[Migration] Connecting to MySQL server at ${host}:${port}...`);

  // First connect without specifying database to ensure database exists
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl,
      multipleStatements: true
    });
  } catch (err) {
    console.error(`[Migration Error] Unable to connect to MySQL host: ${err.message}`);
    process.exit(1);
  }

  try {
    console.log(`[Migration] Ensuring database '${database}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.changeUser({ database });

    console.log(`[Migration] Reading migration file 001_consolidated_schema.sql...`);
    const sqlPath = path.join(__dirname, '..', 'migrations', '001_consolidated_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`[Migration] Executing schema statements...`);
    await connection.query(sql);

    // Verify tables exist
    const [rows] = await connection.query('SHOW TABLES');
    const tableNames = rows.map(r => Object.values(r)[0]);
    console.log(`[Migration] Tables verified successfully:`, tableNames);

    console.log(`[Migration] Database migration completed successfully!`);
  } catch (err) {
    console.error(`[Migration Error] Failed to execute migration: ${err.message}`);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
