-- Check and fix efiling_user_actions table schema
-- This script ensures all required columns exist with correct data types

-- 1. Check if the table exists, if not create it
CREATE TABLE IF NOT EXISTS efiling_user_actions (
    id SERIAL PRIMARY KEY,
    file_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    user_type VARCHAR(50) DEFAULT 'efiling_user',
    user_role INTEGER DEFAULT 0,
    user_name VARCHAR(255) DEFAULT 'Unknown User',
    user_email VARCHAR(255) DEFAULT 'unknown@example.com',
    entity_type VARCHAR(100) DEFAULT 'efiling_file',
    entity_name VARCHAR(255) DEFAULT 'E-Filing File',
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add user_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'user_type') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN user_type VARCHAR(50) DEFAULT 'efiling_user';
    END IF;
    
    -- Add user_role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'user_role') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN user_role INTEGER DEFAULT 0;
    END IF;
    
    -- Add user_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'user_name') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN user_name VARCHAR(255) DEFAULT 'Unknown User';
    END IF;
    
    -- Add user_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'user_email') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN user_email VARCHAR(255) DEFAULT 'unknown@example.com';
    END IF;
    
    -- Add entity_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'entity_type') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN entity_type VARCHAR(100) DEFAULT 'efiling_file';
    END IF;
    
    -- Add entity_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'entity_name') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN entity_name VARCHAR(255) DEFAULT 'E-Filing File';
    END IF;
    
    -- Add details column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'details') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN details JSONB DEFAULT '{}';
    END IF;
    
    -- Add ip_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'ip_address') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN ip_address INET;
    END IF;
    
    -- Add user_agent column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'user_agent') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN user_agent TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'efiling_user_actions' AND column_name = 'updated_at') THEN
        ALTER TABLE efiling_user_actions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Update existing records with default values for new columns
UPDATE efiling_user_actions 
SET 
    user_type = COALESCE(user_type, 'efiling_user'),
    user_role = COALESCE(user_role, 0),
    user_name = COALESCE(user_name, 'Unknown User'),
    user_email = COALESCE(user_email, 'unknown@example.com'),
    entity_type = COALESCE(entity_type, 'efiling_file'),
    entity_name = COALESCE(entity_name, 'E-Filing File'),
    details = COALESCE(details, '{}'),
    updated_at = COALESCE(updated_at, NOW())
WHERE user_type IS NULL OR user_role IS NULL OR user_name IS NULL OR user_email IS NULL OR entity_type IS NULL OR entity_name IS NULL OR details IS NULL OR updated_at IS NULL;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_user_id ON efiling_user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_action_type ON efiling_user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_timestamp ON efiling_user_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_user_type ON efiling_user_actions(user_type);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_user_role ON efiling_user_actions(user_role);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_entity_type ON efiling_user_actions(entity_type);

-- 5. Add comments for documentation
COMMENT ON TABLE efiling_user_actions IS 'Comprehensive logging of all user actions in the e-filing system for audit and tracking purposes';
COMMENT ON COLUMN efiling_user_actions.user_id IS 'User ID as VARCHAR to match the column type';
COMMENT ON COLUMN efiling_user_actions.user_type IS 'Type of user: efiling_user, efiling_admin, efiling_manager, etc.';
COMMENT ON COLUMN efiling_user_actions.user_role IS 'Role ID of the user in the e-filing system';
COMMENT ON COLUMN efiling_user_actions.user_name IS 'Full name of the user performing the action';
COMMENT ON COLUMN efiling_user_actions.user_email IS 'Email address of the user performing the action';
COMMENT ON COLUMN efiling_user_actions.entity_type IS 'Type of entity being acted upon: efiling_file, efiling_department, efiling_role, etc.';
COMMENT ON COLUMN efiling_user_actions.entity_name IS 'Name or title of the entity being acted upon';
COMMENT ON COLUMN efiling_user_actions.details IS 'JSON object containing additional details about the action';
COMMENT ON COLUMN efiling_user_actions.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN efiling_user_actions.user_agent IS 'User agent string of the browser/client used';

-- 6. Verify the table structure
-- \d efiling_user_actions
