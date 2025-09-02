-- Fix the efiling_user_actions table schema
-- This script makes the file_id column nullable since not all actions are file-related

-- 1. Make file_id column nullable (since login/logout actions don't have files)
ALTER TABLE efiling_user_actions ALTER COLUMN file_id DROP NOT NULL;

-- 2. Add a comment explaining the change
COMMENT ON COLUMN efiling_user_actions.file_id IS 'File ID for file-related actions, NULL for system/auth actions like login/logout';

-- 3. Verify the change
-- \d efiling_user_actions
