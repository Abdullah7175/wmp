import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { sendWhatsAppMessage } from '@/lib/whatsappService';

async function getEfilingUserId(session, client) {
    if ([1, 2].includes(parseInt(session.user.role))) {
        const adminEfiling = await client.query(
            'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true',
            [session.user.id]
        );
        return adminEfiling.rows[0]?.id || null;
    }

    const efilingUser = await client.query(
        'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true',
        [session.user.id]
    );

    return efilingUser.rows[0]?.id || null;
}

// POST - Send daak to recipients
export async function POST(request, { params }) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        client = await connectToDatabase();
        const efilingUserId = await getEfilingUserId(session, client);

        // Check if daak exists and user is creator
        const daakCheck = await client.query(
            'SELECT created_by, status FROM efiling_daak WHERE id = $1',
            [id]
        );

        if (daakCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Daak not found' }, { status: 404 });
        }

        const daak = daakCheck.rows[0];

        // Only creator or admin can send
        if (daak.created_by !== efilingUserId && ![1, 2].includes(parseInt(session.user.role))) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        if (daak.status === 'SENT') {
            return NextResponse.json(
                { error: 'Daak has already been sent' },
                { status: 400 }
            );
        }

        // 1. Update recipient statuses to SENT for this specific daak
        await client.query(
            `UPDATE efiling_daak_recipients 
            SET status = 'SENT', received_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE daak_id = $1 AND status = 'PENDING'`,
            [id]
        );

        // 2. Update the main daak status
        await client.query(
            `UPDATE efiling_daak 
            SET status = 'SENT', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [id]
        );

        // Recipients with contact numbers for WhatsApp (prefer TO if same user in both)
        const recipients = await client.query(
            `SELECT DISTINCT ON (dr.efiling_user_id)
                dr.efiling_user_id,
                COALESCE(dr.addressing, 'TO') as addressing,
                u.name as user_name,
                u.contact_number
             FROM efiling_daak_recipients dr
             LEFT JOIN efiling_users eu ON dr.efiling_user_id = eu.id
             LEFT JOIN users u ON eu.user_id = u.id
             WHERE dr.daak_id = $1 AND dr.efiling_user_id IS NOT NULL
             ORDER BY dr.efiling_user_id,
                      CASE WHEN COALESCE(dr.addressing, 'TO') = 'TO' THEN 0 ELSE 1 END`,
            [id]
        );

        // Get daak details for notification / WhatsApp
        const daakDetails = await client.query(
            'SELECT subject, daak_number, reference_number FROM efiling_daak WHERE id = $1',
            [id]
        );

        let whatsappSent = 0;
        let whatsappSkipped = 0;
        let whatsappFailed = 0;

        if (daakDetails.rows.length > 0) {
            const { subject, daak_number, reference_number } = daakDetails.rows[0];
            const displayRef = reference_number || daak_number;

            for (const recipient of recipients.rows) {
                // In-app notification
                try {
                    await client.query(
                        `INSERT INTO efiling_notifications 
                         (user_id, type, message, priority, action_required, metadata, created_at)
                         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                        [
                            recipient.efiling_user_id,
                            'DAAK_RECEIVED',
                            `You have received a new daak: ${subject}`,
                            'normal',
                            true,
                            JSON.stringify({ daak_id: id, daak_number })
                        ]
                    );
                } catch (notifError) {
                    console.error('Error creating notification:', notifError);
                }

                // WhatsApp to registered contact number
                const phone = (recipient.contact_number || '').trim();
                if (!phone) {
                    whatsappSkipped += 1;
                    console.warn(
                        `[Daak WhatsApp] No contact_number for user ${recipient.efiling_user_id} (${recipient.user_name || 'unknown'})`
                    );
                    continue;
                }

                const addressing = (recipient.addressing || 'TO').toUpperCase() === 'CC' ? 'CC' : 'TO';
                const whatsappMessage =
                    `*KW&SC E-Posted (Daak)*\n\n` +
                    `Assalam-o-Alaikum${recipient.user_name ? ` ${recipient.user_name}` : ''},\n\n` +
                    `You have received a new Daak (${addressing}).\n\n` +
                    `*Daak No:* ${daak_number}\n` +
                    (displayRef && displayRef !== daak_number ? `*Reference:* ${displayRef}\n` : '') +
                    `*Subject:* ${subject || 'N/A'}\n\n` +
                    `Please log in to E-Filing to view and acknowledge.`;

                try {
                    const waResult = await sendWhatsAppMessage(phone, whatsappMessage);
                    if (waResult?.success) {
                        whatsappSent += 1;
                    } else {
                        whatsappFailed += 1;
                        console.error('[Daak WhatsApp] Failed:', {
                            userId: recipient.efiling_user_id,
                            error: waResult?.error || waResult?.message,
                        });
                    }
                } catch (waError) {
                    whatsappFailed += 1;
                    console.error('[Daak WhatsApp] Error:', waError.message);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Daak sent successfully',
            recipients_count: recipients.rows.length,
            whatsapp: {
                sent: whatsappSent,
                skipped_no_number: whatsappSkipped,
                failed: whatsappFailed,
            },
        });
    } catch (error) {
        console.error('Error sending daak:', error);
        return NextResponse.json(
            { error: 'Failed to send daak', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
