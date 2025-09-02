-- Sample data for e-filing system testing

-- Insert sample departments
INSERT INTO public.efiling_departments (name, code, description, is_active) 
VALUES 
('Water Bulk Department', 'WBD', 'Department responsible for water bulk operations', true),
('Sewerage Department', 'SD', 'Department responsible for sewerage operations', true),
('Tender Department', 'TD', 'Department responsible for tender operations', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample file categories
INSERT INTO public.efiling_file_categories (name, code, description, department_id, is_work_related, is_active) 
VALUES 
('Water Bulk Work', 'WBW', 'Water bulk related work files', 1, true, true),
('Sewerage Work', 'SW', 'Sewerage related work files', 2, true, true),
('Tender Documents', 'TD', 'Tender and procurement files', 3, false, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample file types
INSERT INTO public.efiling_file_types (name, code, description, category_id, department_id, requires_approval, is_active) 
VALUES 
('Water Bulk Project', 'WBP', 'Water bulk project files', 1, 1, true, true),
('Sewerage Project', 'SP', 'Sewerage project files', 2, 2, true, true),
('Tender Document', 'TEND', 'Tender documents', 3, 3, true, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample file statuses
INSERT INTO public.efiling_file_status (name, code, description, color, is_active) 
VALUES 
('Draft', 'DRAFT', 'File is in draft status', '#FFA500', true),
('Pending Review', 'PENDING', 'File is pending review', '#FFD700', true),
('Under Review', 'REVIEW', 'File is under review', '#87CEEB', true),
('Approved', 'APPROVED', 'File has been approved', '#32CD32', true),
('Rejected', 'REJECTED', 'File has been rejected', '#FF6347', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample roles
INSERT INTO public.efiling_roles (name, code, description, department_id, permissions, is_active) 
VALUES 
('XEN', 'XEN', 'Executive Engineer role', 1, '{"can_create_files": true, "can_approve_files": true}', true),
('SE', 'SE', 'Sub Engineer role', 1, '{"can_create_files": true, "can_approve_files": false}', true),
('JE', 'JE', 'Junior Engineer role', 1, '{"can_create_files": true, "can_approve_files": false}', true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample workflow template
INSERT INTO public.efiling_workflow_templates (name, description, version, is_active, created_by) 
VALUES 
('Standard Water Bulk Workflow', 'Standard workflow for water bulk work files', '1.0', true, 1)
ON CONFLICT DO NOTHING;

-- Insert sample workflow stages
INSERT INTO public.efiling_workflow_stages (template_id, stage_name, stage_code, stage_order, description, stage_type, is_active) 
VALUES 
(1, 'File Creation', 'CREATE', 1, 'Initial file creation stage', 'CREATION', true),
(1, 'Initial Review', 'REVIEW', 2, 'Initial review by SE', 'REVIEW', true),
(1, 'XEN Approval', 'XEN_APPROVE', 3, 'Approval by XEN', 'APPROVAL', true),
(1, 'Final Review', 'FINAL', 4, 'Final review stage', 'REVIEW', true)
ON CONFLICT DO NOTHING;

-- Insert sample files (if you have users and departments)
INSERT INTO public.efiling_files (file_number, subject, category_id, department_id, status_id, priority, created_by, file_type_id) 
VALUES 
('WB-2024-001', 'Water Supply Project Phase 1', 1, 1, 1, 'high', 1, 1),
('WB-2024-002', 'Pipeline Maintenance Work', 1, 1, 2, 'normal', 1, 1),
('SEW-2024-001', 'Sewerage Line Extension', 2, 2, 1, 'high', 1, 2)
ON CONFLICT (file_number) DO NOTHING;

