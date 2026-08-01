import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { ensureDaakLetterSchema } from '@/lib/efilingDaakHelpers';

export const dynamic = 'force-dynamic';

async function getEfilingUserId(session, client) {
    const efilingUser = await client.query(
        'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true',
        [session.user.id]
    );
    return efilingUser.rows[0]?.id || null;
}

/**
 * POST - Apply creator's active e-signature onto a daak letter.
 * Uses efiling_user_signatures (same pool as file e-sign).
 */
export async function POST(request, { params }) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        client = await connectToDatabase();
        await ensureDaakLetterSchema(client);

        const efilingUserId = await getEfilingUserId(session, client);
        const isAdmin = [1, 2].includes(parseInt(session.user.role));

        const daakRes = await client.query(
            'SELECT id, created_by, status FROM efiling_daak WHERE id = $1',
            [id]
        );
        if (daakRes.rows.length === 0) {
            return NextResponse.json({ error: 'Daak not found' }, { status: 404 });
        }

        const daak = daakRes.rows[0];
        if (daak.created_by !== efilingUserId && !isAdmin) {
            return NextResponse.json(
                { error: 'Only the creator (or admin) can e-sign this daak' },
                { status: 403 }
            );
        }

        // Prefer explicit content from body; else load active user signature
        let signatureContent = body.signature_content || null;
        let signatureType = body.signature_type || 'IMAGE';

        if (!signatureContent) {
            // efiling_user_signatures.user_id is stored as varchar (users.id or efiling_users.id)
            const sigRes = await client.query(
                `SELECT file_url, signature_data, signature_text, signature_type
                 FROM efiling_user_signatures
                 WHERE (user_id = $1 OR user_id = $2) AND is_active = true
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [String(session.user.id), String(efilingUserId || '')]
            );
            if (sigRes.rows.length === 0) {
                return NextResponse.json(
                    {
                        error: 'No active e-signature found. Please upload a signature in your profile first.',
                    },
                    { status: 400 }
                );
            }
            const sig = sigRes.rows[0];
            signatureContent = sig.file_url || sig.signature_data || sig.signature_text;
            signatureType = sig.signature_type || 'IMAGE';
        }

        if (!signatureContent) {
            return NextResponse.json({ error: 'Signature content is empty' }, { status: 400 });
        }

        const userRes = await client.query(
            `SELECT u.name, eu.designation, r.name as role_name
             FROM users u
             LEFT JOIN efiling_users eu ON eu.user_id = u.id AND eu.is_active = true
             LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
             WHERE u.id = $1`,
            [session.user.id]
        );
        const userName = userRes.rows[0]?.name || session.user.name || 'User';
        const userRole =
            userRes.rows[0]?.role_name || userRes.rows[0]?.designation || session.user.role || null;

        // Soft-deactivate previous signatures by same user on this daak, then insert
        await client.query(
            `UPDATE efiling_daak_signatures
             SET is_active = false
             WHERE daak_id = $1 AND user_id = $2 AND is_active = true`,
            [id, session.user.id]
        );

        const insert = await client.query(
            `INSERT INTO efiling_daak_signatures
                (daak_id, user_id, efiling_user_id, user_name, user_role, signature_type, signature_content, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, true)
             RETURNING *`,
            [
                id,
                session.user.id,
                efilingUserId,
                userName,
                userRole,
                signatureType,
                signatureContent,
            ]
        );

        return NextResponse.json({
            success: true,
            signature: insert.rows[0],
        });
    } catch (error) {
        console.error('Error signing daak:', error);
        return NextResponse.json(
            { error: 'Failed to apply e-signature', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
