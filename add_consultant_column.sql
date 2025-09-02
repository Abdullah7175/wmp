-- Add is_consultant column to efiling_users table
-- This column will distinguish between KWSC employees and consultants (third party users)

-- Add the new column
ALTER TABLE public.efiling_users 
ADD COLUMN is_consultant BOOLEAN DEFAULT FALSE;

-- Add comment for the new column
COMMENT ON COLUMN public.efiling_users.is_consultant IS 'Whether the user is a consultant (third party) or KWSC employee';

-- Create index for better query performance
CREATE INDEX idx_efiling_users_is_consultant ON public.efiling_users(is_consultant);

-- Update existing users to be KWSC employees by default (since they already have employee_id, designation, department_id)
-- This ensures backward compatibility
UPDATE public.efiling_users 
SET is_consultant = FALSE 
WHERE is_consultant IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.efiling_users 
ALTER COLUMN is_consultant SET NOT NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    col_description((table_schema||'.'||table_name)::regclass, ordinal_position) as comment
FROM information_schema.columns 
WHERE table_name = 'efiling_users' 
AND column_name = 'is_consultant';

-- Show sample data to verify
SELECT 
    id,
    name,
    employee_id,
    designation,
    department_id,
    is_consultant,
    created_at
FROM public.efiling_users 
LIMIT 5;
