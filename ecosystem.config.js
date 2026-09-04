module.exports = {
  apps: [
    {
      name: 'wmp',
      script: 'node',
      args: '-r dotenv/config .next/standalone/server.js',
      cwd: '/opt/wmp16',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://wmp.kwsc.gos.pk',
        AUTH_TRUST_HOST: 'true',
        ALLOW_HTTP_LOGIN: 'true',
        WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'http://erp.bizintel.co:8005/api/send-json',
        WHATSAPP_SECRET_KEY: process.env.WHATSAPP_SECRET_KEY || '',
        APP_BASE_DIR: process.env.APP_BASE_DIR || '/opt/wmp16'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://wmp.kwsc.gos.pk',
        AUTH_TRUST_HOST: 'true',
        ALLOW_HTTP_LOGIN: 'true',
        WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'http://erp.bizintel.co:8005/api/send-json',
        WHATSAPP_SECRET_KEY: process.env.WHATSAPP_SECRET_KEY || '',
        APP_BASE_DIR: process.env.APP_BASE_DIR || '/opt/wmp16'
      },
      error_file: './logs/wmp-error.log',
      out_file: './logs/wmp-out.log',
      log_file: './logs/wmp-combined.log',
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
