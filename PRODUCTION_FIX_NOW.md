# URGENT: Production Fix - Static Files & 502 Error

## Current Situation
- PM2 is running `next start` (regular mode) instead of standalone server
- Static files exist in `.next/standalone/.next/static/` but Next.js regular mode looks in `.next/static/`
- 502 Bad Gateway error
- Static files returning `text/html` MIME type

## Immediate Fix - Run on Production Server

### Step 1: Rebuild Application (REQUIRED)

```bash
cd /opt/wmp16

# Stop PM2 first
pm2 stop wmp
pm2 delete wmp

# Clean old build
rm -rf .next

# Pull latest code (if using git)
git pull

# Install dependencies (if package.json changed)
npm install

# Rebuild application (this includes standalone setup)
npm run build

# Verify standalone server was created
ls -la .next/standalone/server.js

# Verify static files exist
ls -la .next/standalone/.next/static/css/ | head -5
```

### Step 2: Start with Standalone Server

```bash
# Option A: Use ecosystem.config.js (Recommended)
pm2 start ecosystem.config.js
pm2 save

# Option B: Start directly (if config doesn't work)
pm2 start .next/standalone/server.js --name wmp \
  --cwd /opt/wmp16 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env HOSTNAME=0.0.0.0 \
  --env NEXTAUTH_URL=https://wmp.kwsc.gos.pk \
  --env APP_BASE_DIR=/opt/wmp16 \
  --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
  --max-memory-restart 3G \
  --restart-delay 4000 \
  --max-restarts 10 \
  --min-uptime 10s
pm2 save

# Start with standalone server directly
pm2 start .next/standalone/server.js --name wmp \
  --cwd /opt/wmp16 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env HOSTNAME=0.0.0.0 \
  --env NEXTAUTH_URL=https://wmp.kwsc.gos.pk \
  --env APP_BASE_DIR=/opt/wmp16 \
  --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
  --max-memory-restart 3G \
  --restart-delay 4000 \
  --max-restarts 10 \
  --min-uptime 10s

# Save PM2 config
pm2 save

# Check status
pm2 status
pm2 logs wmp --lines 20
```

### Alternative: Use Regular Next.js Mode (If Standalone Fails)

**Only use this if standalone build fails:**

```bash
cd /opt/wmp16

# Stop PM2
pm2 stop wmp
pm2 delete wmp

# Copy static files to regular location (if needed)
# Static files should already be in .next/static/ from build
ls -la .next/static/

# Update ecosystem.config.js to use next start
# Change script from: '.next/standalone/server.js'
# To: 'next'
# And add: interpreter: 'node', args: 'start -p 3000 -H 0.0.0.0'

# Or start directly:
pm2 start npm --name wmp -- start:next \
  --cwd /opt/wmp16 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env NEXTAUTH_URL=https://wmp.kwsc.gos.pk

pm2 save
pm2 logs wmp --lines 20
```

### Note: Ecosystem Config Already Fixed

The `ecosystem.config.js` has been updated to use:
```javascript
script: 'node',
args: '.next/standalone/server.js',
```

This is already in your codebase after `git pull`. Just rebuild and restart.

Update `ecosystem.config.js` on production server:

```javascript
module.exports = {
  apps: [
    {
      name: 'wmp',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/opt/wmp16',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        NEXTAUTH_URL: 'https://wmp.kwsc.gos.pk',
        APP_BASE_DIR: '/opt/wmp16'
      },
      error_file: '/opt/wmp16/logs/wmp-error.log',
      out_file: '/opt/wmp16/logs/wmp-out.log',
      log_file: '/opt/wmp16/logs/wmp-combined.log',
      time: true,
      max_memory_restart: '3G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

Then:
```bash
pm2 delete wmp
pm2 start ecosystem.config.js
pm2 save
```

## Verify Fix

1. **Check PM2 is running:**
   ```bash
   pm2 status
   # Should show "online" status
   ```

2. **Check server is listening:**
   ```bash
   netstat -tulpn | grep 3000
   # Should show process listening on port 3000
   ```

3. **Test locally:**
   ```bash
   curl http://localhost:3000
   # Should return HTML, not error
   ```

4. **Test static file:**
   ```bash
   curl -I http://localhost:3000/_next/static/css/3ad0c75c87b18546.css
   # Should return: Content-Type: text/css and 200 OK
   ```

5. **Test through nginx:**
   ```bash
   curl -I https://wmp.kwsc.gos.pk/_next/static/css/3ad0c75c87b18546.css
   # Should return: Content-Type: text/css and 200 OK
   ```

## If 502 Persists

### Check Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/wmp-error.log
```

### Check if Backend is Running
```bash
# Check if process is running
ps aux | grep node

# Check if port is accessible
curl http://127.0.0.1:3000

# Check nginx can reach backend
sudo nginx -t
sudo systemctl status nginx
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

## Root Cause

The issue is that:
1. PM2 config points to `.next/standalone/server.js`
2. But PM2 fell back to `next start` when standalone server wasn't found initially
3. Regular Next.js looks for static files in `.next/static/`
4. But files are in `.next/standalone/.next/static/`
5. This mismatch causes 404s which return HTML (text/html MIME type)

## After Fix

Once PM2 is running the standalone server correctly:
- Static files will be served from `.next/standalone/.next/static/`
- Correct MIME types will be returned
- 502 error will be resolved
- Application will work normally
