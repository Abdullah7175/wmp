import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';

export async function POST(request) {
    let client;
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) return authResult;
        
        const { user: sessionUser } = authResult;
        const isAdmin = [1, 2].includes(parseInt(sessionUser.role));
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No file IDs provided' }, { status: 400 });
        }

        const fileIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
        const stringIds = fileIds.map(id => String(id));

        client = await connectToDatabase();
        await client.query('BEGIN');

        // 1. Delete dependent child records for all target file IDs
        await client.query('DELETE FROM efiling_document_comments WHERE file_id = ANY($1::int[])', [fileIds]);
        await client.query('DELETE FROM efiling_user_actions WHERE file_id::text = ANY($1::text[])', [stringIds]);
        await client.query('DELETE FROM efiling_file_attachments WHERE file_id = ANY($1::text[])', [stringIds]);
        await client.query('DELETE FROM efiling_documents WHERE file_id = ANY($1::int[])', [fileIds]);
        await client.query('DELETE FROM efiling_document_pages WHERE file_id = ANY($1::int[])', [fileIds]);
        await client.query('DELETE FROM efiling_document_signatures WHERE file_id = ANY($1::int[])', [fileIds]);
        await client.query('DELETE FROM efiling_file_movements WHERE file_id = ANY($1::int[])', [fileIds]);
        await client.query('DELETE FROM efiling_notifications WHERE file_id = ANY($1::int[])', [fileIds]);
        await client.query('DELETE FROM efiling_signatures WHERE file_id = ANY($1::int[])', [fileIds]);
        await client.query('DELETE FROM efiling_files_costing WHERE file_id = ANY($1::int[])', [fileIds]);

        // 2. Delete main files
        const deleteResult = await client.query('DELETE FROM efiling_files WHERE id = ANY($1::int[])', [fileIds]);

        await client.query('COMMIT');

        return NextResponse.json({ 
            success: true, 
            message: `Successfully deleted ${deleteResult.rowCount} files and associated records.` 
        });
    } catch (error) {
        if (client) {
            try { await client.query('ROLLBACK'); } catch {}
        }
        console.error('Bulk delete error:', error);
        return NextResponse.json({ error: 'Failed to delete selected files' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}