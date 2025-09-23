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
  max: 20, // Increased pool size for better concurrency
  min: 2, // Keep minimum connections alive
  idleTimeoutMillis: 600000, // Close idle clients after 10 minutes
  connectionTimeoutMillis: 30000, // 30 seconds for initial connection
  acquireTimeoutMillis: 30000, // 30 seconds to acquire connection
  maxUses: 10000, // Close (and replace) a connection after it has been used 10000 times
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 0, // Start keep-alive immediately
  statement_timeout: 300000, // Increased statement timeout to 5 minutes for large uploads
  query_timeout: 300000, // Increased query timeout to 5 minutes for large uploads
  // Additional options for remote connections
  application_name: 'wmp-app',
  tcp_keepalives_idle: 600,
  tcp_keepalives_interval: 30,
  tcp_keepalives_count: 3,
  // Connection retry settings
  retryDelayMs: 1000,
  retryAttempts: 3,
});

// Handle pool errors with better logging
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', {
    error: err.message,
    code: err.code,
    client: client ? 'with client' : 'no client',
    timestamp: new Date().toISOString()
  });
  // Don't exit the process, just log the error and try to reconnect
  if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    console.log('Database connection lost, will retry on next request');
  }
});

// Add connection monitoring
pool.on('connect', (client) => {
  console.log('New client connected to database pool');
});

pool.on('remove', (client) => {
  console.log('Client removed from database pool');
});

// Log pool statistics periodically - only during runtime
if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE !== 'phase-production-build') {
  setInterval(() => {
    console.log('Database pool stats:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      timestamp: new Date().toISOString()
    });
  }, 60000); // Log every minute
}

export const connectToDatabase = async (retries = 10) => {
  // Skip database connection during build phase
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping database connection during build phase');
    return null; // Return null instead of throwing error
  }

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Database connection attempt ${i + 1}/${retries}`);
      const client = await pool.connect();
      console.log('Database connection successful');
      return client;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, {
        error: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        attempt: i + 1,
        maxRetries: retries,
        timestamp: new Date().toISOString()
      });
      
      if (i === retries - 1) {
        console.error('All database connection attempts failed');
        console.error('Possible solutions:');
        console.error('1. Check if database server is running');
        console.error('2. Verify firewall settings');
        console.error('3. Use SSH tunnel: ssh -L 5432:localhost:5432 user@202.61.47.29');
        console.error('4. Check database credentials');
        throw error;
      }
      
      // Wait before retrying (exponential backoff with jitter)
      const delay = Math.min(Math.pow(2, i) * 1000 + Math.random() * 1000, 10000);
      console.log(`Waiting ${Math.round(delay)}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
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
  // Skip database queries during build phase
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping database query during build phase');
    return { rows: [], rowCount: 0 };
  }

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

// Graceful shutdown - only during runtime, not build
if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE !== 'phase-production-build') {
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
}