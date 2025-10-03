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
  max: 10, // Reduced pool size to prevent connection exhaustion
  min: 2, // Maintain minimum connections
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // 10 seconds connection timeout
  acquireTimeoutMillis: 10000, // 10 seconds acquire timeout
  maxUses: 7500, // Rotate connections to prevent memory leaks
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 0, // Start keep-alive immediately
  statement_timeout: 60000, // 1 minute statement timeout
  query_timeout: 60000, // 1 minute query timeout
  application_name: 'wmp-app-production',
  tcp_keepalives_idle: 600,
  tcp_keepalives_interval: 30,
  tcp_keepalives_count: 3,
  allowExitOnIdle: true, // Allow pool to exit when idle
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

// Log pool statistics periodically with proper cleanup
let poolStatsInterval = null;

const startPoolStatsLogging = () => {
  if (poolStatsInterval) {
    clearInterval(poolStatsInterval);
  }
  
  poolStatsInterval = setInterval(() => {
    console.log('Database pool stats:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      timestamp: new Date().toISOString()
    });
  }, 60000); // Log every minute
};

const stopPoolStatsLogging = () => {
  if (poolStatsInterval) {
    clearInterval(poolStatsInterval);
    poolStatsInterval = null;
  }
};

// Start logging
startPoolStatsLogging();

export const connectToDatabase = async (retries = 10) => {
  // Skip database connection during build phase
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping database connection during build phase');
    throw new Error('Database connection skipped during build phase');
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

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Starting graceful shutdown...');
  stopPoolStatsLogging();
  
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
  
  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('Forcing exit due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});