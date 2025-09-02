-- Add address column to efiling_users table
ALTER TABLE efiling_users ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment to the column
COMMENT ON COLUMN efiling_users.address IS 'User address information';

-- Update existing users with empty address if needed
UPDATE efiling_users SET address = '' WHERE address IS NULL;
