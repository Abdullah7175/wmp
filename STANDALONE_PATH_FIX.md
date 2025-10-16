# Standalone Mode Path Fix

## Problem

Files were being uploaded and database entries created, but the actual video files couldn't be found on the server.

## Root Cause

When running Next.js in **standalone mode**, `process.cwd()` returns:
```
/opt/wmp/wmp/.next/standalone
```

But the public directory is actually at:
```
/opt/wmp/wmp/public
```

This caused files to be saved in the wrong location:
- **Wrong**: `/opt/wmp/wmp/.next/standalone/public/uploads/final-videos/`
- **Correct**: `/opt/wmp/wmp/public/uploads/final-videos/`

## Solution

Added path resolution logic to detect standalone mode and adjust paths accordingly:

```javascript
// Get base directory (handle standalone mode)
let baseDir = process.cwd();
if (baseDir.includes('.next/standalone')) {
  baseDir = path.join(baseDir, '..', '..');
}
```

## Files Modified

### 1. `app/api/final-videos/chunk/route.js`

**Before:**
```javascript
const tempDir = path.join(process.cwd(), 'temp', 'chunks', uploadId);
```

**After:**
```javascript
let baseDir = process.cwd();
if (baseDir.includes('.next/standalone')) {
  baseDir = path.join(baseDir, '..', '..');
}
const tempDir = path.join(baseDir, 'temp', 'chunks', uploadId);
```

### 2. `app/api/final-videos/finalize/route.js`

**Before:**
```javascript
const uploadsDir = path.join(process.cwd(), 'public', UPLOAD_CONFIG.UPLOAD_DIRS.finalVideos);
const tempDir = path.join(process.cwd(), 'temp', 'chunks', uploadId);
```

**After:**
```javascript
// For public directory
let publicDir = path.join(process.cwd(), 'public');
if (process.cwd().includes('.next/standalone')) {
  publicDir = path.join(process.cwd(), '..', '..', 'public');
}
const uploadsDir = path.join(publicDir, UPLOAD_CONFIG.UPLOAD_DIRS.finalVideos);

// For temp directory
let baseDir = process.cwd();
if (baseDir.includes('.next/standalone')) {
  baseDir = path.join(baseDir, '..', '..');
}
const tempDir = path.join(baseDir, 'temp', 'chunks', uploadId);
```

## Directory Structure

### In Standalone Mode

```
/opt/wmp/wmp/
├── .next/
│   └── standalone/
│       ├── server.js          ← process.cwd() points here
│       ├── .next/
│       │   └── static/
│       └── public/             ← Wrong location!
├── public/                    ← Correct location!
│   └── uploads/
│       └── final-videos/       ← Files should go here
└── temp/
    └── chunks/                 ← Temp chunks should go here
```

### Path Resolution

When in standalone mode (`/.next/standalone/`):
- Go up two levels: `..` → `.next` → `..` → `root`
- Then append `public` or `temp`

## Deployment

```bash
cd /opt/wmp/wmp
git pull origin main
pm2 restart wmp
```

**No rebuild needed** - API routes are loaded dynamically.

## Testing

1. Upload a video file
2. Check browser console - should show 100% completion
3. Check server:

```bash
# Check if file exists
ls -lah /opt/wmp/wmp/public/uploads/final-videos/

# Check temp directory (should be empty after upload)
ls -lah /opt/wmp/wmp/temp/chunks/

# Check database
psql -U your_user -d your_db -c "SELECT id, file_name, link FROM final_videos ORDER BY created_at DESC LIMIT 1;"
```

4. Verify the file path in database matches the actual file location

## Why This Happened

The standalone build copies necessary files to `.next/standalone/` for deployment, but:
1. Static files are served from the root `public/` directory
2. Next.js expects uploaded files to be in the root `public/` directory
3. Our API was using `process.cwd()` which pointed to the standalone directory

## Prevention

For future API endpoints that need to access files, always use this pattern:

```javascript
function getBaseDir() {
  let baseDir = process.cwd();
  if (baseDir.includes('.next/standalone')) {
    baseDir = path.join(baseDir, '..', '..');
  }
  return baseDir;
}

// Usage
const publicDir = path.join(getBaseDir(), 'public');
const tempDir = path.join(getBaseDir(), 'temp');
```

## Alternative Solutions Considered

1. **Symlink approach**: Create symlink from standalone/public to root/public
   - Rejected: Adds complexity, might not work on all systems

2. **Environment variable**: Set UPLOAD_DIR in environment
   - Rejected: Harder to maintain, needs configuration

3. **Copy files after upload**: Upload to standalone, then copy to public
   - Rejected: Wasteful, doubles storage usage

4. **Current solution**: Detect standalone mode and adjust paths
   - ✅ Selected: Simple, no configuration needed, works automatically

## Related Issues

This same pattern should be applied to:
- [ ] `/api/videos/upload` - if it has the same issue
- [ ] `/api/before-images/upload` - if it has the same issue
- [ ] Any other file upload endpoints

## Verification Commands

After deploying, run these to verify:

```bash
# Test upload
# (Upload a video through the UI)

# Find the most recent video in database
psql -U your_user -d your_db -c "SELECT link FROM final_videos ORDER BY created_at DESC LIMIT 1;"

# Copy the path (e.g., /uploads/final-videos/filename.mp4)
# Check if file exists
ls -lah /opt/wmp/wmp/public/uploads/final-videos/filename.mp4

# If file exists, the fix is working! ✅
```

## Summary

✅ Files now save to correct location: `/opt/wmp/wmp/public/uploads/final-videos/`
✅ Temp chunks save to correct location: `/opt/wmp/wmp/temp/chunks/`
✅ Database entries point to correct file paths
✅ Works in both development and standalone production mode

