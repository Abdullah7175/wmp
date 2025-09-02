-- Complete Workflow System Setup for E-Filing
-- This script sets up all necessary tables and sample data for the workflow system

-- 1. First, ensure all workflow tables exist
\i create_workflow_tables.sql

-- 2. Add missing columns to efiling_files table
\i add_missing_columns.sql

-- 3. Insert sample workflow templates
INSERT INTO efiling_workflow_templates (name, description, file_type_id, is_active, created_by, created_at) VALUES
('Standard Approval Workflow', 'Standard workflow for file approval process', NULL, true, 1, NOW()),
('Urgent File Workflow', 'Expedited workflow for urgent files', NULL, true, 1, NOW()),
('Department Review Workflow', 'Workflow requiring department head review', NULL, true, 1, NOW())
ON CONFLICT DO NOTHING;

-- 4. Insert sample workflow stages
INSERT INTO efiling_workflow_stages (
    template_id, stage_name, stage_code, stage_order, 
    department_id, role_id, sla_hours, requirements,
    can_attach_files, can_comment, can_escalate, created_at
) VALUES
-- Standard Approval Workflow Stages
(1, 'Initial Review', 'INITIAL_REVIEW', 1, 1, 1, 24, '{"required_fields": ["subject", "category"]}', true, true, false, NOW()),
(1, 'Department Approval', 'DEPT_APPROVAL', 2, 1, 2, 48, '{"required_actions": ["approve", "reject"]}', true, true, true, NOW()),
(1, 'Final Approval', 'FINAL_APPROVAL', 3, 1, 3, 24, '{"required_actions": ["approve", "reject"]}', true, true, false, NOW()),

-- Urgent File Workflow Stages
(2, 'Urgent Review', 'URGENT_REVIEW', 1, 1, 2, 4, '{"required_actions": ["approve", "reject"]}', true, true, true, NOW()),
(2, 'Immediate Processing', 'IMMEDIATE_PROCESSING', 2, 1, 1, 8, '{"required_actions": ["complete"]}', true, true, false, NOW()),

-- Department Review Workflow Stages
(3, 'Staff Review', 'STAFF_REVIEW', 1, 1, 1, 24, '{"required_fields": ["subject", "category", "remarks"]}', true, true, false, NOW()),
(3, 'Department Head Review', 'DEPT_HEAD_REVIEW', 2, 1, 3, 48, '{"required_actions": ["approve", "reject", "request_changes"]}', true, true, true, NOW()),
(3, 'Implementation', 'IMPLEMENTATION', 3, 1, 1, 72, '{"required_actions": ["complete"]}', true, true, false, NOW())
ON CONFLICT DO NOTHING;

-- 5. Insert sample file types (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'efiling_file_types') THEN
        INSERT INTO efiling_file_types (name, code, description, department_id, requires_approval, auto_assign, is_active, created_at) VALUES
        ('General Correspondence', 'GEN_CORR', 'General correspondence and letters', 1, true, true, true, NOW()),
        ('Policy Document', 'POLICY_DOC', 'Policy and procedure documents', 1, true, true, true, NOW()),
        ('Financial Request', 'FIN_REQUEST', 'Financial and budget requests', 2, true, true, true, NOW()),
        ('Technical Report', 'TECH_REPORT', 'Technical and engineering reports', 3, true, true, true, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 6. Insert sample file categories (if not already populated)
INSERT INTO efiling_file_categories (name, code, description, department_id, is_work_related, is_active, created_at) VALUES
('General Correspondence', 'GEN_CORR', 'General correspondence and letters', 1, false, true, NOW()),
('Policy Documents', 'POLICY_DOC', 'Policy and procedure documents', 1, true, true, NOW()),
('Financial Requests', 'FIN_REQUEST', 'Financial and budget requests', 2, true, true, NOW()),
('Technical Reports', 'TECH_REPORT', 'Technical and engineering reports', 3, true, true, NOW()),
('Work Orders', 'WORK_ORDER', 'Work orders and assignments', 1, true, true, NOW()),
('Complaints', 'COMPLAINT', 'Complaint and grievance files', 1, false, true, NOW())
ON CONFLICT DO NOTHING;

-- 7. Insert sample departments (if not already populated)
INSERT INTO efiling_departments (name, code, description, is_active, created_at) VALUES
('Administration', 'ADMIN', 'Administrative Department', true, NOW()),
('Finance', 'FIN', 'Finance and Budget Department', true, NOW()),
('Information Technology', 'IT', 'IT and Technical Services', true, NOW()),
('Human Resources', 'HR', 'Human Resources Department', true, NOW()),
('Operations', 'OPS', 'Operations and Maintenance', true, NOW())
ON CONFLICT DO NOTHING;

-- 8. Insert sample roles (if not already populated)
INSERT INTO efiling_roles (name, code, description, department_id, permissions, is_active, created_at) VALUES
('File Clerk', 'FILE_CLERK', 'Basic file management and routing', 1, '{"can_create_files": true, "can_view_files": true, "can_route_files": true}', true, NOW()),
('File Officer', 'FILE_OFFICER', 'File review and approval', 1, '{"can_create_files": true, "can_view_files": true, "can_route_files": true, "can_approve_files": true}', true, NOW()),
('Department Head', 'DEPT_HEAD', 'Department-level approval and oversight', 1, '{"can_create_files": true, "can_view_files": true, "can_route_files": true, "can_approve_files": true, "can_manage_workflows": true}', true, NOW()),
('Finance Officer', 'FIN_OFFICER', 'Financial file review and approval', 2, '{"can_create_files": true, "can_view_files": true, "can_route_files": true, "can_approve_files": true}', true, NOW()),
('Technical Officer', 'TECH_OFFICER', 'Technical file review and approval', 3, '{"can_create_files": true, "can_view_files": true, "can_route_files": true, "can_approve_files": true}', true, NOW())
ON CONFLICT DO NOTHING;

-- 9. Insert sample e-filing users (if not already populated)
INSERT INTO efiling_users (user_id, employee_id, designation, department_id, efiling_role_id, is_active, created_at) VALUES
(1, 'EMP001', 'File Clerk', 1, 1, true, NOW()),
(2, 'EMP002', 'File Officer', 1, 2, true, NOW()),
(3, 'EMP003', 'Department Head', 1, 3, true, NOW()),
(4, 'EMP004', 'Finance Officer', 2, 4, true, NOW()),
(5, 'EMP005', 'Technical Officer', 3, 5, true, NOW())
ON CONFLICT DO NOTHING;

-- 10. Create sample workflow template assignments
-- Link workflow templates to file categories
UPDATE efiling_workflow_templates 
SET file_type_id = (SELECT id FROM efiling_file_categories WHERE code = 'GEN_CORR' LIMIT 1)
WHERE name = 'Standard Approval Workflow';

UPDATE efiling_workflow_templates 
SET file_type_id = (SELECT id FROM efiling_file_categories WHERE code = 'WORK_ORDER' LIMIT 1)
WHERE name = 'Urgent File Workflow';

UPDATE efiling_workflow_templates 
SET file_type_id = (SELECT id FROM efiling_file_categories WHERE code = 'POLICY_DOC' LIMIT 1)
WHERE name = 'Department Review Workflow';

-- 11. Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_efiling_workflow_templates_file_type ON efiling_workflow_templates(file_type_id);
CREATE INDEX IF NOT EXISTS idx_efiling_workflow_stages_template ON efiling_workflow_stages(template_id);
CREATE INDEX IF NOT EXISTS idx_efiling_file_workflows_file ON efiling_file_workflows(file_id);
CREATE INDEX IF NOT EXISTS idx_efiling_workflow_stage_instances_workflow ON efiling_workflow_stage_instances(workflow_id);

-- 12. Verify the setup
SELECT 'Workflow System Setup Complete' as status;

-- Show created workflow templates
SELECT 'Workflow Templates:' as info;
SELECT id, name, description, file_type_id FROM efiling_workflow_templates;

-- Show created workflow stages
SELECT 'Workflow Stages:' as info;
SELECT template_id, stage_name, stage_code, stage_order, sla_hours FROM efiling_workflow_stages ORDER BY template_id, stage_order;

-- Show file categories
SELECT 'File Categories:' as info;
SELECT id, name, code, department_id FROM efiling_file_categories;
