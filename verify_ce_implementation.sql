-- Verification script for CE implementation
-- This script verifies that CE users are properly set up and linked

-- 1. Check if ce_users and ce_user_departments tables exist and have correct structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('ce_users', 'ce_user_departments')
ORDER BY table_name, ordinal_position;

-- 2. Check if work_request_soft_approvals table exists (used for CE approvals)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'work_request_soft_approvals' 
ORDER BY ordinal_position;

-- 3. Verify CE users are created with role 7 and their department assignments
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    cu.designation,
    cu.address,
    ARRAY_AGG(ct.type_name) as assigned_departments
FROM users u
LEFT JOIN ce_users cu ON u.id = cu.user_id
LEFT JOIN ce_user_departments cud ON cu.id = cud.ce_user_id
LEFT JOIN complaint_types ct ON cud.complaint_type_id = ct.id
WHERE u.role = 7
GROUP BY u.id, u.name, u.email, u.role, cu.designation, cu.address
ORDER BY u.name;

-- 4. Check if there are any users with role 7 but no ce_users record
SELECT 
    u.id,
    u.name,
    u.email,
    u.role
FROM users u
WHERE u.role = 7 
AND u.id NOT IN (SELECT user_id FROM ce_users WHERE user_id IS NOT NULL);

-- 5. Check if there are any ce_users records without corresponding users
SELECT 
    cu.user_id,
    cu.department,
    cu.designation
FROM ce_users cu
WHERE cu.user_id NOT IN (SELECT id FROM users WHERE role = 7);

-- 6. Verify department assignments
SELECT 
    department,
    COUNT(*) as user_count
FROM ce_users
GROUP BY department
ORDER BY department;

-- 7. Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('ce_users', 'work_request_soft_approvals')
    AND (kcu.column_name LIKE '%ce%' OR ccu.table_name = 'users');

-- 8. Check indexes for performance
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename IN ('ce_users', 'work_request_soft_approvals')
AND (indexname LIKE '%ce%' OR indexname LIKE '%approval%')
ORDER BY tablename, indexname;

-- 9. Sample data verification
SELECT 
    'Sample CE Users' as check_type,
    COUNT(*) as count
FROM users u
JOIN ce_users cu ON u.id = cu.user_id
WHERE u.role = 7

UNION ALL

SELECT 
    'Water CE Users' as check_type,
    COUNT(*) as count
FROM users u
JOIN ce_users cu ON u.id = cu.user_id
WHERE u.role = 7 AND cu.department = 'water'

UNION ALL

SELECT 
    'Sewerage CE Users' as check_type,
    COUNT(*) as count
FROM users u
JOIN ce_users cu ON u.id = cu.user_id
WHERE u.role = 7 AND cu.department = 'sewerage';

-- 10. Check if any requests have CE approval data
SELECT 
    COUNT(*) as total_requests,
    COUNT(ce_approval.approval_status) as requests_with_ce_status,
    COUNT(CASE WHEN ce_approval.approval_status = 'approved' THEN 1 END) as ce_approved,
    COUNT(CASE WHEN ce_approval.approval_status = 'rejected' THEN 1 END) as ce_rejected,
    COUNT(CASE WHEN ce_approval.approval_status = 'pending' THEN 1 END) as ce_pending
FROM requests r
LEFT JOIN work_request_soft_approvals ce_approval ON r.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce';
