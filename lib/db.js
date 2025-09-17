// import { Pool } from 'pg';
// import { NextResponse } from 'next/server';

// require('dotenv').config();

// let pool;

// const createPool = () => {
//     if (!pool) {
//         pool = new Pool({
//             user: process.env.PG_USER,
//             host: process.env.PG_HOST,
//             database: process.env.PG_DATABASE,
//             password: process.env.PG_PASSWORD,
//             port: process.env.PG_PORT || 5432,
//             max: process.env.PG_MAX_CONNECTIONS || 10,
//             idleTimeoutMillis: 30000,
//             connectionTimeoutMillis: 2000,
//         });
//     }
//     return pool;
// };



// export const connectToDatabase = async () => {
//     const pool = createPool();
//     const client = await pool.connect();
//     return client;
// };

// export async function disconnectFromDatabase(client) {
//     await client.release();
// }


import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'root',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'warehouse',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 300000, // Close idle clients after 5 minutes (increased from 1 minute)
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established (increased from 2 seconds)
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 0, // Start keep-alive immediately
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error and try to reconnect
  if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    console.log('Database connection lost, will retry on next request');
  }
});

export const connectToDatabase = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      return client;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

export async function disconnectFromDatabase(client) {
  if (client && client.release) {
    await client.release();
  }
}

// Improved query function with better error handling
export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) { // Only log slow queries
      console.log('Slow query executed', { text: text.substring(0, 100), duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Query error:', { 
      error: err.message, 
      code: err.code, 
      query: text.substring(0, 100),
      parameters: params 
    });
    throw err;
  } finally {
    client.release();
  }
};

// Health check function
export const checkDbConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Pool has ended');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Pool has ended');
    process.exit(0);
  });
});