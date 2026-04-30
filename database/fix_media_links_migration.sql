-- Database Migration: Fix Image and Video Links
-- This script updates all image and video records that have incomplete links (just filenames)
-- to use the proper API endpoint path format.

-- Fix images table links (only update if link doesn't already start with /api/uploads/)
UPDATE images
SET link = '/api/uploads/images/' || file_name
WHERE link NOT LIKE '/api/uploads/%' 
  AND link IS NOT NULL 
  AND link != ''
  AND file_name IS NOT NULL;

-- Fix videos table links
UPDATE videos
SET link = '/api/uploads/videos/' || file_name
WHERE link NOT LIKE '/api/uploads/%' 
  AND link IS NOT NULL 
  AND link != ''
  AND file_name IS NOT NULL;

-- Fix final_videos table links
UPDATE final_videos
SET link = '/api/uploads/final-videos/' || file_name
WHERE link NOT LIKE '/api/uploads/%' 
  AND link IS NOT NULL 
  AND link != ''
  AND file_name IS NOT NULL;

-- Fix before_content table links
UPDATE before_content
SET link = CASE 
    WHEN content_type = 'video' THEN '/api/uploads/videos/' || file_name
    ELSE '/api/uploads/before-content/' || file_name
  END
WHERE link NOT LIKE '/api/uploads/%' 
  AND link IS NOT NULL 
  AND link != ''
  AND file_name IS NOT NULL;

-- Verify the updates by checking a sample of records
SELECT 'Images updated' as status, COUNT(*) as count FROM images WHERE link LIKE '/api/uploads/images/%';
SELECT 'Videos updated' as status, COUNT(*) as count FROM videos WHERE link LIKE '/api/uploads/videos/%';
SELECT 'Final videos updated' as status, COUNT(*) as count FROM final_videos WHERE link LIKE '/api/uploads/final-videos/%';
SELECT 'Before content updated' as status, COUNT(*) as count FROM before_content WHERE link LIKE '/api/uploads/%';
