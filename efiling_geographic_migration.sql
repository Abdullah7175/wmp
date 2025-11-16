-- =====================================================
-- EFILING SYSTEM: GEOGRAPHIC ROUTING MIGRATION SQL
-- =====================================================
-- This script adds geographic location support to replace workflow-based routing
-- Execute these commands in order

-- =====================================================
-- STEP 1: Create divisions table for division-based departments
-- =====================================================

CREATE TABLE IF NOT EXISTS divisions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  ce_type VARCHAR(100), -- e.g., 'E&M Water Bulk', 'E&M Sewerage', 'Bulk Transmission', 'WTM'
  department_id INT REFERENCES efiling_departments(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE divisions IS 'Division-based organizational units (E&M Water Bulk, Sewerage, Bulk Transmission, WTM)';

CREATE INDEX idx_divisions_ce_type ON divisions(ce_type);
CREATE INDEX idx_divisions_department ON divisions(department_id);
CREATE INDEX idx_divisions_active ON divisions(is_active) WHERE is_active = true;

-- =====================================================
-- STEP 2: Add geographic location columns to efiling_users
-- =====================================================

ALTER TABLE efiling_users
ADD COLUMN IF NOT EXISTS district_id INT NULL REFERENCES district(id),
ADD COLUMN IF NOT EXISTS town_id INT NULL REFERENCES town(id),
ADD COLUMN IF NOT EXISTS subtown_id INT NULL REFERENCES subtown(id),
ADD COLUMN IF NOT EXISTS division_id INT NULL REFERENCES divisions(id);

COMMENT ON COLUMN efiling_users.district_id IS 'District assignment for district-based users (Water/Sewerage)';
COMMENT ON COLUMN efiling_users.town_id IS 'Town assignment for town-based users';
COMMENT ON COLUMN efiling_users.subtown_id IS 'Subtown assignment for subtown-based users';
COMMENT ON COLUMN efiling_users.division_id IS 'Division assignment for division-based users (E&M, Bulk Transmission, WTM)';

CREATE INDEX idx_efiling_users_district ON efiling_users(district_id);
CREATE INDEX idx_efiling_users_town ON efiling_users(town_id);
CREATE INDEX idx_efiling_users_subtown ON efiling_users(subtown_id);
CREATE INDEX idx_efiling_users_division ON efiling_users(division_id);
CREATE INDEX idx_efiling_users_location ON efiling_users(district_id, town_id, division_id);

-- =====================================================
-- STEP 3: Add geographic location columns to efiling_files
-- =====================================================

ALTER TABLE efiling_files
ADD COLUMN IF NOT EXISTS district_id INT NULL REFERENCES district(id),
ADD COLUMN IF NOT EXISTS town_id INT NULL REFERENCES town(id),
ADD COLUMN IF NOT EXISTS division_id INT NULL REFERENCES divisions(id);

COMMENT ON COLUMN efiling_files.district_id IS 'District where file is located/created';
COMMENT ON COLUMN efiling_files.town_id IS 'Town where file is located/created';
COMMENT ON COLUMN efiling_files.division_id IS 'Division where file is located/created (for division-based files)';

CREATE INDEX idx_efiling_files_district ON efiling_files(district_id);
CREATE INDEX idx_efiling_files_town ON efiling_files(town_id);
CREATE INDEX idx_efiling_files_division ON efiling_files(division_id);
CREATE INDEX idx_efiling_files_location ON efiling_files(district_id, town_id, division_id);

-- =====================================================
-- STEP 4: Create marking rules table (replaces workflow stages)
-- =====================================================

CREATE TABLE IF NOT EXISTS efiling_marking_rules (
  id SERIAL PRIMARY KEY,
  from_role_id INT NOT NULL REFERENCES efiling_roles(id),
  to_role_id INT NOT NULL REFERENCES efiling_roles(id),
  department_id INT NULL REFERENCES efiling_departments(id), -- NULL = applies to all departments
  file_type_id INT NULL REFERENCES efiling_file_types(id), -- NULL = applies to all file types
  level_scope VARCHAR(20) DEFAULT 'district', -- 'district' / 'town' / 'division' / 'global'
  require_same_location BOOLEAN DEFAULT true, -- If true, enforce geographic matching
  sla_hours INT DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT efiling_marking_rules_unique UNIQUE (from_role_id, to_role_id, department_id, file_type_id)
);

COMMENT ON TABLE efiling_marking_rules IS 'Defines which roles can mark files to which roles, with geographic and departmental constraints';
COMMENT ON COLUMN efiling_marking_rules.level_scope IS 'Geographic scope: district, town, division, or global (no restriction)';
COMMENT ON COLUMN efiling_marking_rules.require_same_location IS 'If true, users must be in same district/town/division to mark';

CREATE INDEX idx_marking_rules_from_role ON efiling_marking_rules(from_role_id, is_active);
CREATE INDEX idx_marking_rules_to_role ON efiling_marking_rules(to_role_id, is_active);
CREATE INDEX idx_marking_rules_department ON efiling_marking_rules(department_id);
CREATE INDEX idx_marking_rules_file_type ON efiling_marking_rules(file_type_id);
CREATE INDEX idx_marking_rules_scope ON efiling_marking_rules(level_scope, is_active);

-- =====================================================
-- STEP 5: Add department type classification
-- =====================================================

ALTER TABLE efiling_departments
ADD COLUMN IF NOT EXISTS department_type VARCHAR(50) DEFAULT 'district'; -- 'district', 'division', 'global'

COMMENT ON COLUMN efiling_departments.department_type IS 'Type of department: district (geographic), division+x (work-based), or global (top management)';

UPDATE efiling_departments 
SET department_type = 'division'
WHERE code IN ('SEW_EM', 'WA_EM') OR name LIKE '%E&M%' OR name LIKE '%Bulk%' OR name LIKE '%Trunk Main%';

UPDATE efiling_departments 
SET department_type = 'global'
WHERE code IN ('CEO_O', 'COO_O', 'ADMIN');

UPDATE efiling_departments 
SET department_type = 'district'
WHERE department_type = 'district' OR department_type IS NULL;

CREATE INDEX idx_departments_type ON efiling_departments(department_type);

-- =====================================================
-- STEP 6: Add estimated_amount column for financial module (future)
-- =====================================================

ALTER TABLE efiling_files
ADD COLUMN IF NOT EXISTS estimated_amount NUMERIC(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS approved_amount NUMERIC(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS spent_amount NUMERIC(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'PKR';

COMMENT ON COLUMN efiling_files.estimated_amount IS 'Estimated cost for work-related files (future financial module)';
COMMENT ON COLUMN efiling_files.approved_amount IS 'Approved budget amount';
COMMENT ON COLUMN efiling_files.spent_amount IS 'Amount spent so far';
COMMENT ON COLUMN efiling_files.currency IS 'Currency code (PKR, USD, etc.)';

CREATE INDEX idx_efiling_files_amounts ON efiling_files(estimated_amount, approved_amount, spent_amount);

-- =====================================================
-- STEP 7: Update efiling_file_workflows to make workflow optional
-- =====================================================

-- Note: We're not dropping workflow tables yet, but making them optional
-- Files can exist without workflows now
-- These columns may already be nullable, so these commands are optional

-- Only run if columns are NOT NULL (check your schema first)
-- ALTER TABLE efiling_files ALTER COLUMN workflow_id DROP NOT NULL;
-- ALTER TABLE efiling_files ALTER COLUMN current_stage_id DROP NOT NULL;

-- =====================================================
-- STEP 8: Add helper view for geographic file routing
-- =====================================================

CREATE OR REPLACE VIEW v_efiling_users_by_location AS
SELECT 
  u.id,
  u.user_id,
  u.efiling_role_id,
  r.code AS role_code,
  r.name AS role_name,
  u.district_id,
  d.title AS district_name,
  u.town_id,
  t.town AS town_name,
  u.subtown_id,
  st.subtown AS subtown_name,
  u.division_id,
  div.name AS division_name,
  div.ce_type AS division_type,
  dept.department_type,
  u.department_id,
  dept.name AS department_name,
  u.is_active
FROM efiling_users u
LEFT JOIN efiling_roles r ON u.efiling_role_id = r.id
LEFT JOIN district d ON u.district_id = d.id
LEFT JOIN town t ON u.town_id = t.id
LEFT JOIN subtown st ON u.subtown_id = st.id
LEFT JOIN divisions div ON u.division_id = div.id
LEFT JOIN efiling_departments dept ON u.department_id = dept.id
WHERE u.is_active = true;

COMMENT ON VIEW v_efiling_users_by_location IS 'View showing all users with their geographic assignments for routing purposes';

-- =====================================================
-- STEP 9: Sample marking rules data (to be customized)
-- =====================================================

-- Example: EE Water can mark to SE in same district
-- You'll need to populate this based on your actual role IDs
/*
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours)
SELECT 
  r1.id AS from_role_id,
  r2.id AS to_role_id,
  dept.id AS department_id,
  'district' AS level_scope,
  true AS require_same_location,
  24 AS sla_hours
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
CROSS JOIN efiling_departments dept
WHERE r1.code LIKE 'WAT_XEN_%'
  AND r2.code LIKE 'SE_%'
  AND dept.code = 'WB';
*/

-- =====================================================
-- NOTES FOR IMPLEMENTATION
-- =====================================================
/*
1. After running this script:
   - Populate divisions table with actual division data
   - Update efiling_users records with district_id, town_id, or division_id
   - Update existing efiling_files with geographic data if needed
   - Populate efiling_marking_rules with your actual routing rules

2. Mark-to query logic should now check:
   - efiling_marking_rules for allowed transitions
   - Geographic matching (same district/town/division)
   - Department matching

3. File creation should:
   - Auto-fill district_id, town_id, division_id from creator's user record
   - Only allow marking within geographic scope

4. Dashboard queries can now aggregate by:
   - District
   - Town
   - Division
   - Department
   - File type

5. CEO and top management roles should have:
   - level_scope = 'global'
   - require_same_location = false
   - In marking rules
*/

