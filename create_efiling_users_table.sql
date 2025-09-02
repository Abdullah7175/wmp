-- Create efiling_users table
CREATE TABLE IF NOT EXISTS efiling_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role INTEGER NOT NULL DEFAULT 4, -- 4: File Clerk, 5: File Officer, 6: Department Head
    department_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample e-filing users (password is 'password' for all)
INSERT INTO efiling_users (name, email, password, role, department_id) VALUES
('File Clerk 1', 'clerk1@efiling.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1),
('File Officer 1', 'officer1@efiling.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 1),
('Department Head 1', 'head1@efiling.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 6, 1),
('File Clerk 2', 'clerk2@efiling.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 2),
('File Officer 2', 'officer2@efiling.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 2);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_efiling_users_email ON efiling_users(email);
CREATE INDEX IF NOT EXISTS idx_efiling_users_department ON efiling_users(department_id); 