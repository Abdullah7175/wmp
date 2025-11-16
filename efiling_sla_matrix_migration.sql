-- Migration: Replace efiling_marking_rules with simplified efiling_sla_matrix
-- This simplifies the marking system to be purely geography-based with SLA management

-- STEP 1: Drop the old efiling_marking_rules table
DROP TABLE IF EXISTS efiling_marking_rules CASCADE;

-- STEP 2: Create new simplified efiling_sla_matrix table
CREATE TABLE IF NOT EXISTS efiling_sla_matrix (
  id SERIAL PRIMARY KEY,
  from_role_code VARCHAR(100) NOT NULL,
  to_role_code VARCHAR(100) NOT NULL,
  level_scope VARCHAR(20) DEFAULT 'district', -- 'district' | 'division' | 'global'
  sla_hours INT DEFAULT 24,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT efiling_sla_matrix_unique UNIQUE (from_role_code, to_role_code)
);

COMMENT ON TABLE efiling_sla_matrix IS 'Defines SLA deadlines for role-to-role transitions (EE→SE, SE→CE, etc.)';
COMMENT ON COLUMN efiling_sla_matrix.level_scope IS 'Geographic scope: district (same district required), division (same division required), global (no geography restriction)';

-- STEP 3: Create index for faster lookups
CREATE INDEX idx_efiling_sla_matrix_from_role ON efiling_sla_matrix(from_role_code);
CREATE INDEX idx_efiling_sla_matrix_to_role ON efiling_sla_matrix(to_role_code);
CREATE INDEX idx_efiling_sla_matrix_active ON efiling_sla_matrix(is_active) WHERE is_active = true;

-- STEP 4: Insert default SLA matrix entries based on hierarchy
-- EE (Executive Engineer) → SE (Superintendent Engineer)
INSERT INTO efiling_sla_matrix (from_role_code, to_role_code, level_scope, sla_hours, description)
VALUES 
  ('WAT_XEN_*', 'SE_*', 'district', 24, 'EE Water marks to SE - same district required'),
  ('SEW_XEN_*', 'SE_*', 'district', 24, 'EE Sewerage marks to SE - same district required')
ON CONFLICT (from_role_code, to_role_code) DO NOTHING;

-- SE → CE (Chief Engineer)
INSERT INTO efiling_sla_matrix (from_role_code, to_role_code, level_scope, sla_hours, description)
VALUES 
  ('SE_*', 'CE_WAT', 'global', 24, 'SE marks to CE Water - global scope'),
  ('SE_*', 'CE_SEW', 'global', 24, 'SE marks to CE Sewerage - global scope')
ON CONFLICT (from_role_code, to_role_code) DO NOTHING;

-- CE → COO
INSERT INTO efiling_sla_matrix (from_role_code, to_role_code, level_scope, sla_hours, description)
VALUES 
  ('CE_WAT', 'COO', 'global', 48, 'CE Water marks to COO'),
  ('CE_SEW', 'COO', 'global', 48, 'CE Sewerage marks to COO')
ON CONFLICT (from_role_code, to_role_code) DO NOTHING;

-- COO → CEO
INSERT INTO efiling_sla_matrix (from_role_code, to_role_code, level_scope, sla_hours, description)
VALUES 
  ('COO', 'CEO', 'global', 72, 'COO marks to CEO')
ON CONFLICT (from_role_code, to_role_code) DO NOTHING;

-- CEO → CE (execution)
INSERT INTO efiling_sla_matrix (from_role_code, to_role_code, level_scope, sla_hours, description)
VALUES 
  ('CEO', 'CE_WAT', 'global', 24, 'CEO marks back to CE Water for execution'),
  ('CEO', 'CE_SEW', 'global', 24, 'CEO marks back to CE Sewerage for execution')
ON CONFLICT (from_role_code, to_role_code) DO NOTHING;

-- CE → XEN (execution)
INSERT INTO efiling_sla_matrix (from_role_code, to_role_code, level_scope, sla_hours, description)
VALUES 
  ('CE_WAT', 'WAT_XEN_*', 'district', 24, 'CE Water marks to EE for execution - same district'),
  ('CE_SEW', 'SEW_XEN_*', 'district', 24, 'CE Sewerage marks to EE for execution - same district')
ON CONFLICT (from_role_code, to_role_code) DO NOTHING;

-- For division-based departments (E&M Water Bulk, etc.)
-- EE E&M Water Bulk → SE E&M Water Bulk
INSERT INTO efiling_sla_matrix (from_role_code, to_role_code, level_scope, sla_hours, description)
VALUES 
  ('EE_EM_WB_*', 'SE_EM_WB_*', 'division', 24, 'EE E&M Water Bulk marks to SE - same division required')
ON CONFLICT (from_role_code, to_role_code) DO NOTHING;

-- Note: Use wildcard patterns like 'WAT_XEN_*' to match any role code starting with that prefix
-- Backend code will handle pattern matching when looking up SLA

