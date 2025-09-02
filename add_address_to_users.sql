-- Add address column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment to the column
COMMENT ON COLUMN users.address IS 'User address information';

-- Update existing users with empty address if needed
UPDATE users SET address = '' WHERE address IS NULL;
