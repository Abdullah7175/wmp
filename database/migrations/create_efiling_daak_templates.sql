-- =============================================================================
-- DAAK TEMPLATES (additive)
-- Admin (efiling): create GLOBAL, DEPARTMENT, or USER-specific templates
-- Efilinguser: create/manage personal (USER) templates; use any visible template
-- Date: 2026-08-01
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.efiling_daak_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NULL,
    content TEXT NULL,
    to_header TEXT NULL,
    organization_name VARCHAR(255) NULL DEFAULT 'KW&SC',
    reference_number VARCHAR(100) NULL,
    category_id INTEGER NULL REFERENCES public.efiling_daak_categories(id) ON DELETE SET NULL,
    -- GLOBAL = all users; DEPARTMENT = users in department_id; USER = owner only
    scope VARCHAR(20) NOT NULL DEFAULT 'USER'
        CHECK (scope IN ('GLOBAL', 'DEPARTMENT', 'USER')),
    department_id INTEGER NULL REFERENCES public.efiling_departments(id) ON DELETE SET NULL,
    owner_efiling_user_id INTEGER NULL REFERENCES public.efiling_users(id) ON DELETE CASCADE,
    created_by INTEGER NULL REFERENCES public.efiling_users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT efiling_daak_templates_scope_check CHECK (
        (scope = 'GLOBAL' AND department_id IS NULL)
        OR (scope = 'DEPARTMENT' AND department_id IS NOT NULL)
        OR (scope = 'USER' AND owner_efiling_user_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_daak_templates_active
    ON public.efiling_daak_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_daak_templates_scope
    ON public.efiling_daak_templates(scope);
CREATE INDEX IF NOT EXISTS idx_daak_templates_department
    ON public.efiling_daak_templates(department_id) WHERE department_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daak_templates_owner
    ON public.efiling_daak_templates(owner_efiling_user_id) WHERE owner_efiling_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daak_templates_created_by
    ON public.efiling_daak_templates(created_by);

COMMENT ON TABLE public.efiling_daak_templates IS 'Reusable letter templates for E-Posted (Daak)';
COMMENT ON COLUMN public.efiling_daak_templates.scope IS 'GLOBAL (everyone), DEPARTMENT (one dept), USER (personal / assigned user)';
COMMENT ON COLUMN public.efiling_daak_templates.owner_efiling_user_id IS 'For USER scope: the efiling user who owns/can use this personal template';

COMMIT;
