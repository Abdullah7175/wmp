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
        const { file_id } = body;

        if (!file_id) {
            return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        }

        // 1. Get current e-filing user details
        const userRes = await client.query(`
            SELECT eu.id as efiling_user_id, u.name as user_name, u.contact_number
            FROM efiling_users eu
            JOIN users u ON eu.user_id = u.id
            WHERE eu.user_id = $1 AND eu.is_active = true
        `, [session.user.id]);

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'E-filing user not found' }, { status: 404 });
        }

        const currentUser = userRes.rows[0];

        // 2. Fetch file and verify conditions
        const fileRes = await client.query(`
            SELECT f.id, f.file_number, f.subject, f.created_by, f.assigned_to, f.status_id, fs.code as status_code
            FROM efiling_files f
            LEFT JOIN efiling_file_status fs ON f.status_id = fs.id
            WHERE f.id = $1
        `, [file_id]);

        if (fileRes.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const file = fileRes.rows[0];

        // Condition Check 1: Creator authorization
        if (Number(file.created_by) !== Number(currentUser.efiling_user_id)) {
            return NextResponse.json({ error: 'You are not the creator of this file and cannot discard it.' }, { status: 403 });
        }

        // Condition Check 2: Current assignee authorization
        if ((Number(file.assigned_to) !== Number(currentUser.efiling_user_id)) && (file.assigned_to != null)) {
            return NextResponse.json({ 
                error: 'The file is currently marked to another user. It must be marked back to you before you can discard it.' 
            }, { status: 403 });
        }

        // Condition Check 3: Status check (Draft or In Progress only)
        const allowedStatusCodes = ['DRAFT', 'IN_PROGRESS'];
        const allowedStatusIds = [1, 3]; // Adjust ID numbers if your DB differs for DRAFT/IN_PROGRESS
        if (!allowedStatusCodes.includes(file.status_code) && !allowedStatusIds.includes(Number(file.status_id))) {
            return NextResponse.json({ error: 'Only files in "Draft" or "In Progress" status can be discarded.' }, { status: 400 });
        }

        // 3. Get Discarded status ID (ID 9 or code 'DISCARDED')
        let discardedStatusId = 9;
        const statusRes = await client.query(`SELECT id FROM efiling_file_status WHERE code = 'DISCARDED' OR id = 9 LIMIT 1`);
        if (statusRes.rows.length > 0) {
            discardedStatusId = statusRes.rows[0].id;
        }

        // 4. Update status and timestamp
        const updateRes = await client.query(`
            UPDATE efiling_files 
            SET status_id = $1, 
                updated_at = NOW(),
                sla_deadline = null
            WHERE id = $2
            RETURNING id, file_number, subject, updated_at
        `, [discardedStatusId, file_id]);

        const updatedFile = updateRes.rows[0];

        // 5. Send WhatsApp notification to creator
        if (currentUser.contact_number) {
            try {
                const whatsappMessage = 
                    `🗑️ *File Discarded*\n\n` +
                    `Dear ${currentUser.user_name},\n` +
                    `The file *${updatedFile.file_number || `#${updatedFile.id}`}* (${updatedFile.subject || 'No Subject'}) has been discarded by you.\n\n` +
                    `Thank you,\nE-Filing System`;

                await sendWhatsAppMessage(currentUser.contact_number, whatsappMessage);
            } catch (waError) {
                console.warn('WhatsApp message error on discard route:', waError.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `File ${updatedFile.file_number || updatedFile.id} discarded successfully.`,
            file: updatedFile
        });

    } catch (error) {
        console.error('Error discarding file:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}