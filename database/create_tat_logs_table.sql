-- Create table for TAT (SLA) event logging
CREATE TABLE IF NOT EXISTS efiling_tat_logs (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES efiling_files(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES efiling_users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'DEADLINE_SET', 'ONE_HOUR_WARNING', 'DEADLINE_BREACHED', 'DEADLINE_MET'
    sla_deadline TIMESTAMP,
    time_remaining_hours DECIMAL(10, 2),
    message TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_method VARCHAR(20), -- 'whatsapp', 'email', 'in_app'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_tat_logs_file_id ON efiling_tat_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_tat_logs_user_id ON efiling_tat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tat_logs_event_type ON efiling_tat_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_tat_logs_deadline ON efiling_tat_logs(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_tat_logs_created_at ON efiling_tat_logs(created_at);
