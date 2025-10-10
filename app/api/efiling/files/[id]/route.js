import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request, { params }) {
    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();

        // Fetch file with detailed information
        const result = await client.query(`
            SELECT 
                f.*,
                d.name as department_name,
                c.name as category_name,
                s.name as status_name,
                s.code as status_code,
                s.color as status_color,
                COALESCE(ab.designation, 'Unassigned') as assigned_to_name,
                f.work_request_id,
                COALESCE(creator_users.name, 'Unknown') as creator_user_name,
                creator_users.name as created_by_name,
                CASE 
                    WHEN f.work_request_id IS NOT NULL THEN 'Yes'
                    ELSE 'No'
                END as has_video_request
            FROM efiling_files f
            LEFT JOIN efiling_departments d ON f.department_id = d.id
            LEFT JOIN efiling_file_categories c ON f.category_id = c.id
            LEFT JOIN efiling_file_status s ON f.status_id = s.id
            LEFT JOIN efiling_users ab ON f.assigned_to = ab.id
            LEFT JOIN efiling_users creator_efiling ON f.created_by = creator_efiling.id
            LEFT JOIN users creator_users ON creator_efiling.user_id = creator_users.id
            WHERE f.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error('Error fetching file:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function PUT(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        
        client = await connectToDatabase();
        
        // Check if file exists
        const existingFile = await client.query(
            'SELECT * FROM efiling_files WHERE id = $1',
            [id]
        );
        
        if (existingFile.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        // Update file fields
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;
        
        if (body.subject !== undefined) {
            updateFields.push(`subject = $${paramCount}`);
            updateValues.push(body.subject);
            paramCount++;
        }
        
        if (body.category_id !== undefined) {
            updateFields.push(`category_id = $${paramCount}`);
            updateValues.push(body.category_id);
            paramCount++;
        }
        
        if (body.department_id !== undefined) {
            updateFields.push(`department_id = $${paramCount}`);
            updateValues.push(body.department_id);
            paramCount++;
        }
        
        if (body.status_id !== undefined) {
            updateFields.push(`status_id = $${paramCount}`);
            updateValues.push(body.status_id);
            paramCount++;
        }
        
        if (body.priority !== undefined) {
            updateFields.push(`priority = $${paramCount}`);
            updateValues.push(body.priority);
            paramCount++;
        }
        
        if (body.confidentiality_level !== undefined) {
            updateFields.push(`confidentiality_level = $${paramCount}`);
            updateValues.push(body.confidentiality_level);
            paramCount++;
        }
        
        if (body.assigned_to !== undefined) {
            updateFields.push(`assigned_to = $${paramCount}`);
            updateValues.push(body.assigned_to);
            paramCount++;
        }
        
        if (body.remarks !== undefined) {
            updateFields.push(`remarks = $${paramCount}`);
            updateValues.push(body.remarks);
            paramCount++;
        }
        
        if (updateFields.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }
        
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);
        
        const query = `
            UPDATE efiling_files 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        
        const result = await client.query(query, updateValues);
        
        // Log the action
        // await logAction(request, 'UPDATE', ENTITY_TYPES.EFILING_FILE, {
        //     entityId: id,
        //     entityName: result.rows[0].file_number,
        //     details: { updatedFields: Object.keys(body) }
        // });
        
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function DELETE(request, { params }) {
    let client;
    try {
        const { id } = await params;

        // Admin-only hard delete with full cleanup
        const { getToken } = await import('next-auth/jwt');
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.role || ![1, 2].includes(token.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        client = await connectToDatabase();

        // Check if file exists
        const existingFile = await client.query(
            'SELECT id, file_number FROM efiling_files WHERE id = $1',
            [id]
        );
        if (existingFile.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        await client.query('BEGIN');

        // Clean up non-cascading dependencies first (some FKs lack ON DELETE CASCADE)
        await client.query('DELETE FROM efiling_document_comments WHERE file_id = $1', [id]);
        await client.query('DELETE FROM efiling_user_actions WHERE file_id::text = $1::text', [String(id)]);
        await client.query('DELETE FROM efiling_file_attachments WHERE file_id = $1', [String(id)]);

        // Proactively clear related records even if cascades exist (idempotent)
        await client.query('DELETE FROM efiling_documents WHERE file_id = $1', [id]);
        await client.query('DELETE FROM efiling_document_pages WHERE file_id = $1', [id]);
        await client.query('DELETE FROM efiling_document_signatures WHERE file_id = $1', [id]);
        await client.query('DELETE FROM efiling_file_movements WHERE file_id = $1', [id]);
        await client.query('DELETE FROM efiling_notifications WHERE file_id = $1', [id]);
        await client.query('DELETE FROM efiling_signatures WHERE file_id = $1', [id]);

        // Remove workflow instance tree (actions, stage instances will cascade via workflow_id)
        await client.query('DELETE FROM efiling_file_workflows WHERE file_id = $1', [id]);

        // Finally delete the file
        await client.query('DELETE FROM efiling_files WHERE id = $1', [id]);

        await client.query('COMMIT');

        return NextResponse.json({ success: true, message: 'File and related data deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        if (client) {
            try { await client.query('ROLLBACK'); } catch {}
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
} 