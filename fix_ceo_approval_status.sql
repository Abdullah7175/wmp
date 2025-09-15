-- Fix CEO Approval Status Issue
-- This script removes or updates any old CEO approval records that might be causing the "Pending CEO Approval" status

-- 1. Check if work_request_approvals table exists and clean it up
-- First, let's see what's in the work_request_approvals table
SELECT 'work_request_approvals table contents:' as info;
SELECT * FROM work_request_approvals LIMIT 10;

-- 2. Update any pending CEO approval records to approved (if you want to keep them)
-- Uncomment the following lines if you want to approve all pending CEO approvals:
-- UPDATE work_request_approvals 
-- SET approval_status = 'approved', 
--     approval_date = NOW(),
--     ceo_comments = 'Auto-approved during system cleanup'
-- WHERE approval_status = 'pending';

-- 3. Alternative: Delete all work_request_approvals records (if CEO approval is completely removed)
-- Uncomment the following lines if you want to completely remove CEO approval system:
-- DELETE FROM work_request_approvals;

-- 4. Check efiling_file_status table for any "Pending Approval" status
SELECT 'efiling_file_status table contents:' as info;
SELECT * FROM efiling_file_status WHERE name ILIKE '%pending%' OR name ILIKE '%approval%';

-- 5. Update efiling file status to remove CEO-specific approval
UPDATE efiling_file_status 
SET name = 'Pending Review', 
    description = 'File is pending review by assigned reviewer'
WHERE code = 'PENDING_APPROVAL' AND name = 'Pending Approval';

-- 6. Check if there are any work requests linked to efiling files with pending approval status
SELECT 'Work requests linked to efiling files with pending approval:' as info;
SELECT 
    wr.id as work_request_id,
    wr.description,
    ef.file_number,
    ef.subject,
    efs.name as status_name
FROM work_requests wr
JOIN efiling_files ef ON wr.id = ef.work_request_id
JOIN efiling_file_status efs ON ef.status_id = efs.id
WHERE efs.name ILIKE '%pending%' OR efs.name ILIKE '%approval%';

-- 7. Update work requests linked to efiling files to use a different status
-- Uncomment if you want to change the status of linked work requests:
-- UPDATE efiling_files 
-- SET status_id = (
--     SELECT id FROM efiling_file_status 
--     WHERE code = 'IN_PROGRESS' 
--     LIMIT 1
-- )
-- WHERE status_id IN (
--     SELECT id FROM efiling_file_status 
--     WHERE name ILIKE '%pending%' OR name ILIKE '%approval%'
-- );

-- 8. Verify the cleanup
SELECT 'Cleanup verification:' as info;
SELECT 
    'work_request_approvals' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_records
FROM work_request_approvals
UNION ALL
SELECT 
    'efiling_file_status' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN name ILIKE '%pending%' OR name ILIKE '%approval%' THEN 1 END) as pending_records
FROM efiling_file_status;
