# Server Configuration Optimizations for WMP Application

## Build Process Issues Fixed

### Problem: Standalone Server Not Created
The build process was failing to create the standalone server because:
- Database connections were being attempted during build phase
- Pool shutdown handlers were interfering with build process
- Statistics logging was running during build

### Solution Applied
- **Skip database connections during build**: Return null instead of throwing errors
- **Conditional logging**: Only log pool statistics during runtime, not build
- **Conditional shutdown handlers**: Only register signal handlers during runtime

### Clean Build Process

**Step 1: Debug the current state**
```bash
chmod +x debug-build.sh
./debug-build.sh
```

**Step 2: Clean build with debugging**
```bash
chmod +x clean-build.sh
./clean-build.sh
```

**Step 3: Manual clean build (if script fails)**
```bash
# Stop PM2
pm2 stop wmp

# Remove old build
rm -rf .next

# Clean npm cache
npm cache clean --force

# Set build environment variables
export NODE_ENV=production
export NEXT_PHASE=phase-production-build

# Build with verbose output
npm run build 2>&1 | tee build.log

# Check if standalone was created
ls -la .next/standalone/

# If successful, start with PM2
pm2 start .next/standalone/server.js --name wmp
```

**Step 4: If standalone still not created**
```bash
# Check build log for errors
tail -100 build.log

# Try building without database connections
NODE_ENV=production NEXT_PHASE=phase-production-build npm run build
```

## Database Connection Issues Fixed

### 1. Database Pool Configuration
- **Increased pool size**: From 10 to 20 connections for better concurrency
- **Added minimum connections**: 2 connections kept alive
- **Extended timeouts**: 30 seconds for connections, 5 minutes for queries
- **Better error handling**: Graceful reconnection on connection loss

### 2. File Upload Optimizations
- **Extended upload timeout**: 10 minutes for large file uploads
- **Chunked uploads**: For files >50MB (videos) and >25MB (images)
- **Progress tracking**: Console logs for upload progress
- **Better error handling**: Continue processing other files if one fails
- **Connection management**: Proper client release in all scenarios

### 3. Server-Side Timeout Settings

#### Next.js Configuration (`next.config.mjs`)
```javascript
serverRuntimeConfig: {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  bodyParser: {
    sizeLimit: 500 * 1024 * 1024, // 500MB
  },
},
```

#### Database Configuration (`lib/db.js`)
```javascript
const pool = new Pool({
  max: 20, // Increased pool size
  min: 2, // Keep minimum connections alive
  idleTimeoutMillis: 600000, // 10 minutes
  connectionTimeoutMillis: 30000, // 30 seconds
  acquireTimeoutMillis: 30000, // 30 seconds
  statement_timeout: 300000, // 5 minutes for large uploads
  query_timeout: 300000, // 5 minutes for large uploads
});
```

## Deployment Instructions

### Clean Build Process
```bash
# 1. Delete old build
rm -rf .next

# 2. Clean build
npm run build

# 3. Start with PM2
pm2 start .next/standalone/server.js --name wmp
```

### For Your Server
1. **Stop current PM2 process**: `pm2 stop wmp`
2. **Delete old build**: `rm -rf .next`
3. **Upload your code** (with the fixes)
4. **Run clean build**: `npm run build`
5. **Start PM2**: `pm2 start .next/standalone/server.js --name wmp`

## What These Fixes Address

✅ **Database Connection Timeouts**: Better pool management and retry logic
✅ **File Upload Stuck Issues**: Extended timeouts and chunked processing
✅ **Connection Pool Exhaustion**: Proper client release and pool sizing
✅ **Large File Handling**: Chunked uploads for files >25-50MB
✅ **Error Recovery**: Continue processing other files if one fails
✅ **Progress Tracking**: Console logs for debugging upload progress

## Monitoring

The application now logs:
- Database connection attempts and success/failure
- File upload progress (file size, chunk progress)
- Pool statistics every minute
- Detailed error information for debugging

## Expected Results

- ✅ No more database connection timeouts
- ✅ File uploads complete successfully (even large files)
- ✅ Better error messages for debugging
- ✅ Improved server stability
- ✅ All editor features working properly
