const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const dbName = process.env.DB_NAME || 'vehicle_parking_db';
const useSSL = process.env.DB_SSL === 'true' || (dbHost !== 'localhost' && dbHost !== '127.0.0.1');

let pool = null;

function getPool() {
  if (!pool) {
    const config = {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    };

    if (useSSL) {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = mysql.createPool(config);
  }
  return pool;
}

async function query(sql, params = []) {
  const p = getPool();
  try {
    const [results] = await p.execute(sql, params);
    return results;
  } catch (err) {
    console.error(`[DB Query Error] ${err.message} | SQL: ${sql}`);
    throw err;
  }
}

async function testConnection() {
  try {
    const p = getPool();
    const [rows] = await p.query('SELECT 1 AS connected');
    return rows && rows[0] && rows[0].connected === 1;
  } catch (err) {
    console.error(`[DB Healthcheck Failed]: ${err.message}`);
    return false;
  }
}

module.exports = {
  getPool,
  query,
  testConnection
};
