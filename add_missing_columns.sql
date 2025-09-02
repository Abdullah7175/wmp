-- Add missing workflow-related columns to efiling_files table
-- This script adds the columns needed for proper workflow integration

-- Add workflow_id column to link files to their workflow instances
ALTER TABLE efiling_files 
ADD COLUMN IF NOT EXISTS workflow_id INTEGER REFERENCES efiling_file_workflows(id);

-- Add current_stage_id column to track the current workflow stage
ALTER TABLE efiling_files 
ADD COLUMN IF NOT EXISTS current_stage_id INTEGER REFERENCES efiling_workflow_stages(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_efiling_files_workflow ON efiling_files(workflow_id);
CREATE INDEX IF NOT EXISTS idx_efiling_files_current_stage ON efiling_files(current_stage_id);

-- Add comments for documentation
COMMENT ON COLUMN efiling_files.workflow_id IS 'Reference to the active workflow instance for this file';
COMMENT ON COLUMN efiling_files.current_stage_id IS 'Reference to the current workflow stage for this file';

-- Update existing files to have proper default values if needed
UPDATE efiling_files 
SET workflow_id = NULL, current_stage_id = NULL 
WHERE workflow_id IS NULL OR current_stage_id IS NULL;
