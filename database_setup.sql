-- Database setup for e-filing authentication and attachment features

-- OTP codes table for storing temporary authentication codes
CREATE TABLE IF NOT EXISTS efiling_otp_codes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    method VARCHAR(50) NOT NULL, -- 'sms' or 'google'
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, method)
);

-- User signatures table for storing user's saved signatures
CREATE TABLE IF NOT EXISTS efiling_user_signatures (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    signature_name VARCHAR(255) NOT NULL,
    signature_type VARCHAR(50) NOT NULL, -- 'draw', 'upload', 'text', 'scan'
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    file_url TEXT,
    signature_data TEXT, -- For drawn or text signatures
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- File attachments table for storing document attachments
CREATE TABLE IF NOT EXISTS efiling_file_attachments (
    id VARCHAR(255) PRIMARY KEY,
    file_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url TEXT,
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- User actions table for logging all user activities
CREATE TABLE IF NOT EXISTS efiling_user_actions (
    id SERIAL PRIMARY KEY,
    file_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_efiling_otp_codes_user_method ON efiling_otp_codes(user_id, method);
CREATE INDEX IF NOT EXISTS idx_efiling_otp_codes_expires ON efiling_otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_efiling_user_signatures_user ON efiling_user_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_efiling_file_attachments_file ON efiling_file_attachments(file_id);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_file ON efiling_user_actions(file_id);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_user ON efiling_user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_efiling_user_actions_timestamp ON efiling_user_actions(timestamp);

-- Add comments for documentation
COMMENT ON TABLE efiling_otp_codes IS 'Stores temporary OTP codes for user authentication';
COMMENT ON TABLE efiling_user_signatures IS 'Stores user-created signatures for e-filing documents';
COMMENT ON TABLE efiling_file_attachments IS 'Stores file attachments linked to e-filing documents';
COMMENT ON TABLE efiling_user_actions IS 'Logs all user actions for audit and tracking purposes';

-- Sample data for testing (optional)
-- INSERT INTO efiling_otp_codes (user_id, otp_code, method, expires_at) 
-- VALUES ('test_user', '123456', 'sms', NOW() + INTERVAL '10 minutes');
