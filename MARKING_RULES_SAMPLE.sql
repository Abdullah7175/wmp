-- =====================================================
-- SAMPLE MARKING RULES FOR EFILING SYSTEM
-- =====================================================
-- Populate efiling_marking_rules based on your organizational hierarchy
-- Customize role IDs based on your actual efiling_roles table

-- =====================================================
-- DISTRICT-BASED MARKING RULES (Water/Sewerage)
-- =====================================================

-- EE Water can mark to SE in same district
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    dept.id AS department_id,
    'district' AS level_scope,
    true AS require_same_location,
    24 AS sla_hours,
    'EE Water marks to SE (district-based)'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
CROSS JOIN efiling_departments dept
WHERE r1.code LIKE 'WAT_XEN_%'
  AND r2.code LIKE 'SE_%'
  AND dept.department_type = 'district'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- EE Sewerage can mark to SE in same district
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    dept.id AS department_id,
    'district' AS level_scope,
    true AS require_same_location,
    24 AS sla_hours,
    'EE Sewerage marks to SE (district-based)'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
CROSS JOIN efiling_departments dept
WHERE r1.code LIKE 'SEW_XEN_%'
  AND r2.code LIKE 'SE_%'
  AND dept.department_type = 'district'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- SE can mark to Consultant (district-based, but consultant may be external)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id, -- Applies to all departments
    'district' AS level_scope,
    false AS require_same_location, -- Consultants may be external
    48 AS sla_hours,
    'SE marks to Consultant'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code LIKE 'SE_%'
  AND r2.code LIKE 'CON_%'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- Consultant marks back to SE (same district)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'district' AS level_scope,
    true AS require_same_location,
    24 AS sla_hours,
    'Consultant marks to SE'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code LIKE 'CON_%'
  AND r2.code LIKE 'SE_%'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- SE marks to CE (Chief Engineer - Water or Sewerage)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'district' AS level_scope,
    false AS require_same_location, -- CE oversees multiple districts
    24 AS sla_hours,
    'SE marks to CE'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code LIKE 'SE_%'
  AND (r2.code = 'CE_WAT' OR r2.code = 'CE_SEW')
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- CE marks to COO (global scope)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    24 AS sla_hours,
    'CE marks to COO'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE (r1.code = 'CE_WAT' OR r1.code = 'CE_SEW')
  AND r2.code = 'COO'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- COO marks to CEO (global scope)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    24 AS sla_hours,
    'COO marks to CEO'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code = 'COO'
  AND r2.code = 'CEO'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- CEO marks to CE (global scope - CEO flexibility)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    24 AS sla_hours,
    'CEO marks to CE (execution)'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code = 'CEO'
  AND (r2.code = 'CE_WAT' OR r2.code = 'CE_SEW')
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- CEO marks to PC (global scope)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    168 AS sla_hours, -- Pré-7 days for procurement
    'CEO marks to PC'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code = 'CEO'
  AND r2.code = 'PC'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- PC marks to IAO II (global scope)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    24 AS sla_hours,
    'PC marks to IAO II'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code = 'PC'
  AND r2.code = 'IAO_II'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- IAO II marks to COO (global scope)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    24 AS sla_hours,
    'IAO II marks to COO'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code = 'IAO_II'
  AND r2.code = 'COO'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- CE marks to XEN (execution - district-based)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'district' AS level_scope,
    true AS require_same_location,
    24 AS sla_hours,
    'CE marks to XEN for execution'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE (r1.code = 'CE_WAT' OR r1.code = 'CE_SEW')
  AND (r2.code LIKE 'WAT_XEN_%' OR r2.code LIKE 'SEW_XEN_%')
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- SE marks to BUDGET (district-based)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'district' AS level_scope,
    false AS require_same_location, -- Budget may be centralized
    24 AS sla_hours,
    'SE marks to BUDGET'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code LIKE 'SE_%'
  AND r2.code = 'BUDGET'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- BUDGET marks to ADLFA (global scope)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    24 AS sla_hours,
    'BUDGET marks to ADLFA'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code = 'BUDGET'
  AND r2.code = 'ADLFA'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- ADLFA marks to FINANCE (global scope)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    NULL AS department_id,
    'global' AS level_scope,
    false AS require_same_location,
    48 AS sla_hours,
    'ADLFA marks to FINANCE'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
WHERE r1.code = 'ADLFA'
  AND r2.code = 'FINANCE'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- =====================================================
-- DIVISION-BASED MARKING RULES (E&M, Bulk Transmission, WTM)
-- =====================================================

-- EE E&M Water Bulk marks to SE E&M Water Bulk (division-based)
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours, description)
SELECT 
    r1.id AS from_role_id,
    r2.id AS to_role_id,
    dept.id AS department_id,
    'division' AS level_scope,
    true AS require_same_location,
    24 AS sla_hours,
    'EE E&M Water Bulk marks to SE E&M Water Bulk (division-based)'
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
CROSS JOIN efiling_departments dept
WHERE r1.code LIKE '%E&M%' AND r1.code LIKE '%WATER%' AND r1.code LIKE '%XEN%'
  AND r2.code LIKE '%E&M%' AND r2.code LIKE '%WATER%' AND r2.code LIKE '%SE%'
  AND dept.department_type = 'division'
  AND NOT EXISTS (
    SELECT 1 FROM efiling_marking_rules mr
    WHERE mr.from_role_id = r1.id AND mr.to_role_id = r2.id
  );

-- Similar rules for other division-based departments...

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Review all role codes in your efiling_roles table and adjust patterns accordingly
-- 2. Set appropriate sla_hours for each transition
-- 3. CEO always has level_scope = 'global' and require_same_location = false
-- 4. Test each rule after insertion to ensure correct behavior

