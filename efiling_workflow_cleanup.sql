-- =====================================================
-- EFILING SYSTEM: WORKFLOW TABLES CLEANUP SQL
-- =====================================================
-- This script removes workflow-based routing tables
-- that are no longer needed after geographic routing migration
-- 
-- WARNING: Review before executing. Some tables may contain historical data.
-- Consider archiving data first if needed for reporting.

-- =====================================================
-- STEP 1: Drop workflow routing tables (no longer needed)
-- =====================================================

-- Drop foreign key constraints first
ALTER TABLE efiling_file_types 
DROP CONSTRAINT IF EXISTS efiling_file_types_workflow_template_id_fkey;

ALTER TABLE efiling_files 
DROP CONSTRAINT IF EXISTS efiling_files_workflow_id_fkey CASCADE;

ALTER TABLE efiling_files 
DROP CONSTRAINT IF EXISTS efiling_files_current_stage_id_fkey CASCADE;

-- Drop workflow template and stage tables
DROP TABLE IF EXISTS efiling_workflow_stage_permissions CASCADE;
DROP TABLE IF EXISTS efiling_stage_requirements CASCADE;
DROP TABLE IF EXISTS efiling_stage_sla_rules CASCADE;
DROP TABLE IF EXISTS efiling_stage_transitions CASCADE;
DROP TABLE IF EXISTS efiling_workflow_stages CASCADE;
DROP TABLE IF EXISTS efiling_workflow_templates CASCADE;

-- =====================================================
-- STEP 2: Remove workflow_id and current_stage_id from efiling_files
-- (Keep for now as nullable columns for backward compatibility)
-- =====================================================

-- Columns remain but are now optional and unused
-- You can drop them later after verifying all code is updated:
-- ALTER TABLE efiling_files DROP COLUMN IF EXISTS workflow_id;
-- ALTER TABLE efiling_files DROP COLUMN IF EXISTS current_stage_id;

-- =====================================================
-- STEP 3: Clean up workflow_id foreign key from efiling_file_types
-- =====================================================

-- Remove workflow_template_id column (now unused)
ALTER TABLE efiling_file_types 
DROP COLUMN IF EXISTS workflow_template_id;

-- =====================================================
-- NOTES
-- =====================================================
-- Tables kept for historical data (optional - can drop later if needed):
-- - efiling_file_workflows (may contain historical workflow data)
-- - efiling_workflow_stage_instances (historical stage progression)
-- - efiling_workflow_actions (historical workflow actions)
-- - efiling_sla_pause_history (SLA tracking - still useful)
--
-- These tables can be dropped after ensuring no reports depend on them.
-- You may want to export this data first for historical reporting.

