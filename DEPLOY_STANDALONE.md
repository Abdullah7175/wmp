# Next.js Standalone Deployment Guide

## Overview
This guide covers deploying the WMP application using Next.js standalone mode with PM2.

## Prerequisites
- Node.js 20.x or higher
- PM2 installed globally (`npm install -g pm2`)
- Production database configured

## Deployment Steps

### 1. Pull Latest Code
```bash
cd /opt/wmp/wmp
git pull origin main
```

### 2. Install Dependencies
```bash
npm install
```

**Important**: Make sure `fs-extra` is installed. If not, run:
```bash
npm install fs-extra
```

### 3. Build the Application
```bash
# Stop PM2 first
pm2 stop wmp

# Clean old build
rm -rf .next

# Build (this will automatically run the setup-standalone script)
npm run build
```

The build script will:
- Build the Next.js application
- Automatically copy static files to `.next/standalone/.next/static`
- Automatically copy public files to `.next/standalone/public`

### 4. Verify Standalone Setup
```bash
# Check if static files were copied
ls -la .next/standalone/.next/static/
ls -la .next/standalone/public/

# You should see:
# - .next/standalone/.next/static/chunks/
# - .next/standalone/.next/static/css/
# - .next/standalone/.next/static/media/
# - .next/standalone/public/
```

### 5. Start with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 list
pm2 logs wmp
```

### 6. Setup PM2 to Start on Boot (First Time Only)
```bash
pm2 startup
pm2 save
```

## Manual Standalone Setup (If Needed)

If the automatic script fails, you can manually copy the files:

```bash
# Copy static files
cp -r .next/static .next/standalone/.next/static

# Copy public files
cp -r public .next/standalone/public

# Verify
ls -la .next/standalone/.next/
ls -la .next/standalone/public/
```

## Troubleshooting

### 404 Errors for Static Files

**Symptom**: Browser shows 404 errors for JS, CSS, and font files.

**Solution**:
```bash
pm2 stop wmp
npm run setup:standalone
pm2 start wmp
```

### Application Won't Start

**Check Logs**:
```bash
pm2 logs wmp --lines 100
```

**Common Issues**:
1. **Missing .next/standalone directory**: Run `npm run build`
2. **Port already in use**: Change port in `ecosystem.config.js`
3. **Database connection error**: Check environment variables

### Clear Browser Cache After Deployment

After each deployment, users should:
1. Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. Or clear browser cache completely

## PM2 Commands Reference

```bash
# View status
pm2 list

# View logs (live)
pm2 logs wmp

# View last 100 lines
pm2 logs wmp --lines 100

# Stop application
pm2 stop wmp

# Start application
pm2 start wmp

# Restart application
pm2 restart wmp

# Delete from PM2
pm2 delete wmp

# Monitor CPU/Memory
pm2 monit
```

## Environment Variables

Ensure these are set in your environment or `.env` file:

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATABASE_URL=your_database_url
NEXTAUTH_URL=http://202.61.47.29:3000
NEXTAUTH_SECRET=your_secret
JWT_SECRET=your_jwt_secret
```

## File Structure After Build

```
/opt/wmp/wmp/
├── .next/
│   ├── static/              # Original static files
│   └── standalone/          # Standalone server
│       ├── server.js        # Main server file
│       ├── .next/
│       │   └── static/      # Copied static files ✓
│       ├── public/          # Copied public files ✓
│       └── node_modules/    # Production dependencies
├── ecosystem.config.js      # PM2 configuration
├── package.json
└── public/                  # Original public files
```

## Configuration Files

### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'wmp',
    script: '.next/standalone/server.js',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    }
  }]
};
```

### next.config.mjs
Key settings:
- `output: 'standalone'` - Enables standalone build
- `bodySizeLimit: '1gb'` - Allows large file uploads
- Static file handling automatically configured

## Performance Tips

1. **Memory Management**: PM2 is configured to restart if memory exceeds 1GB
2. **Log Rotation**: Consider setting up log rotation for PM2 logs
3. **Monitoring**: Use `pm2 monit` for real-time monitoring

## Quick Deploy Script

Save this as `deploy.sh`:

```bash
#!/bin/bash
echo "🚀 Starting deployment..."

# Stop PM2
pm2 stop wmp

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Clean and build
rm -rf .next
npm run build

# Start PM2
pm2 start ecosystem.config.js

# Show status
pm2 list

echo "✅ Deployment complete!"
echo "📊 Check logs: pm2 logs wmp"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Support

For issues, check:
1. PM2 logs: `pm2 logs wmp`
2. Application logs: Check `.next/standalone` directory
3. System logs: `journalctl -u pm2-root`

