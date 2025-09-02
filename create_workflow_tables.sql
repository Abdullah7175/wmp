-- Create missing workflow tables for e-filing system

-- 1. Workflow Templates Table
CREATE TABLE IF NOT EXISTS efiling_workflow_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_type_id INTEGER REFERENCES efiling_file_types(id),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES efiling_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workflow Stages Table
CREATE TABLE IF NOT EXISTS efiling_workflow_stages (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES efiling_workflow_templates(id) ON DELETE CASCADE,
    stage_name VARCHAR(255) NOT NULL,
    stage_code VARCHAR(50) NOT NULL,
    stage_order INTEGER NOT NULL,
    department_id INTEGER REFERENCES efiling_departments(id),
    role_id INTEGER REFERENCES efiling_roles(id),
    sla_hours INTEGER DEFAULT 24,
    requirements TEXT,
    can_attach_files BOOLEAN DEFAULT true,
    can_comment BOOLEAN DEFAULT true,
    can_escalate BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, stage_order)
);

-- 3. File Workflows Table
CREATE TABLE IF NOT EXISTS efiling_file_workflows (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES efiling_files(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES efiling_workflow_templates(id),
    workflow_status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED, PAUSED
    current_stage_id INTEGER REFERENCES efiling_workflow_stages(id),
    current_assignee_id INTEGER REFERENCES efiling_users(id),
    created_by INTEGER REFERENCES efiling_users(id),
    sla_deadline TIMESTAMP,
    sla_breached BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(file_id)
);

-- 4. Workflow Stage Instances Table
CREATE TABLE IF NOT EXISTS efiling_workflow_stage_instances (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES efiling_file_workflows(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES efiling_workflow_stages(id),
    stage_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, ESCALATED, TIMEOUT
    assigned_to INTEGER REFERENCES efiling_users(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    sla_deadline TIMESTAMP,
    sla_breached BOOLEAN DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Workflow Actions Table
CREATE TABLE IF NOT EXISTS efiling_workflow_actions (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES efiling_file_workflows(id) ON DELETE CASCADE,
    stage_instance_id INTEGER REFERENCES efiling_workflow_stage_instances(id),
    action_type VARCHAR(100) NOT NULL, -- approve, reject, forward, return, escalate, comment
    action_data JSONB,
    performed_by INTEGER REFERENCES efiling_users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- 6. File Types Table (if not exists)
CREATE TABLE IF NOT EXISTS efiling_file_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES efiling_departments(id),
    requires_approval BOOLEAN DEFAULT false,
    auto_assign BOOLEAN DEFAULT false,
    workflow_template_id INTEGER REFERENCES efiling_workflow_templates(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_efiling_workflow_templates_file_type ON efiling_workflow_templates(file_type_id);
CREATE INDEX idx_efiling_workflow_templates_created_by ON efiling_workflow_templates(created_by);
CREATE INDEX idx_efiling_workflow_stages_template ON efiling_workflow_stages(template_id);
CREATE INDEX idx_efiling_workflow_stages_department ON efiling_workflow_stages(department_id);
CREATE INDEX idx_efiling_workflow_stages_role ON efiling_workflow_stages(role_id);
CREATE INDEX idx_efiling_file_workflows_file ON efiling_file_workflows(file_id);
CREATE INDEX idx_efiling_file_workflows_template ON efiling_file_workflows(template_id);
CREATE INDEX idx_efiling_file_workflows_status ON efiling_file_workflows(workflow_status);
CREATE INDEX idx_efiling_file_workflows_assignee ON efiling_file_workflows(current_assignee_id);
CREATE INDEX idx_efiling_file_workflows_created_by ON efiling_file_workflows(created_by);
CREATE INDEX idx_efiling_workflow_stage_instances_workflow ON efiling_workflow_stage_instances(workflow_id);
CREATE INDEX idx_efiling_workflow_stage_instances_stage ON efiling_workflow_stage_instances(stage_id);
CREATE INDEX idx_efiling_workflow_stage_instances_status ON efiling_workflow_stage_instances(stage_status);
CREATE INDEX idx_efiling_workflow_stage_instances_assignee ON efiling_workflow_stage_instances(assigned_to);
CREATE INDEX idx_efiling_workflow_actions_workflow ON efiling_workflow_actions(workflow_id);
CREATE INDEX idx_efiling_workflow_actions_stage_instance ON efiling_workflow_actions(stage_instance_id);
CREATE INDEX idx_efiling_workflow_actions_performed_by ON efiling_workflow_actions(performed_by);
CREATE INDEX idx_efiling_file_types_department ON efiling_file_types(department_id);
CREATE INDEX idx_efiling_file_types_workflow_template ON efiling_file_types(workflow_template_id);

-- Add comments for documentation
COMMENT ON TABLE efiling_workflow_templates IS 'Defines workflow templates for different file types';
COMMENT ON TABLE efiling_workflow_stages IS 'Defines stages within workflow templates';
COMMENT ON TABLE efiling_file_workflows IS 'Tracks active workflows for individual files';
COMMENT ON TABLE efiling_workflow_stage_instances IS 'Tracks individual stage instances within workflows';
COMMENT ON TABLE efiling_workflow_actions IS 'Logs all actions performed within workflows';
COMMENT ON TABLE efiling_file_types IS 'Defines different types of files and their workflow requirements';

