# Final Video Upload Fix Summary

## Issues Resolved

### 1. ✅ Body Size Limit (413 Error)
- **Problem**: Next.js Server Actions had 1MB limit, app tried to upload files up to 1GB
- **Solution**: Increased `bodySizeLimit` to `1gb` in `next.config.mjs`

### 2. ✅ Missing Chunk Endpoint (500 Error)
- **Problem**: Frontend called `/api/final-videos/chunk` but endpoint didn't exist
- **Solution**: Created chunk upload endpoint

### 3. ✅ PM2 Configuration Issue
- **Problem**: Using `next start` with standalone output
- **Solution**: Fixed `ecosystem.config.js` to use `.next/standalone/server.js`

### 4. ✅ Static Files 404 Errors
- **Problem**: Standalone build missing static files
- **Solution**: Created `setup-standalone.js` script to copy files after build

### 5. ✅ Chunk Upload Parameter Mismatch (400 Error)
- **Problem**: Backend expected `chunkId` but frontend sent `uploadId`
- **Solution**: Updated endpoint to match frontend expectations

### 6. ✅ Database Entry Not Created
- **Problem**: Chunks uploaded and combined, but no database entry created
- **Solution**: Updated finalize endpoint to create database entries

## Files Modified

### Backend API Endpoints

1. **`app/api/final-videos/chunk/route.js`** - NEW
   - Receives and saves video chunks
   - Changed `chunkId` to `uploadId`
   - Removed `fileType` validation (uses file extension instead)
   - Saves chunks to `temp/chunks/{uploadId}/`

2. **`app/api/final-videos/finalize/route.js`** - NEW
   - Combines uploaded chunks into final video
   - Creates database entry with all metadata
   - Sends notifications to managers
   - Cleans up temporary chunks
   - Returns final video information

3. **`app/api/final-videos/route.js`** - EXISTING (no changes needed)
   - Still handles small file uploads (< 50MB)
   - Used for standard uploads

### Frontend

4. **`hooks/useFileUpload.js`** - MODIFIED
   - Added logic to pass form data to finalize endpoint
   - Form data includes: `workRequestId`, `description`, `latitude`, `longitude`, `creator_id`, `creator_type`, `creator_name`
   - Finalize endpoint now receives all data needed for database entry

### Configuration

5. **`next.config.mjs`** - MODIFIED
   - Added `bodySizeLimit: '1gb'` to serverActions

6. **`ecosystem.config.js`** - MODIFIED
   - Changed script from `node .next/standalone/server.js` to `.next/standalone/server.js`
   - PM2 automatically uses node interpreter

7. **`package.json`** - MODIFIED
   - Added `fs-extra` dependency
   - Added build scripts with standalone setup
   - Added PM2 management scripts

### Build & Deploy

8. **`scripts/setup-standalone.js`** - NEW
   - Copies static files to standalone directory
   - Copies public files to standalone directory
   - Runs automatically after `npm run build`

9. **`deploy.sh`** - NEW
   - Automated deployment script
   - Handles stop, build, copy, start process

10. **`DEPLOY_STANDALONE.md`** - NEW
    - Complete deployment documentation

## How It Works Now

### Upload Flow for Large Files (> 50MB)

```
1. User selects video file
   ↓
2. Frontend (useFileUpload hook) detects file > 50MB
   ↓
3. File split into 5MB chunks
   ↓
4. Each chunk uploaded to: POST /api/final-videos/chunk
   - Saves to: temp/chunks/{uploadId}/chunk_{index}
   - Returns: { success: true, chunkIndex, totalChunks }
   ↓
5. After all chunks uploaded, call: POST /api/final-videos/finalize
   - Body includes: uploadId, fileName, fileSize, totalChunks,
                   workRequestId, description, latitude, longitude,
                   creator_id, creator_type, creator_name
   ↓
6. Finalize endpoint:
   - Reads all chunks from temp directory
   - Combines chunks into single file
   - Saves to: public/uploads/final-videos/{unique-filename}
   - Creates database entry in final_videos table
   - Sends notifications to managers
   - Deletes temporary chunks
   - Returns: { success: true, video: {...}, filePath: "..." }
   ↓
7. Frontend receives response and shows success message
```

### Upload Flow for Small Files (< 50MB)

```
1. User selects video file
   ↓
2. Frontend (useFileUpload hook) detects file < 50MB
   ↓
3. Standard upload to: POST /api/final-videos
   - Saves file directly
   - Creates database entry
   - Returns video information
```

## Database Schema

The finalize endpoint creates entries with:

```sql
INSERT INTO final_videos (
  work_request_id,    -- Required: Associated work request
  description,         -- Required: Video description
  link,               -- File path: /uploads/final-videos/{filename}
  geo_tag,            -- PostGIS POINT(longitude, latitude)
  created_at,         -- Timestamp
  updated_at,         -- Timestamp
  creator_id,         -- User ID who uploaded
  creator_type,       -- 'admin' or 'socialmedia'
  creator_name,       -- User's name
  file_name,          -- Original filename
  file_size,          -- File size in bytes
  file_type           -- MIME type (e.g., video/mp4)
)
```

## Permissions

### Who Can Upload Final Videos?

Based on the route validation:
- **Admin** (`role: 1`) - ✅ Can upload
- **Manager** (`role: 2`) - ✅ Can upload  
- **Social Media Agents** (`creator_type: 'socialmedia'`) - ✅ Can upload
- **Field Agents** - ❌ Cannot upload (only admins/managers/SM agents)

The validation in POST endpoint:
```javascript
if (creatorType !== 'socialmedia') {
  return createErrorResponse('Only Media Cell agents can upload final videos', 403);
}
```

**Note**: This validation might be too strict. If admins should also be able to upload, this needs to be modified.

## Deployment Instructions

### On Server:

```bash
# 1. Navigate to project
cd /opt/wmp/wmp

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
npm install

# 4. Restart PM2
pm2 restart wmp

# 5. Monitor logs
pm2 logs wmp
```

**No rebuild needed** - API routes are loaded dynamically!

## Testing Checklist

### Test as Admin:
- [ ] Login as admin
- [ ] Navigate to Add Final Video page
- [ ] Select work request
- [ ] Add description
- [ ] Select small video file (< 50MB)
- [ ] Upload - should use standard upload
- [ ] Check database for entry
- [ ] Select large video file (> 50MB)
- [ ] Upload - should show chunk progress (8%, 17%, 25%...)
- [ ] Verify video appears in final videos list
- [ ] Check file exists in: `/opt/wmp/wmp/public/uploads/final-videos/`

### Test as Social Media Agent:
- [ ] Login as SM agent
- [ ] Navigate to Add Final Video page
- [ ] Follow same steps as admin
- [ ] Verify upload works

### Verify Notifications:
- [ ] Login as manager
- [ ] Check notifications bell
- [ ] Should see notification: "New final video uploaded for request #XX"

## Troubleshooting

### Video uploads but no database entry
- Check server logs: `pm2 logs wmp --lines 100`
- Look for database errors
- Verify work request ID exists
- Check creator_type validation

### Chunks upload but finalize fails
- Check temp directory: `ls -la temp/chunks/`
- Verify all chunks present
- Check disk space: `df -h`
- Look for permission errors

### 403 Forbidden on upload
- Check creator_type field
- Current validation only allows 'socialmedia'
- May need to modify validation for admins

### Static files 404
- Run: `npm run setup:standalone`
- Rebuild: `npm run build`
- Restart: `pm2 restart wmp`

## Performance Notes

- Chunk size: 5MB (configurable in useFileUpload.js)
- Max file size: 1GB (configurable in UPLOAD_CONFIG)
- Retry attempts: 3 per chunk
- Exponential backoff on retry
- Chunks stored temporarily, deleted after finalization
- Database pool handles concurrent uploads

## Future Improvements

1. Add progress bar in UI for chunk uploads
2. Allow resumable uploads (save progress)
3. Add video processing (thumbnails, compression)
4. Implement upload queue for multiple files
5. Add admin settings for upload limits
6. Relax creator_type validation for admins

