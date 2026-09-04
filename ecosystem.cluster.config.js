/**
 * PM2 cluster config (3 workers) — use INSTEAD of ecosystem.config.js for load testing.
 *
 * Switch configs (only one at a time — both use port 3000):
 *   pm2 delete wmp
 *   pm2 start ecosystem.cluster.config.js --env production
 *   pm2 save
 *
/**
 * PM2 cluster config (3 workers) — use INSTEAD of ecosystem.config.js for load testing.
 *
 * Switch configs (only one at a time — both use port 3000):
 *   pm2 delete wmp
 *   pm2 start ecosystem.cluster.config.js --env production
 *   pm2 save
 *
 * Back to single fork:
 *   pm2 delete wmp
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'wmp',
      // CLUSTER FIX: point script at server.js directly (script: 'node' breaks in cluster → ELF error)
      script: '.next/standalone/server.js',
      interpreter: 'node',
      cwd: '/opt/wmp16',
      instances: 3,
      exec_mode: 'cluster',
      // CLUSTER FIX: fork mode uses `-r dotenv/config` via node CLI; cluster workers fail with MODULE_NOT_FOUND.
      // PM2 loads .env directly instead (requires PM2 5.1+).
      env_file: '/opt/wmp16/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Keep 0.0.0.0 — nginx proxies to 127.0.0.1:3000; do NOT use DB/public IP here
        HOSTNAME: '0.0.0.0',
        NEXTAUTH_URL: 'https://wmp.kwsc.gos.pk',
        AUTH_TRUST_HOST: 'true',
        ALLOW_HTTP_LOGIN: 'true',
        APP_BASE_DIR: '/opt/wmp16'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXTAUTH_URL: 'https://wmp.kwsc.gos.pk',
        AUTH_TRUST_HOST: 'true',
        ALLOW_HTTP_LOGIN: 'true',
        APP_BASE_DIR: '/opt/wmp16'
      },
      // Separate log files so you can compare fork vs cluster runs
      error_file: './logs/wmp-cluster-error.log',
      out_file: './logs/wmp-cluster-out.log',
      log_file: './logs/wmp-cluster-combined.log',
      time: true,
      max_memory_restart: '4G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};