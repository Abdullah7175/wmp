# Fix: Production Static Files MIME Type Issue

## Problem
Static files (CSS, JS) on production (`https://wmp.kwsc.gos.pk`) are returning `text/html` instead of correct MIME types.

## Root Cause
In standalone mode, static files need to be copied to `.next/standalone/.next/static`. If the build is incomplete or the standalone setup didn't run correctly, static files won't be served properly.

## Solution - Production Server

### Step 1: SSH into Production Server
```bash
ssh user@wmp.kwsc.gos.pk
# Navigate to your app directory
cd /opt/wmp16  # or wherever your app is located
```

### Step 2: Stop the Application
```bash
pm2 stop wmp
# OR
pm2 restart wmp --update-env
```

### Step 3: Clean Build
```bash
# Remove old build
rm -rf .next

# Optional: Clear node_modules cache
npm cache clean --force
```

### Step 4: Rebuild Application
```bash
# Install dependencies (if needed)
npm install

# Build with standalone setup
npm run build

# This runs: next build --webpack && node scripts/setup-standalone.js
```

### Step 5: Verify Static Files
```bash
# Check if static files exist in standalone
ls -la .next/standalone/.next/static/

# Should see:
# - chunks/
# - css/
# - media/
# - runtime/
```

### Step 6: Restart Application
```bash
pm2 restart wmp
# OR
pm2 start ecosystem.config.js
```

### Step 7: Check PM2 Logs
```bash
pm2 logs wmp --lines 50
```

Look for any errors related to static file serving.

## Alternative: Use Deploy Script

If you have the `deploy.sh` script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script:
1. Stops PM2
2. Installs dependencies
3. Cleans old build
4. Builds application
5. Verifies standalone setup
6. Starts PM2

## Verification

After deployment:

1. **Check a static file directly:**
   ```bash
   curl -I https://wmp.kwsc.gos.pk/_next/static/css/3ad0c75c87b18546.css
   ```
   
   Should return:
   - `Content-Type: text/css`
   - `200 OK`

2. **Check in browser:**
   - Open DevTools → Network tab
   - Reload page
   - Check CSS/JS files:
     - Status: `200 OK`
     - Type: `text/css` or `application/javascript`
     - No MIME type errors in console

## If Still Not Working

### Check Nginx Configuration

If nginx is proxying requests, ensure it's not interfering:

```nginx
location /_next/static/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Don't modify Content-Type
    proxy_pass_header Content-Type;
    
    # Cache static files
    proxy_cache_valid 200 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### Check Standalone Server

Verify the standalone server is running correctly:

```bash
# Check if server.js exists
ls -la .next/standalone/server.js

# Check PM2 status
pm2 status

# Check if port 3000 is listening
netstat -tulpn | grep 3000
```

### Manual Static File Check

```bash
# Check if files exist
find .next/standalone/.next/static -name "*.css" | head -5
find .next/standalone/.next/static -name "*.js" | head -5

# If files don't exist, run setup manually
npm run setup:standalone
```

## Quick Fix Command

Run this on production server:

```bash
cd /opt/wmp16 && \
pm2 stop wmp && \
rm -rf .next && \
npm run build && \
pm2 restart wmp && \
pm2 logs wmp --lines 20
```

## Important Notes

1. **Standalone Mode**: Your app uses `output: 'standalone'` which requires the setup script to copy static files
2. **Build Time**: The build process includes `node scripts/setup-standalone.js` which copies static files
3. **PM2**: Make sure PM2 is pointing to the correct server file (`.next/standalone/server.js`)

## Expected File Structure

After successful build:
```
.next/
├── standalone/
│   ├── server.js          # Main server file
│   ├── .next/
│   │   ├── static/        # Static files MUST be here
│   │   │   ├── chunks/
│   │   │   ├── css/
│   │   │   └── media/
│   │   └── server/         # Server build
│   └── public/            # Public files
└── static/                # Original static files
```

If `.next/standalone/.next/static` is missing or empty, the setup script didn't run correctly.
