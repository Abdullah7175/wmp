-- Create CE users table for Chief Engineers (simplified - no department column)
CREATE TABLE IF NOT EXISTS public.ce_users (
    id serial4 NOT NULL,
    user_id int4 NOT NULL,
    designation varchar(255) NULL,
    address text NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT ce_users_pkey PRIMARY KEY (id),
    CONSTRAINT ce_users_user_id_key UNIQUE (user_id),
    CONSTRAINT ce_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create ce_user_departments junction table for multiple department assignments
CREATE TABLE IF NOT EXISTS public.ce_user_departments (
    id serial4 NOT NULL,
    ce_user_id int4 NOT NULL,
    complaint_type_id int4 NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT ce_user_departments_pkey PRIMARY KEY (id),
    CONSTRAINT ce_user_departments_unique UNIQUE (ce_user_id, complaint_type_id),
    CONSTRAINT ce_user_departments_ce_user_id_fkey FOREIGN KEY (ce_user_id) REFERENCES public.ce_users(id) ON DELETE CASCADE,
    CONSTRAINT ce_user_departments_complaint_type_id_fkey FOREIGN KEY (complaint_type_id) REFERENCES public.complaint_types(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ce_users_user_id ON public.ce_users USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_ce_user_departments_ce_user_id ON public.ce_user_departments USING btree (ce_user_id);
CREATE INDEX IF NOT EXISTS idx_ce_user_departments_complaint_type_id ON public.ce_user_departments USING btree (complaint_type_id);

-- Note: CE approvals use the same work_request_soft_approvals table as CEO/COO
-- No additional columns needed in requests table

-- Add comments to tables
COMMENT ON TABLE public.ce_users IS 'Stores Chief Engineer user information';
COMMENT ON TABLE public.ce_user_departments IS 'Junction table linking CE users to multiple complaint types (departments)';
COMMENT ON COLUMN public.ce_users.designation IS 'Job title/designation of the CE';
COMMENT ON COLUMN public.ce_users.address IS 'Physical address of the CE';

-- Insert sample CE users
INSERT INTO public.users (name, email, password, contact_number, role, created_date, updated_date) 
VALUES ('Water CE', 'water.ce@kwsc.gov.pk', '$2a$10$example_hash', '+92-300-1234567', 7, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users (name, email, password, contact_number, role, created_date, updated_date)
VALUES ('Sewerage CE', 'sewerage.ce@kwsc.gov.pk', '$2a$10$example_hash', '+92-300-1234568', 7, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert CE user records
INSERT INTO public.ce_users (user_id, designation, address, created_at, updated_at)
SELECT u.id, 'Chief Engineer - Water', 'Karachi Water & Sewerage Corporation', NOW(), NOW()
FROM public.users u WHERE u.email = 'water.ce@kwsc.gov.pk'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.ce_users (user_id, designation, address, created_at, updated_at)
SELECT u.id, 'Chief Engineer - Sewerage', 'Karachi Water & Sewerage Corporation', NOW(), NOW()
FROM public.users u WHERE u.email = 'sewerage.ce@kwsc.gov.pk'
ON CONFLICT (user_id) DO NOTHING;

-- Insert department assignments (assuming complaint types with IDs 1 and 2 exist)
-- You may need to adjust these IDs based on your actual complaint_types data
INSERT INTO public.ce_user_departments (ce_user_id, complaint_type_id, created_at)
SELECT cu.id, 1, NOW()
FROM public.ce_users cu
JOIN public.users u ON cu.user_id = u.id
WHERE u.email = 'water.ce@kwsc.gov.pk'
ON CONFLICT (ce_user_id, complaint_type_id) DO NOTHING;

INSERT INTO public.ce_user_departments (ce_user_id, complaint_type_id, created_at)
SELECT cu.id, 2, NOW()
FROM public.ce_users cu
JOIN public.users u ON cu.user_id = u.id
WHERE u.email = 'sewerage.ce@kwsc.gov.pk'
ON CONFLICT (ce_user_id, complaint_type_id) DO NOTHING;