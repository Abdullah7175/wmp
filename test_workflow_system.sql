-- Test Workflow System
-- This script tests the complete workflow system to ensure everything is working

-- 1. Test file creation with workflow
DO $$
DECLARE
    new_file_id INTEGER;
    workflow_id INTEGER;
    current_stage_id INTEGER;
BEGIN
    -- Create a test file
    INSERT INTO efiling_files (
        file_number, subject, category_id, department_id, status_id,
        priority, confidentiality_level, created_by, assigned_to, remarks
    ) VALUES (
        'TEST/2024/0001', 'Test File for Workflow System', 
        (SELECT id FROM efiling_file_categories WHERE code = 'GEN_CORR' LIMIT 1),
        (SELECT id FROM efiling_departments WHERE code = 'ADMIN' LIMIT 1),
        (SELECT id FROM efiling_file_status WHERE code = 'DRAFT' LIMIT 1),
        'high', 'normal',
        (SELECT id FROM efiling_users WHERE employee_id = 'EMP001' LIMIT 1),
        (SELECT id FROM efiling_users WHERE employee_id = 'EMP002' LIMIT 1),
        'Test file to verify workflow system'
    ) RETURNING id INTO new_file_id;
    
    RAISE NOTICE 'Created test file with ID: %', new_file_id;
    
    -- Check if workflow was auto-assigned
    SELECT workflow_id, current_stage_id INTO workflow_id, current_stage_id
    FROM efiling_files WHERE id = new_file_id;
    
    IF workflow_id IS NOT NULL THEN
        RAISE NOTICE 'Workflow auto-assigned successfully. Workflow ID: %, Current Stage ID: %', workflow_id, current_stage_id;
        
        -- Check workflow instance
        IF EXISTS (SELECT 1 FROM efiling_file_workflows WHERE id = workflow_id) THEN
            RAISE NOTICE 'Workflow instance created successfully';
        ELSE
            RAISE NOTICE 'ERROR: Workflow instance not found';
        END IF;
        
        -- Check stage instance
        IF EXISTS (SELECT 1 FROM efiling_workflow_stage_instances WHERE workflow_id = workflow_id AND stage_id = current_stage_id) THEN
            RAISE NOTICE 'Stage instance created successfully';
        ELSE
            RAISE NOTICE 'ERROR: Stage instance not found';
        END IF;
        
    ELSE
        RAISE NOTICE 'No workflow was auto-assigned';
    END IF;
    
    -- Clean up test data
    DELETE FROM efiling_workflow_stage_instances WHERE workflow_id IN (
        SELECT id FROM efiling_file_workflows WHERE file_id = new_file_id
    );
    DELETE FROM efiling_file_workflows WHERE file_id = new_file_id;
    DELETE FROM efiling_files WHERE id = new_file_id;
    
    RAISE NOTICE 'Test completed and cleaned up';
END $$;

-- 2. Test workflow template retrieval
SELECT 'Testing Workflow Template Retrieval:' as test_info;
SELECT 
    wt.name as template_name,
    wt.description,
    COUNT(ws.id) as stage_count,
    MIN(ws.sla_hours) as min_sla,
    MAX(ws.sla_hours) as max_sla
FROM efiling_workflow_templates wt
LEFT JOIN efiling_workflow_stages ws ON wt.id = ws.template_id
WHERE wt.is_active = true
GROUP BY wt.id, wt.name, wt.description
ORDER BY wt.name;

-- 3. Test file category to workflow mapping
SELECT 'Testing File Category to Workflow Mapping:' as test_info;
SELECT 
    fc.name as category_name,
    fc.code as category_code,
    wt.name as workflow_template,
    COUNT(ws.id) as workflow_stages
FROM efiling_file_categories fc
LEFT JOIN efiling_workflow_templates wt ON fc.id = wt.file_type_id
LEFT JOIN efiling_workflow_stages ws ON wt.id = ws.template_id
WHERE fc.is_active = true
GROUP BY fc.id, fc.name, fc.code, wt.name
ORDER BY fc.name;

-- 4. Test user role assignments
SELECT 'Testing User Role Assignments:' as test_info;
SELECT 
    u.employee_id,
    u.designation,
    d.name as department,
    r.name as role,
    r.permissions
FROM efiling_users u
LEFT JOIN efiling_departments d ON u.department_id = d.id
LEFT JOIN efiling_roles r ON u.efiling_role_id = r.id
WHERE u.is_active = true
ORDER BY u.employee_id;

-- 5. Test database structure
SELECT 'Testing Database Structure:' as test_info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN (
    'efiling_files',
    'efiling_workflow_templates', 
    'efiling_workflow_stages',
    'efiling_file_workflows',
    'efiling_workflow_stage_instances'
)
AND column_name IN ('workflow_id', 'current_stage_id', 'template_id', 'stage_id')
ORDER BY table_name, column_name;

-- 6. Summary
SELECT 'Workflow System Test Summary:' as summary;
SELECT 
    (SELECT COUNT(*) FROM efiling_workflow_templates WHERE is_active = true) as active_templates,
    (SELECT COUNT(*) FROM efiling_workflow_stages) as total_stages,
    (SELECT COUNT(*) FROM efiling_file_categories WHERE is_active = true) as active_categories,
    (SELECT COUNT(*) FROM efiling_users WHERE is_active = true) as active_users,
    (SELECT COUNT(*) FROM efiling_departments WHERE is_active = true) as active_departments;
