import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request, { params }) {
    let client;
    try {
        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        client = await connectToDatabase();

        // File created event
        const fileRes = await client.query(`
            SELECT id, created_at FROM efiling_files WHERE id = $1
        `, [id]);
        if (fileRes.rows.length === 0) return NextResponse.json({ error: 'File not found' }, { status: 404 });
        const file = fileRes.rows[0];

        // Movements (mark/assign)
        const moveRes = await client.query(`
            SELECT m.id, m.created_at, m.action_type, m.remarks,
                   fu.name as from_user_name, tu.name as to_user_name
            FROM efiling_file_movements m
            LEFT JOIN (
                SELECT eu.id, u.name FROM efiling_users eu LEFT JOIN users u ON eu.user_id = u.id
            ) fu ON fu.id = m.from_user_id
            LEFT JOIN (
                SELECT eu.id, u.name FROM efiling_users eu LEFT JOIN users u ON eu.user_id = u.id
            ) tu ON tu.id = m.to_user_id
            WHERE m.file_id = $1
            ORDER BY m.created_at ASC
        `, [id]);

        // Signatures
        const sigRes = await client.query(`
            SELECT id, user_name, user_role, type, timestamp
            FROM efiling_document_signatures
            WHERE file_id = $1 AND is_active = true
            ORDER BY timestamp ASC
        `, [id]);

        const events = [];
        events.push({
            type: 'CREATED',
            title: 'File Created',
            timestamp: file.created_at,
            meta: {}
        });
        for (const m of moveRes.rows) {
            events.push({
                type: 'ASSIGNED',
                title: `Marked to ${m.to_user_name || 'user'}`,
                timestamp: m.created_at,
                meta: { from: m.from_user_name, to: m.to_user_name, remarks: m.remarks }
            });
        }
        for (const s of sigRes.rows) {
            events.push({
                type: 'SIGNED',
                title: `Signature by ${s.user_name}`,
                timestamp: s.timestamp,
                meta: { role: s.user_role, signType: s.type }
            });
        }

        events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return NextResponse.json({ events });
    } catch (e) {
        console.error('Timeline error:', e);
        return NextResponse.json({ error: 'Failed to load timeline' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
