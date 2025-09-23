# Server Configuration Optimizations for WMP Application

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
