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
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
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