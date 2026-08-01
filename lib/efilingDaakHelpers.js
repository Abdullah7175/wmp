/**
 * Shared helpers for Daak (E-Posted) letter enhancements.
 * Additive: existing behaviour preserved when new fields are absent.
 */

export async function ensureDaakLetterSchema(client) {
    await client.query(`
        ALTER TABLE public.efiling_daak
            ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100) NULL,
            ADD COLUMN IF NOT EXISTS to_header TEXT NULL,
            ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255) NULL DEFAULT 'KW&SC',
            ADD COLUMN IF NOT EXISTS letter_date DATE NULL
    `);

    await client.query(`
        ALTER TABLE public.efiling_daak_recipients
            ADD COLUMN IF NOT EXISTS addressing VARCHAR(10) NOT NULL DEFAULT 'TO'
    `);

    await client.query(`
        ALTER TABLE public.efiling_daak_attachments
            ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) NULL
    `);

    await client.query(`
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
        )
    `);
}

/**
 * Normalize incoming recipient lists.
 * Supports:
 * - recipients: [{ type, id, addressing? }]  (legacy — defaults to TO)
 * - to_recipients / cc_recipients arrays
 */
export function normalizeDaakRecipients(body = {}) {
    const to = [];
    const cc = [];

    const pushList = (list, addressing) => {
        if (!Array.isArray(list)) return;
        for (const r of list) {
            if (!r || !r.type) continue;
            const item = {
                type: r.type,
                id: r.id ?? null,
                name: r.name || null,
                addressing,
            };
            if (addressing === 'CC') cc.push(item);
            else to.push(item);
        }
    };

    if (Array.isArray(body.to_recipients) || Array.isArray(body.cc_recipients)) {
        pushList(body.to_recipients, 'TO');
        pushList(body.cc_recipients, 'CC');
    }

    // Legacy single list — treat as TO unless addressing is set
    if (Array.isArray(body.recipients)) {
        for (const r of body.recipients) {
            if (!r || !r.type) continue;
            const addressing = (r.addressing || 'TO').toUpperCase() === 'CC' ? 'CC' : 'TO';
            pushList([r], addressing);
        }
    }

    return { toRecipients: to, ccRecipients: cc };
}
