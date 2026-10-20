const mysql = require('mysql2/promise');
require('dotenv').config();

function getDbConfig() {
  const connString = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (connString) {
    try {
      const parsed = new URL(connString);
      const isRemote = parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1';
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '3306', 10),
        user: decodeURIComponent(parsed.username || 'root'),
        password: decodeURIComponent(parsed.password || ''),
        database: (parsed.pathname || '').replace(/^\//, '') || 'vehicle_parking_db',
        ssl: (process.env.DB_SSL === 'true' || isRemote) ? { rejectUnauthorized: false } : undefined
      };
    } catch (e) {
      console.warn(`[DB Config Warning] Failed to parse DATABASE_URL: ${e.message}`);
    }
  }

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
  const dbName = process.env.DB_NAME || 'vehicle_parking_db';
  const useSSL = process.env.DB_SSL === 'true' || (dbHost !== 'localhost' && dbHost !== '127.0.0.1');

  return {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined
  };
}

let pool = null;

function getPool() {
  if (!pool) {
    const dbConfig = getDbConfig();
    const config = {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    };

    if (dbConfig.ssl) {
      config.ssl = dbConfig.ssl;
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
