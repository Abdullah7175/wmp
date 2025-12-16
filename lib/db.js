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
  min: 0, // Don't create connections on startup - create them on demand
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 30000, // Increased to 30 seconds for better reliability
  acquireTimeoutMillis: 30000, // Increased to 30 seconds
  maxUses: 7500, // Rotate connections to prevent memory leaks
  keepAlive: true, // Enable TCP keep-alive
  keepAliveInitialDelayMillis: 0, // Start keep-alive immediately
  statement_timeout: 120000, // 2 minutes statement timeout
  query_timeout: 120000, // 2 minutes query timeout
  application_name: 'wmp-app-production',
  tcp_keepalives_idle: 600,
  tcp_keepalives_interval: 30,
  tcp_keepalives_count: 3,
  allowExitOnIdle: false, // Keep connections alive for better performance
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
  // Don't start logging during build phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       (typeof process.env.NEXT_RUNTIME === 'undefined' && process.env.NODE_ENV === 'production');
  
  if (isBuildPhase) {
    return; // Skip logging during build
  }
  
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
  // Check for build phase using multiple methods for better detection
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       (typeof process.env.NEXT_RUNTIME === 'undefined' && process.env.NODE_ENV === 'production');
  
  if (isBuildPhase) {
    // Return null instead of throwing to allow graceful handling
    return null;
  }

  for (let i = 0; i < retries; i++) {
    try {
      // Check if pool is already ended
      if (pool.ended) {
        console.error('Database pool has been ended, cannot connect');
        throw new Error('Database pool has been ended');
      }

      const client = await Promise.race([
        pool.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        )
      ]);

      // Test the connection with a simple query
      await client.query('SELECT 1');
      
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
      
      // If connection was terminated, try to reset the pool
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.message === 'Connection timeout') {
        console.log('Connection error detected, pool stats:', {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount
        });
      }
      
      if (i === retries - 1) {
        console.error('All database connection attempts failed');
        console.error('Possible solutions:');
        console.error('1. Check if database server is running');
        console.error('2. Verify firewall settings');
        console.error('3. Use SSH tunnel: ssh -L 5432:localhost:5432 root@119.30.113.18');
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
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       (typeof process.env.NEXT_RUNTIME === 'undefined' && process.env.NODE_ENV === 'production');
  
  if (isBuildPhase) {
    // Return empty result set during build phase (don't log to reduce noise)
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
  // Skip health check during build phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       (typeof process.env.NEXT_RUNTIME === 'undefined' && process.env.NODE_ENV === 'production');
  
  if (isBuildPhase) {
    return false; // Return false but don't log error
  }
  
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

// Periodic health check to keep connections alive (every 5 minutes)
let healthCheckInterval = null;

const startHealthCheck = () => {
  // Don't start health check during build phase
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                       process.env.NEXT_PHASE === 'phase-export' ||
                       (typeof process.env.NEXT_RUNTIME === 'undefined' && process.env.NODE_ENV === 'production');
  
  if (isBuildPhase) {
    return; // Skip health check during build
  }
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  healthCheckInterval = setInterval(async () => {
    try {
      const isHealthy = await checkDbConnection();
      if (!isHealthy) {
        console.warn('Database health check failed, but continuing...');
      } else {
        console.log('Database health check passed');
      }
    } catch (error) {
      // Handle null/undefined error gracefully
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Health check error:', errorMessage);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

const stopHealthCheck = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
};

// Start health check
startHealthCheck();

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Starting graceful shutdown...');
  stopPoolStatsLogging();
  stopHealthCheck();
  
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
  // Don't exit on database connection errors - let the app continue
  // The pool will retry connections on next request
  if (reason && typeof reason === 'object' && (
    reason.code === 'ECONNREFUSED' || 
    reason.code === 'ECONNRESET' || 
    reason.code === 'ENOTFOUND' ||
    reason.message?.includes('connection') ||
    reason.message?.includes('database')
  )) {
    console.error('Database connection error in unhandled rejection - continuing...');
    return; // Don't shutdown for DB connection errors
  }
  // For other unhandled rejections, log but don't exit in production
  // Next.js should handle most of these
  if (process.env.NODE_ENV === 'production') {
    console.error('Unhandled rejection in production - logging only');
    return;
  }
  gracefulShutdown();
});