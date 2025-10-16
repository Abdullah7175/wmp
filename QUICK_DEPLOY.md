# Quick Deploy Guide

## Deploy Latest Changes (API Routes Only)

Since we only modified API routes and hooks (no build artifacts), you can deploy without rebuilding:

```bash
cd /opt/wmp/wmp
git pull origin main
npm install  # Only if package.json changed
pm2 restart wmp
pm2 logs wmp
```

## Full Deploy (With Rebuild)

If you need to rebuild the application:

```bash
cd /opt/wmp/wmp
git pull origin main
npm install
pm2 stop wmp
npm run build
pm2 start ecosystem.config.js
pm2 logs wmp
```

## Test Upload

1. Login to: http://202.61.47.29:3000
2. Navigate to Add Final Video
3. Upload a video file
4. Check console logs for progress
5. Verify entry in database:

```sql
SELECT * FROM final_videos ORDER BY created_at DESC LIMIT 5;
```

## Quick Checks

### Check if app is running
```bash
pm2 list
```

### View live logs
```bash
pm2 logs wmp
```

### Check last 100 lines
```bash
pm2 logs wmp --lines 100
```

### Check upload directory
```bash
ls -lah /opt/wmp/wmp/public/uploads/final-videos/
```

### Check temp chunks (should be empty after successful uploads)
```bash
ls -lah /opt/wmp/wmp/temp/chunks/
```

### Restart if needed
```bash
pm2 restart wmp
```

### Stop app
```bash
pm2 stop wmp
```

### Start app
```bash
pm2 start wmp
```

## Common Issues

### Issue: No database entry after upload
**Check**: Server logs for errors
```bash
pm2 logs wmp --err --lines 50
```

**Solution**: Verify form data is being passed to finalize endpoint

### Issue: Chunks not combining
**Check**: Temp directory
```bash
ls -la /opt/wmp/wmp/temp/chunks/
```

**Solution**: Check disk space and permissions

### Issue: 403 Forbidden
**Cause**: Creator type validation
**Check**: Only 'socialmedia' creator_type allowed
**Solution**: Either:
1. Pass correct creator_type in form data
2. Modify validation in finalize endpoint

## Files Changed in This Update

- ✅ `app/api/final-videos/chunk/route.js` (NEW)
- ✅ `app/api/final-videos/finalize/route.js` (NEW)
- ✅ `hooks/useFileUpload.js` (MODIFIED)
- ✅ `next.config.mjs` (MODIFIED)
- ✅ `ecosystem.config.js` (MODIFIED)
- ✅ `package.json` (MODIFIED)
- ✅ `scripts/setup-standalone.js` (NEW)
- ✅ `deploy.sh` (NEW)

## What Got Fixed

1. ✅ Body size limit increased to 1GB
2. ✅ Chunk upload endpoint created
3. ✅ PM2 configuration fixed
4. ✅ Static files 404 resolved
5. ✅ Chunk parameter mismatch fixed
6. ✅ Database entry creation added to finalize

## Success Indicators

When upload works correctly, you should see:

**Browser Console:**
```
Uploading case 79.mp4: 8%
Uploading case 79.mp4: 17%
...
Uploading case 79.mp4: 100%
Successfully uploaded case 79.mp4
```

**Server Logs:**
```bash
pm2 logs wmp
# Should show:
# - Database connection successful
# - No errors
# - Clean startup
```

**Database:**
```sql
SELECT id, work_request_id, description, file_name, created_at 
FROM final_videos 
ORDER BY created_at DESC 
LIMIT 1;
```

Should return the newly uploaded video.

**File System:**
```bash
ls -lah /opt/wmp/wmp/public/uploads/final-videos/
# Should show the video file with unique filename
```

## Need Help?

Check these files for detailed information:
- `UPLOAD_FIX_SUMMARY.md` - Complete technical summary
- `DEPLOY_STANDALONE.md` - Full deployment guide
- `deploy.sh` - Automated deployment script

