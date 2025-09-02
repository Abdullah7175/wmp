-- E-Filing Notifications Table
-- This table stores all notifications for e-filing users including workflow actions, file assignments, and SLA alerts

CREATE TABLE IF NOT EXISTS efiling_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES efiling_users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'file_assigned', 'workflow_action', 'sla_alert', 'file_returned', 'comment_added', etc.
    file_id INTEGER REFERENCES efiling_files(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    action_required BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}', -- Additional data like workflow stage, SLA details, etc.
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMP NULL,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_efiling_notifications_user ON efiling_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_efiling_notifications_type ON efiling_notifications(type);
CREATE INDEX IF NOT EXISTS idx_efiling_notifications_file ON efiling_notifications(file_id);
CREATE INDEX IF NOT EXISTS idx_efiling_notifications_unread ON efiling_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_efiling_notifications_priority ON efiling_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_efiling_notifications_created ON efiling_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_efiling_notifications_expires ON efiling_notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE efiling_notifications IS 'Stores all notifications for e-filing users including workflow actions, file assignments, and SLA alerts';
COMMENT ON COLUMN efiling_notifications.type IS 'Type of notification: file_assigned, workflow_action, sla_alert, file_returned, comment_added, etc.';
COMMENT ON COLUMN efiling_notifications.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN efiling_notifications.action_required IS 'Whether user action is required for this notification';
COMMENT ON COLUMN efiling_notifications.expires_at IS 'When the notification expires (for time-sensitive notifications)';
COMMENT ON COLUMN efiling_notifications.metadata IS 'Additional JSON data like workflow stage, SLA details, etc.';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_efiling_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_efiling_notifications_updated_at
    BEFORE UPDATE ON efiling_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_efiling_notifications_updated_at();

-- Insert some default notification types for reference
INSERT INTO efiling_notifications (user_id, type, message, priority, action_required) VALUES
(1, 'system_welcome', 'Welcome to the E-Filing system! Please complete your profile setup.', 'normal', true),
(1, 'system_info', 'System maintenance scheduled for tonight at 2 AM.', 'low', false)
ON CONFLICT DO NOTHING;
