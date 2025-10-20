# Standalone Mode Path Fix - COMPLETE SOLUTION

## Issue Summary

**Problem**: Images and videos were showing 404 errors even though the files exist on the server.

**Root Cause**: In production standalone mode, the application runs from `.next/standalone/` directory, so `process.cwd()` returns `/opt/wmp/wmp/.next/standalone/`. The APIs were looking for files in `/opt/wmp/wmp/.next/standalone/public/uploads/` but the actual files are in `/opt/wmp/wmp/public/uploads/`.

## Evidence from Server Logs

```
File not found: /opt/wmp/wmp/.next/standalone/public/uploads/videos/Replacement-of-Line-And-Repairing-of-Manholes-Sewe-1760699818627-916481314.mp4
File not found: /opt/wmp/wmp/.next/standalone/public/uploads/images/Orangi-Town-Shahreh-e-Qaddafi-Sector-14G-Muslim-Na-1760699767126-49218642.jpeg
```

But when checking the server:
```bash
[root@static-host202-61-47-29 images]# ls
# Shows hundreds of files exist in /opt/wmp/wmp/public/uploads/images/
# Shows hundreds of files exist in /opt/wmp/wmp/public/uploads/videos/
```

## Solution Applied

Added standalone mode detection to all file-serving and upload APIs. When running in standalone mode, the code now goes up two directory levels to reach the project root where the actual `public/` directory is located.

### Pattern Used

```javascript
// Handle standalone mode - get correct base directory
let baseDir = process.cwd();
if (baseDir.includes('.next/standalone') || baseDir.includes('.next\\standalone')) {
  // In standalone mode, go up two levels to get to project root
  baseDir = path.join(baseDir, '..', '..');
}
const fullPath = path.join(baseDir, 'public', 'uploads', ...);
```

### Files Modified

1. **app/api/uploads/[...path]/route.js** ✅
   - Main file serving API
   - Handles all `/uploads/*` requests
   - Now correctly resolves paths in standalone mode

2. **app/api/images/route.js** ✅
   - POST: Upload images - fixes save location
   - PUT: Update images - fixes file read/write/delete
   - DELETE: Delete images - fixes file deletion

3. **app/api/videos/route.js** ✅
   - POST: Upload videos - fixes save location
   - PUT: Update videos - fixes file read/write/delete
   - DELETE: Delete videos - fixes file deletion

4. **app/api/final-videos/chunk/route.js** ✅
   - Already had the fix (from previous work)

## Deployment Instructions

### On Production Server (Linux):

```bash
# 1. Navigate to project directory
cd /opt/wmp/wmp

# 2. Pull latest code
git pull origin main

# 3. Restart PM2 (NO rebuild needed - API routes load dynamically)
pm2 restart wmp

# 4. Verify logs
pm2 logs wmp --lines 20

# 5. Test by accessing any image/video in browser
# The 404 errors should be gone!
```

### Why No Rebuild is Needed

✅ API routes are **server-side only** and loaded dynamically  
✅ Changes to `/app/api/` do not require rebuilding the Next.js app  
✅ Simply restarting PM2 will pick up the new code  

## Testing Checklist

After deployment:

- [ ] Open a work request with images in the dashboard
- [ ] Images should load without 404 errors
- [ ] Open a work request with videos in the dashboard  
- [ ] Videos should play without 404 errors
- [ ] Check browser console - no 404 errors for `/uploads/*` files
- [ ] Check server logs: `pm2 logs wmp` - should show successful file serving

## Path Resolution Logic

### Development Mode
```
process.cwd() → /opt/wmp/wmp
Files location → /opt/wmp/wmp/public/uploads/
API looks in → /opt/wmp/wmp/public/uploads/ ✅ MATCH
```

### Production Standalone Mode (BEFORE FIX)
```
process.cwd() → /opt/wmp/wmp/.next/standalone
Files location → /opt/wmp/wmp/public/uploads/
API looks in → /opt/wmp/wmp/.next/standalone/public/uploads/ ❌ WRONG
```

### Production Standalone Mode (AFTER FIX)
```
process.cwd() → /opt/wmp/wmp/.next/standalone
Detected standalone → go up 2 levels
baseDir → /opt/wmp/wmp
Files location → /opt/wmp/wmp/public/uploads/
API looks in → /opt/wmp/wmp/public/uploads/ ✅ MATCH
```

## UI Improvements (Bonus)

Also added graceful error handling to all pages that display media:
- Missing files show friendly placeholder messages
- No broken image icons
- Users can still see metadata even if a specific file is missing

### Modified Pages:
- `app/dashboard/before-images/page.js`
- `app/dashboard/requests/[id]/view/page.jsx`
- `app/agent/before-images/page.js`
- `app/smagent/before-images/page.js`
- `app/dashboard/images/image/[id]/page.js`
- `app/agent/images/image/[id]/page.js`

## Important Notes

1. **DO NOT delete database references** - the files are all there, just the path resolution was wrong
2. **DO NOT re-upload files** - all existing files are intact and will work after restart
3. **DO NOT run cleanup script** - not needed, all files are valid

## Files You Can Delete (Optional)

These were created during troubleshooting but are not needed:
- `scripts/cleanup-missing-files.js` - Not needed since files exist
- `scripts/migrate-standalone-files.js` - Not needed since files are in correct location
- `MEDIA_FILES_FIX.md` - Superseded by this document

## Expected Outcome

After `pm2 restart wmp`:
- ✅ All existing images will load correctly
- ✅ All existing videos will play correctly
- ✅ No more 404 errors in browser console
- ✅ No more "File not found" errors in server logs
- ✅ New uploads will save to correct location
- ✅ Future deployments won't lose files

## Date: October 20, 2025
## Status: READY TO DEPLOY

