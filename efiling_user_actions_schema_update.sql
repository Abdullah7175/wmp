-- SQL Commands to Update efiling_user_actions Table
-- This will add missing fields to match the comprehensive schema of user_actions table

-- 1. Add missing columns to efiling_user_actions table
ALTER TABLE efiling_user_actions 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_role INTEGER,
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS entity_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS details JSONB,
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update existing records to set default values for new columns
UPDATE efiling_user_actions 
SET 
    user_type = 'efiling_user',
    user_role = 0,
    user_name = 'Unknown User',
    user_email = 'unknown@example.com',
    entity_type = 'efiling_file',
    entity_name = 'E-Filing File',
    details = '{}',
    ip_address = NULL,
    user_agent = NULL,
    updated_at = NOW()
WHERE user_type IS NULL;

-- 3. Make required columns NOT NULL after setting default values
ALTER TABLE efiling_user_actions 
ALTER COLUMN user_type SET NOT NULL,
ALTER COLUMN user_role SET NOT NULL,
ALTER COLUMN user_name SET NOT NULL,
ALTER COLUMN user_email SET NOT NULL,
ALTER COLUMN entity_type SET NOT NULL;

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_user_type ON efiling_user_actions(user_type);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_user_role ON efiling_user_actions(user_role);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_entity_type ON efiling_user_actions(entity_type);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_entity_id ON efiling_user_actions(entity_id);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_updated_at ON efiling_user_actions(updated_at);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_user_type_role ON efiling_user_actions(user_type, user_role);

-- 5. Add comments for documentation
COMMENT ON COLUMN efiling_user_actions.user_type IS 'Type of user: efiling_user, efiling_admin, efiling_manager, etc.';
COMMENT ON COLUMN efiling_user_actions.user_role IS 'Role ID of the user in the e-filing system';
COMMENT ON COLUMN efiling_user_actions.user_name IS 'Full name of the user performing the action';
COMMENT ON COLUMN efiling_user_actions.user_email IS 'Email address of the user performing the action';
COMMENT ON COLUMN efiling_user_actions.entity_type IS 'Type of entity being acted upon: efiling_file, efiling_department, efiling_role, etc.';
COMMENT ON COLUMN efiling_user_actions.entity_name IS 'Name or title of the entity being acted upon';
COMMENT ON COLUMN efiling_user_actions.details IS 'JSON object containing additional details about the action';
COMMENT ON COLUMN efiling_user_actions.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN efiling_user_actions.user_agent IS 'User agent string of the browser/client used';
COMMENT ON COLUMN efiling_user_actions.updated_at IS 'Timestamp when the record was last updated';

-- 6. Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_efiling_user_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_efiling_user_actions_updated_at
    BEFORE UPDATE ON efiling_user_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_efiling_user_actions_updated_at();

-- 7. Update the table comment
COMMENT ON TABLE efiling_user_actions IS 'Comprehensive logging of all user actions in the e-filing system for audit and tracking purposes';

-- 8. Verify the updated table structure
-- You can run this query to see the final table structure:
-- \d efiling_user_actions
