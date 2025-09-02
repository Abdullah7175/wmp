-- E-Filing Module Database Structure
-- Following Sindh and Federal Government of Pakistan standards

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS efiling_departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_department_id INTEGER REFERENCES efiling_departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. E-Filing Roles Table
CREATE TABLE IF NOT EXISTS efiling_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES efiling_departments(id),
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. E-Filing Users Table (extends existing users)
CREATE TABLE IF NOT EXISTS efiling_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    designation VARCHAR(255),
    department_id INTEGER REFERENCES efiling_departments(id),
    efiling_role_id INTEGER REFERENCES efiling_roles(id),
    supervisor_id INTEGER REFERENCES efiling_users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. File Categories Table
CREATE TABLE IF NOT EXISTS efiling_file_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    department_id INTEGER REFERENCES efiling_departments(id),
    is_work_related BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. File Status Table
CREATE TABLE IF NOT EXISTS efiling_file_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#000000',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. E-Files Table
CREATE TABLE IF NOT EXISTS efiling_files (
    id SERIAL PRIMARY KEY,
    file_number VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    category_id INTEGER REFERENCES efiling_file_categories(id),
    department_id INTEGER REFERENCES efiling_departments(id),
    status_id INTEGER REFERENCES efiling_file_status(id),
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    confidentiality_level VARCHAR(20) DEFAULT 'normal', -- normal, confidential, secret, top_secret
    work_request_id INTEGER REFERENCES work_requests(id), -- Link to work requests
    created_by INTEGER REFERENCES efiling_users(id),
    assigned_to INTEGER REFERENCES efiling_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    remarks TEXT
);

-- 7. File Documents Table
CREATE TABLE IF NOT EXISTS efiling_documents (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES efiling_files(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- incoming, outgoing, internal, attachment
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES efiling_users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 8. File Movement/History Table
CREATE TABLE IF NOT EXISTS efiling_file_movements (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES efiling_files(id) ON DELETE CASCADE,
    from_user_id INTEGER REFERENCES efiling_users(id),
    to_user_id INTEGER REFERENCES efiling_users(id),
    from_department_id INTEGER REFERENCES efiling_departments(id),
    to_department_id INTEGER REFERENCES efiling_departments(id),
    action_type VARCHAR(50) NOT NULL, -- forward, return, close, reopen, etc.
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. File Comments/Notes Table
CREATE TABLE IF NOT EXISTS efiling_comments (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES efiling_files(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES efiling_users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. E-Filing Tools Table
CREATE TABLE IF NOT EXISTS efiling_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tool_type VARCHAR(50) NOT NULL, -- marker, pencil, auto_paragraph, stamp, signature
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. User Tool Permissions Table
CREATE TABLE IF NOT EXISTS efiling_user_tools (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES efiling_users(id),
    tool_id INTEGER REFERENCES efiling_tools(id),
    can_use BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tool_id)
);

-- 12. File Templates Table
CREATE TABLE IF NOT EXISTS efiling_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES efiling_file_categories(id),
    template_content TEXT,
    variables JSONB, -- Template variables
    created_by INTEGER REFERENCES efiling_users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data

-- Default File Statuses
INSERT INTO efiling_file_status (name, code, description, color) VALUES
('Draft', 'DRAFT', 'File is in draft stage', '#6B7280'),
('Pending', 'PENDING', 'File is pending for action', '#F59E0B'),
('In Progress', 'IN_PROGRESS', 'File is being processed', '#3B82F6'),
('Under Review', 'UNDER_REVIEW', 'File is under review', '#8B5CF6'),
('Approved', 'APPROVED', 'File has been approved', '#10B981'),
('Rejected', 'REJECTED', 'File has been rejected', '#EF4444'),
('Closed', 'CLOSED', 'File has been closed', '#374151'),
('Archived', 'ARCHIVED', 'File has been archived', '#9CA3AF');

-- Default E-Filing Tools
INSERT INTO efiling_tools (name, tool_type, description, icon) VALUES
('Highlighter', 'marker', 'Highlight important text in documents', 'highlighter'),
('Pencil Tool', 'pencil', 'Draw and annotate on documents', 'pencil'),
('Auto Paragraph', 'auto_paragraph', 'Generate automatic paragraphs', 'text'),
('Digital Stamp', 'stamp', 'Apply official stamps', 'stamp'),
('Digital Signature', 'signature', 'Apply digital signatures', 'signature'),
('Text Box', 'text_box', 'Add text boxes to documents', 'text-box'),
('Shape Tool', 'shape', 'Add shapes and diagrams', 'shapes'),
('Redaction Tool', 'redaction', 'Redact sensitive information', 'eye-off');

-- Create indexes for better performance
CREATE INDEX idx_efiling_files_department ON efiling_files(department_id);
CREATE INDEX idx_efiling_files_status ON efiling_files(status_id);
CREATE INDEX idx_efiling_files_created_by ON efiling_files(created_by);
CREATE INDEX idx_efiling_files_assigned_to ON efiling_files(assigned_to);
CREATE INDEX idx_efiling_files_work_request ON efiling_files(work_request_id);
CREATE INDEX idx_efiling_file_movements_file ON efiling_file_movements(file_id);
CREATE INDEX idx_efiling_documents_file ON efiling_documents(file_id);
CREATE INDEX idx_efiling_users_department ON efiling_users(department_id);
CREATE INDEX idx_efiling_users_role ON efiling_users(efiling_role_id); 