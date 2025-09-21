-- Update work_request_soft_approvals table to include CE approval
ALTER TABLE work_request_soft_approvals DROP CONSTRAINT IF EXISTS chk_approver_type;

ALTER TABLE work_request_soft_approvals 
ADD CONSTRAINT chk_approver_type CHECK (approver_type IN ('ceo', 'coo', 'ce'));

-- Update the comment to reflect the new approver types
COMMENT ON COLUMN work_request_soft_approvals.approver_type IS 'Type of approver: ceo, coo, or ce';
