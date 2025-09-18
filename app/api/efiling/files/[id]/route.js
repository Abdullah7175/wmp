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
        
        client = await connectToDatabase();
        
        // Check if file exists
        const existingFile = await client.query(
            'SELECT * FROM efiling_files WHERE id = $1',
            [id]
        );
        
        if (existingFile.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        // Soft delete by setting is_active to false
        await client.query(
            'UPDATE efiling_files SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        
        // Log the action
        // await logAction(request, 'DELETE', ENTITY_TYPES.EFILING_FILE, {
        //     entityId: id,
        //     entityName: existingFile.rows[0].file_number,
        //     details: { softDelete: true }
        // });
        
        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
} 