-- Create CE users table for Chief Engineers
CREATE TABLE IF NOT EXISTS public.ce_users (
    id serial4 NOT NULL,
    user_id int4 NOT NULL,
    department_id int4 NULL,
    designation varchar(255) NULL,
    department varchar(255) NULL, -- 'water' or 'sewerage'
    address text NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT ce_users_pkey PRIMARY KEY (id),
    CONSTRAINT ce_users_user_id_key UNIQUE (user_id),
    CONSTRAINT ce_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ce_users_user_id ON public.ce_users USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_ce_users_department ON public.ce_users USING btree (department);

-- Note: CE approvals use the same work_request_soft_approvals table as CEO/COO
-- No additional columns needed in requests table


-- Add comment to table
COMMENT ON TABLE public.ce_users IS 'Stores Chief Engineer user information and department assignments';
COMMENT ON COLUMN public.ce_users.department IS 'Department type: water or sewerage';
COMMENT ON COLUMN public.ce_users.designation IS 'Job title/designation of the CE';
COMMENT ON COLUMN public.ce_users.address IS 'Physical address of the CE';
