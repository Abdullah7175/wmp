-- =============================================================================
-- DAAK LETTER ENHANCEMENTS (additive — does not break existing data)
-- Run this on your database before/alongside deploying the code.
-- Date: 2026-08-01
-- =============================================================================

BEGIN;

-- Letter header / reference fields on main daak table
ALTER TABLE public.efiling_daak
    ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS to_header TEXT NULL,
    ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255) NULL DEFAULT 'KW&SC',
    ADD COLUMN IF NOT EXISTS letter_date DATE NULL;

COMMENT ON COLUMN public.efiling_daak.reference_number IS 'User/office reference number shown on the letter (separate from auto daak_number)';
COMMENT ON COLUMN public.efiling_daak.to_header IS 'Free-text TO line for letter display (e.g. PSO to MD/CEO)';
COMMENT ON COLUMN public.efiling_daak.organization_name IS 'Organization name on letterhead (e.g. KW&SC)';
COMMENT ON COLUMN public.efiling_daak.letter_date IS 'Date printed on the letter; defaults to created/sent date in UI if null';

CREATE INDEX IF NOT EXISTS idx_daak_reference_number
    ON public.efiling_daak(reference_number)
    WHERE reference_number IS NOT NULL;

-- Distinguish TO vs CC on expanded recipients (existing rows default to TO)
ALTER TABLE public.efiling_daak_recipients
    ADD COLUMN IF NOT EXISTS addressing VARCHAR(10) NOT NULL DEFAULT 'TO';

-- Drop check if it exists from a partial previous run, then re-add
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'efiling_daak_recipients_addressing_check'
    ) THEN
        ALTER TABLE public.efiling_daak_recipients
            ADD CONSTRAINT efiling_daak_recipients_addressing_check
            CHECK (addressing IN ('TO', 'CC'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daak_recipients_addressing
    ON public.efiling_daak_recipients(daak_id, addressing);

COMMENT ON COLUMN public.efiling_daak_recipients.addressing IS 'TO = primary addressee, CC = carbon copy; same user prefers TO if in both';

-- Optional display name for preferred attachment label (original file_name kept)
ALTER TABLE public.efiling_daak_attachments
    ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) NULL;

COMMENT ON COLUMN public.efiling_daak_attachments.attachment_name IS 'Optional user-preferred label; file_name remains the original file name';

-- Electronic signatures applied on a daak letter
CREATE TABLE IF NOT EXISTS public.efiling_daak_signatures (
    id SERIAL PRIMARY KEY,
    daak_id INTEGER NOT NULL REFERENCES public.efiling_daak(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    efiling_user_id INTEGER REFERENCES public.efiling_users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100),
    signature_type VARCHAR(50) NOT NULL DEFAULT 'IMAGE',
    signature_content TEXT NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daak_signatures_daak
    ON public.efiling_daak_signatures(daak_id)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_daak_signatures_user
    ON public.efiling_daak_signatures(user_id);

COMMENT ON TABLE public.efiling_daak_signatures IS 'Electronic signatures placed on daak letters';

COMMIT;
