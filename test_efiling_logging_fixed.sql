-- Test script for e-filing logging functionality (FIXED VERSION)
-- This will insert some test records to verify the system is working

-- Insert test login actions (these don't have file_id)
INSERT INTO efiling_user_actions (
    file_id, user_id, action_type, description, timestamp, created_at,
    user_type, user_role, user_name, user_email, entity_type, entity_name,
    details, ip_address, user_agent
) VALUES 
(
    NULL, '1', 'USER_LOGIN', 'Test user logged into e-filing system', NOW(), NOW(),
    'efiling_user', 1, 'Test User', 'test@example.com', 'auth', 'e-filing_login',
    '{"method": "email_password", "userType": "efiling_user"}', '127.0.0.1', 'Test Browser'
),
(
    NULL, '2', 'USER_LOGIN', 'Another test user logged into e-filing system', NOW(), NOW(),
    'efiling_user', 2, 'Another User', 'another@example.com', 'auth', 'e-filing_login',
    '{"method": "email_password", "userType": "efiling_user"}', '127.0.0.1', 'Test Browser'
);

-- Insert test file actions (these have file_id)
INSERT INTO efiling_user_actions (
    file_id, user_id, action_type, description, timestamp, created_at,
    user_type, user_role, user_name, user_email, entity_type, entity_name,
    details, ip_address, user_agent
) VALUES 
(
    'FILE001', '1', 'FILE_CREATED', 'Test file was created', NOW(), NOW(),
    'efiling_user', 1, 'Test User', 'test@example.com', 'efiling_file', 'file_FILE001',
    '{"fileNumber": "FILE001", "subject": "Test File"}', '127.0.0.1', 'Test Browser'
),
(
    'FILE001', '1', 'FILE_UPDATED', 'Test file was updated', NOW(), NOW(),
    'efiling_user', 1, 'Test User', 'test@example.com', 'efiling_file', 'file_FILE001',
    '{"fileNumber": "FILE001", "changes": ["subject", "description"]}', '127.0.0.1', 'Test Browser'
);

-- Verify the data was inserted
SELECT 
    id, file_id, user_id, action_type, description, user_name, user_email, 
    entity_type, entity_name, timestamp
FROM efiling_user_actions 
ORDER BY timestamp DESC 
LIMIT 10;
