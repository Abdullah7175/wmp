# Media Files Fix - Images and Videos Not Loading

## Issue

Images and videos were showing 404 errors in the browser console:
- Images: `GET http://202.61.47.29:3000/uploads/images/Block-19-Near-Shumail-Garden-Gulistan-e-Jauhar-Saf-1760955594602-281724655.jpeg 404 (Not Found)`
- Videos: `GET http://202.61.47.29:3000/uploads/videos/Block-19-Near-Shumail-Garden-Gulistan-e-Jauhar-Saf-1760955396042-996370245.mp4 404 (Not Found)`

## Root Cause

The database contains references to media files that no longer exist on the server filesystem:
- Database has paths like: `/uploads/images/Block-19-Near-Shumail-Garden-Gulistan-e-Jauhar-Saf-1760955594602-281724655.jpeg`
- Actual files on disk: Only old test files like `1748077130806-google.jpg` from early 2024
- Missing files: Work request media files that were uploaded but subsequently deleted or lost

## Solutions Implemented

### 1. Graceful Error Handling in UI

Updated all pages that display images/videos to handle missing files gracefully:

#### Files Modified:
- `app/dashboard/before-images/page.js` - Added fallback for missing before content images/videos
- `app/dashboard/requests/[id]/view/page.jsx` - Added video player with error handling
- `app/agent/before-images/page.js` - Replaced Next.js Image with regular img tag + fallback
- `app/smagent/before-images/page.js` - Added fallback for missing images
- `app/dashboard/images/image/[id]/page.js` - Added error handling for image viewer
- `app/agent/images/image/[id]/page.js` - Added error handling for image viewer
- `app/api/uploads/[...path]/route.js` - Improved 404 error logging and response

#### Changes:
- Replaced some Next.js `<Image>` components with regular `<img>` tags to avoid 400 errors from image optimization
- Added `onError` handlers to all media elements that:
  - Hide the broken image/video element
  - Display a user-friendly "Media file not available" message
  - Show appropriate icon (camera/video)

### 2. Database Cleanup Script

Created `scripts/cleanup-missing-files.js` to:
- Scan the database for image/video references
- Check if the actual files exist on the filesystem
- Report missing vs existing files
- Optionally delete database references to missing files

#### Usage:

```bash
# Check for missing files (dry run)
node scripts/cleanup-missing-files.js

# Remove database references to missing files
node scripts/cleanup-missing-files.js --delete
```

### 3. Improved Upload API Error Handling

- Enhanced error logging in `/api/uploads/[...path]/route.js`
- Logs full file path and requested path for debugging
- Returns proper 404 responses for missing files

## Recommendations

### Immediate Actions:

1. **Run the cleanup script** to identify all missing files:
   ```bash
   node scripts/cleanup-missing-files.js
   ```

2. **If files can be restored from backup:**
   - Restore missing files to `public/uploads/images/` and `public/uploads/videos/`
   - Ensure filenames match the database references exactly

3. **If files cannot be restored:**
   - Run the cleanup script with `--delete` flag to remove invalid references:
   ```bash
   node scripts/cleanup-missing-files.js --delete
   ```

### Long-term Prevention:

1. **Implement file backup strategy:**
   - Regular backups of `public/uploads/` directory
   - Consider cloud storage (S3, Azure Blob, etc.) for media files
   - Add backup verification to deployment process

2. **Add file validation on page load:**
   - Periodically check file existence in background
   - Mark missing files in database for cleanup
   - Alert admins when files go missing

3. **Improve upload monitoring:**
   - Add logging to track when files are deleted
   - Implement soft-delete for database records
   - Keep audit trail of file operations

## Technical Details

### File Naming Pattern

Files are generated using this pattern in `lib/fileUploadOptimized.js`:
```
{sanitized-description}-{timestamp}-{random-number}.{ext}
```

Example: `Block-19-Near-Shumail-Garden-Gulistan-e-Jauhar-Saf-1760955594602-281724655.jpeg`
- `Block-19-Near-Shumail-Garden-Gulistan-e-Jauhar-Saf`: Sanitized original filename
- `1760955594602`: Timestamp (milliseconds)
- `281724655`: Random number for uniqueness
- `.jpeg`: File extension

### Storage Locations

- Images: `public/uploads/images/`
- Videos: `public/uploads/videos/`
- Final Videos: `public/uploads/final-videos/`
- Before Images: `public/uploads/before-images/`

### Database Tables

- `images` - Work request images
- `videos` - Work request videos  
- `final_videos` - Final completion videos
- `before_content` - Before work images/videos (legacy table)

## Testing

After implementing these fixes:
1. Missing images/videos will show placeholder messages instead of broken links
2. Console errors will still appear but won't break the UI
3. Users can still see metadata (descriptions, dates, etc.) even if files are missing
4. The cleanup script helps identify the scope of missing files

## Date: October 20, 2025

