# Filename Sanitization Fix

## Problem Description

Images, videos, and other uploaded files were failing to load with 404 errors. The issue was caused by filenames containing spaces and special characters, which caused URL encoding problems when accessing the files.

### Example Error
```
Request URL: http://202.61.47.29:3000/uploads/images/Gulzar-e-Hijri%20Scheme-33...jpeg
Status: 404 Not Found
Error: The requested resource isn't a valid image
```

The filename had spaces which became `%20` in URLs, but the file path handling was inconsistent.

## Root Cause

The filename generation functions were preserving the original filename with spaces and special characters:
- `generateUniqueFilename()` in `lib/fileUploadOptimized.js`
- Edit handlers in `app/api/images/route.js` and `app/api/videos/route.js`
- Upload handlers in `app/api/media/upload/route.js` and `app/api/media/route.js`

## Solution

### 1. Fixed Filename Generation

Updated all filename generation code to sanitize filenames by:
- Replacing spaces with hyphens
- Removing special characters (keeping only alphanumeric, hyphens, and underscores)
- Removing multiple consecutive hyphens
- Limiting filename length to 50 characters
- Adding timestamp and random suffix for uniqueness

### 2. Files Changed

#### Core Library
- `lib/fileUploadOptimized.js` - Updated `generateUniqueFilename()` function with sanitization

#### API Routes
- `app/api/images/route.js` - Fixed image edit (PUT) handler
- `app/api/videos/route.js` - Fixed video edit (PUT) handler
- `app/api/media/upload/route.js` - Fixed media upload handler
- `app/api/media/route.js` - Fixed media processing handler

### 3. Migration Script

Created `scripts/fix-filenames.js` to fix existing files in the database.

## How to Apply the Fix

### For New Uploads
The fix is automatic - all new file uploads will have sanitized filenames.

### For Existing Files

**IMPORTANT: Create a backup before running this script!**

1. **Backup your database**:
   ```bash
   pg_dump -U postgres -d wmp > wmp_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Backup your uploads directory**:
   ```bash
   # Windows PowerShell
   Copy-Item -Path "public/uploads" -Destination "public/uploads_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')" -Recurse
   
   # Linux/Mac
   cp -r public/uploads "public/uploads_backup_$(date +%Y%m%d_%H%M%S)"
   ```

3. **Run the migration script**:
   ```bash
   node scripts/fix-filenames.js
   ```

4. **Verify the results**:
   - Check the console output for any errors
   - Test loading images/videos in your application
   - If issues occur, restore from backup

### What the Script Does

The migration script:
1. Queries all media tables (images, videos, final_videos, before_content)
2. Identifies files with spaces or special characters in their filenames
3. Renames the physical files on disk with sanitized names
4. Updates the database records with new file paths
5. Handles filename collisions by adding unique suffixes
6. Provides detailed logging of all changes

### Example Output
```
===========================================
Starting filename sanitization script...
===========================================

=== Processing images table ===
Found 150 records in images
  ✓ [536] Renamed: Gulzar-e-Hijri Scheme-33...jpeg -> Gulzar-e-Hijri-Scheme-33...jpeg
  ✓ [537] Renamed: Block-19 Near Shumail...jpeg -> Block-19-Near-Shumail...jpeg
  ...

images Summary:
  - Records checked: 150
  - Needing sanitization: 25
  - Successfully updated: 25
  - Failed: 0

===========================================
OVERALL SUMMARY
===========================================
Total processed: 48
Total updated: 48
Total failed: 0
✓ All files processed successfully!
```

## Testing

After applying the fix:

1. **Test New Uploads**:
   - Upload a file with spaces in the name (e.g., "Test Image 123.jpg")
   - Verify it's saved with hyphens (e.g., "Test-Image-123-1729158000-123456789.jpg")
   - Verify the image loads correctly in the browser

2. **Test Existing Files**:
   - Navigate to pages showing images/videos that previously failed
   - Verify all media loads correctly
   - Check browser console for any 404 errors

3. **Test Edit Functionality**:
   - Edit an existing image/video record
   - Upload a replacement file with spaces in the name
   - Verify the new file loads correctly

## Affected Features

This fix applies to all file upload features:

- ✅ Images upload (agent/dashboard)
- ✅ Images edit
- ✅ Videos upload  
- ✅ Videos edit
- ✅ Final videos upload
- ✅ Final videos edit
- ✅ Before-content upload (images and videos)
- ✅ Media upload API
- ✅ All archiving functionality

## Prevention

The sanitization is now built into the core filename generation function, so:
- All new uploads automatically get sanitized filenames
- No special handling needed in individual upload endpoints
- Consistent behavior across all file upload features

## Rollback

If you need to rollback:

1. Restore the database from backup
2. Restore the uploads directory from backup  
3. Revert the code changes using git:
   ```bash
   git checkout HEAD -- lib/fileUploadOptimized.js app/api/images/route.js app/api/videos/route.js app/api/media/
   ```

## Notes

- The script is idempotent - safe to run multiple times
- Files are renamed, not copied, so no extra disk space is used
- Database records are updated in a transaction-safe manner
- If a sanitized filename already exists, a unique suffix is added
- The script logs all changes for audit purposes

