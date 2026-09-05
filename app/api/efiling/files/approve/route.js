import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { sendWhatsAppMessage } from '@/lib/whatsappService';

export async function POST(request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await connectToDatabase();
    try {
        const body = await request.json();
        const { file_ids } = body;

        if (!Array.isArray(file_ids) || file_ids.length === 0) {
            return NextResponse.json({ error: 'No file IDs provided' }, { status: 400 });
        }

        // 1. Verify CEO identity
        const userRes = await client.query(`
            SELECT eu.id, u.name as user_name, u.contact_number, er.code as role_code 
            FROM efiling_users eu
            JOIN users u ON eu.user_id = u.id
            JOIN efiling_roles er ON eu.efiling_role_id = er.id
            WHERE eu.user_id = $1 AND eu.is_active = true
        `, [session.user.id]);

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'E-filing user not found' }, { status: 404 });
        }

        const ceoUser = userRes.rows[0];
        if (ceoUser.role_code !== 'CEO') {
            return NextResponse.json({ error: 'Only CEO is authorized to approve files' }, { status: 403 });
        }

        // 2. Validate status and signatures per file
        const validationErrors = [];

        for (const fileId of file_ids) {
            // Fetch file details including status
            const fileRes = await client.query(`
                SELECT f.id, f.file_number, fs.code as status_code
                FROM efiling_files f
                LEFT JOIN efiling_file_status fs ON f.status_id = fs.id
                WHERE f.id = $1
            `, [fileId]);

            if (fileRes.rows.length === 0) {
                validationErrors.push(`• File ID #${fileId}: File not found`);
                continue;
            }

            const file = fileRes.rows[0];
            const fileNum = file.file_number || `#${file.id}`;

            // Check if already approved
            if (file.status_code === 'APPROVED') {
                validationErrors.push(`• File ${fileNum}: File is already approved`);
                continue;
            }

            // Check latest signature
            const sigCheck = await client.query(`
                SELECT ds.user_id, u.name as signer_name, er.code as signer_role_code
                FROM efiling_document_signatures ds
                JOIN efiling_users eu ON ds.user_id = eu.user_id
                JOIN users u ON eu.user_id = u.id
                JOIN efiling_roles er ON eu.efiling_role_id = er.id
                WHERE ds.file_id = $1 AND ds.is_active = true
                ORDER BY ds.timestamp DESC
                LIMIT 1
            `, [fileId]);

            if (sigCheck.rows.length === 0) {
                validationErrors.push(`• File ${fileNum}: Has no active signatures`);
                continue;
            }

            const lastSigner = sigCheck.rows[0];
            const isCeoName = lastSigner.signer_name === 'Ahmed Ali Siddique';
            const isCeoRole = lastSigner.signer_role_code === 'CEO';

            if (!isCeoName && !isCeoRole) {
                validationErrors.push(`• File ${fileNum}: Does not have CEO signature as last signature`);
            }
        }

        if (validationErrors.length > 0) {
            return NextResponse.json({
                error: validationErrors.join('\n')
            }, { status: 400 });
        }

        // 3. Get APPROVED status ID
        const statusRes = await client.query(`SELECT id FROM efiling_file_status WHERE code = 'APPROVED'`);
        if (statusRes.rows.length === 0) {
            return NextResponse.json({ error: 'APPROVED status code not found in DB' }, { status: 500 });
        }
        const approvedStatusId = statusRes.rows[0].id;

        // 4. Update files status and approved_at timestamp
        const updateQuery = `
            UPDATE efiling_files 
            SET status_id = $1, 
                approved_at = NOW(),
                updated_at = NOW()
            WHERE id = ANY($2::int[])
            RETURNING id, file_number, subject
        `;

        const result = await client.query(updateQuery, [approvedStatusId, file_ids]);

        // 5. Send WhatsApp message to CEO
        if (ceoUser.contact_number && result.rows.length > 0) {
            try {
                const approvedFileList = result.rows
                    .map((f, idx) => `${idx + 1}. ${f.file_number || `File #${f.id}`}${f.subject ? ` - ${f.subject}` : ''}`)
                    .join('\n');

                const whatsappMessage = 
                    `✅ *Files Approved*\n\n` +
                    `Dear ${ceoUser.user_name || 'CEO'} - CEO,\n` +
                    `You have successfully approved the following ${result.rows.length} file(s):\n\n` +
                    `${approvedFileList}\n\n` +
                    `Thank you,\nE-Filing System`;

                await sendWhatsAppMessage(ceoUser.contact_number, whatsappMessage);
            } catch (waError) {
                console.warn('WhatsApp message error on approve route:', waError.message);
            }
        }

        return NextResponse.json({
            success: true,
            approved_count: result.rowCount,
            approved_files: result.rows
        });

    } catch (error) {
        console.error('Error approving files:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}