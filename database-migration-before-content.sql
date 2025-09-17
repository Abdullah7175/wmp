-- Migration script to rename before_images table to before_content and add content_type support
-- Run this script on your database to update the schema

-- Step 1: Rename the table from before_images to before_content
ALTER TABLE before_images RENAME TO before_content;

-- Step 2: Add content_type column to distinguish between images and videos
ALTER TABLE before_content ADD COLUMN content_type VARCHAR(10) DEFAULT 'image';

-- Step 3: Update existing records to have 'image' as content_type (since they were all images before)
UPDATE before_content SET content_type = 'image' WHERE content_type IS NULL;

-- Step 4: Make content_type NOT NULL after updating existing records
ALTER TABLE before_content ALTER COLUMN content_type SET NOT NULL;

-- Step 5: Add check constraint to ensure content_type is either 'image' or 'video'
ALTER TABLE before_content ADD CONSTRAINT check_content_type CHECK (content_type IN ('image', 'video'));

-- Step 6: Update any indexes or constraints that reference the old table name
-- (PostgreSQL will automatically update most references, but check for any custom ones)

-- Step 7: Update any views or functions that reference before_images table
-- You may need to recreate views that reference this table

-- Step 8: Grant permissions to the new table name (if needed)
-- GRANT ALL ON TABLE before_content TO your_user_role;

-- Verification queries:
-- SELECT * FROM before_content LIMIT 5;
-- SELECT content_type, COUNT(*) FROM before_content GROUP BY content_type;
