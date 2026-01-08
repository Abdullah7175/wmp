# Production Standalone Server Fix

## Problem
- `npm run dev` works fine
- After `npm run build`, `npm start` and PM2 with ecosystem.config.js don't work
- PM2 can't find the standalone server module

## Root Cause
1. PM2's `cwd` was using relative path (`'./'`) which doesn't resolve correctly
2. The standalone server needs dotenv to load environment variables
3. PM2 needs to run from the project root directory

## Solution

### Step 1: Update ecosystem.config.js on Production

The file has been updated in the codebase. On production server:

```bash
cd /opt/wmp16
git pull
# OR manually edit ecosystem.config.js
```

The config now uses:
```javascript
script: 'node',
args: '-r dotenv/config .next/standalone/server.js',
cwd: '/opt/wmp16',
```

### Step 2: Verify Standalone Build

```bash
cd /opt/wmp16

# Check standalone server exists
ls -la .next/standalone/server.js

# Check dotenv is copied to standalone
ls -la .next/standalone/node_modules/dotenv/

# Check .env file is in standalone
ls -la .next/standalone/.env
```

### Step 3: Test npm start Manually First

```bash
cd /opt/wmp16

# Stop PM2
pm2 stop wmp
pm2 delete wmp

# Test npm start manually (should work)
npm start

# If it works, press Ctrl+C to stop
# If it doesn't work, check:
# 1. .env file exists in .next/standalone/
# 2. dotenv module exists in .next/standalone/node_modules/
```

### Step 4: Start with PM2

```bash
cd /opt/wmp16

# Start with updated ecosystem config
pm2 start ecosystem.config.js

# Save
pm2 save

# Check logs
pm2 logs wmp --lines 30

# Should see standalone server starting, NOT "Next.js 16.0.10" messages
```

### Step 5: Verify It's Working

```bash
# Check PM2 status
pm2 status

# Check if listening on port 3000
netstat -tulpn | grep 3000

# Test locally (install curl if needed: sudo yum install curl -y)
curl http://localhost:3000

# Test static file
curl -I http://localhost:3000/_next/static/css/3ad0c75c87b18546.css
# Should return: Content-Type: text/css
```

## Alternative: If Standalone Still Fails

If standalone mode continues to have issues, you can use regular Next.js mode:

### Option 1: Use Regular Next.js Start

Update `ecosystem.config.js`:
```javascript
script: 'npm',
args: 'run start:next',
cwd: '/opt/wmp16',
```

But first, ensure static files are in the regular location:
```bash
# Copy static files to regular location
cp -r .next/standalone/.next/static .next/static
```

### Option 2: Use Next.js Directly

Update `ecosystem.config.js`:
```javascript
script: 'next',
args: 'start -p 3000 -H 0.0.0.0',
cwd: '/opt/wmp16',
```

## Troubleshooting

### If "Cannot find module" error:

1. **Check standalone build:**
   ```bash
   ls -la .next/standalone/
   ```

2. **Rebuild if needed:**
   ```bash
   rm -rf .next
   npm run build
   ```

3. **Check dotenv:**
   ```bash
   ls -la .next/standalone/node_modules/dotenv/
   ```

### If "Connection refused" from nginx:

1. **Check if server is listening:**
   ```bash
   netstat -tulpn | grep 3000
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs wmp --lines 50
   ```

3. **Check if process is running:**
   ```bash
   pm2 status
   ps aux | grep node
   ```

## Expected Behavior

After fix:
- PM2 runs: `node -r dotenv/config .next/standalone/server.js`
- Server starts from `/opt/wmp16/.next/standalone/`
- Static files served from `.next/standalone/.next/static/`
- Environment variables loaded from `.next/standalone/.env`
- Server listens on `0.0.0.0:3000`
- Nginx can connect successfully
