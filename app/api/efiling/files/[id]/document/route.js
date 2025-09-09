import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction, ENTITY_TYPES } from '@/lib/actionLogger';
import { getToken } from 'next-auth/jwt';

export async function POST(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        const { content, template } = body;

        client = await connectToDatabase();

        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS efiling_document_pages (
                    id SERIAL PRIMARY KEY,
                    file_id INTEGER NOT NULL REFERENCES efiling_files(id) ON DELETE CASCADE,
                    page_number INTEGER NOT NULL,
                    page_title VARCHAR(255),
                    page_content JSONB NOT NULL,
                    page_type VARCHAR(50) DEFAULT 'MAIN',
                    is_active BOOLEAN DEFAULT true,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (tableError) {
            console.error('Error creating document pages table:', tableError);
        }

        const result = await client.query(`
            UPDATE efiling_files 
            SET document_content = $1::jsonb, updated_at = CURRENT_TIMESTAMP, page_count = $2
            WHERE id = $3
            RETURNING *
        `, [content ?? {}, body.pages ? body.pages.length : 1, id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        if (body.pages && Array.isArray(body.pages)) {
            await client.query(`
                DELETE FROM efiling_document_pages WHERE file_id = $1
            `, [id]);

            for (let i = 0; i < body.pages.length; i++) {
                const page = body.pages[i];
                await client.query(`
                    INSERT INTO efiling_document_pages 
                    (file_id, page_number, page_title, page_content, page_type, created_by)
                    VALUES ($1, $2, $3, $4::jsonb, $5, $6)
                `, [
                    id,
                    page.pageNumber || (i + 1),
                    page.title || `Page ${i + 1}`,
                    page.content ?? {},
                    page.type || 'MAIN',
                    null
                ]);
            }
        }

        await logAction(request, 'UPDATE', ENTITY_TYPES.EFILING_FILE, {
            entityId: id,
            entityName: `Document content for file ${id}`,
            details: { 
                file_id: id, 
                template_id: template,
                pages_count: body.pages ? body.pages.length : 1
            }
        });

        return NextResponse.json({ success: true, file_id: id, document_content: content, pages_saved: body.pages ? body.pages.length : 1 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}

export async function GET(request, { params }) {
    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();

        const result = await client.query(`
            SELECT id, file_number, subject, document_content, page_count, created_at, updated_at
            FROM efiling_files 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const file = result.rows[0];

        const pagesResult = await client.query(`
            SELECT id, page_number, page_title, page_content, page_type, is_active, created_at, updated_at
            FROM efiling_document_pages 
            WHERE file_id = $1 AND is_active = true
            ORDER BY page_number ASC
        `, [id]);

        const pages = pagesResult.rows.map(row => ({
            id: row.id,
            pageNumber: row.page_number,
            title: row.page_title,
            content: typeof row.page_content === 'string' ? JSON.parse(row.page_content) : (row.page_content || {}),
            type: row.page_type,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        
        return NextResponse.json({
            id: file.id,
            file_number: file.file_number,
            subject: file.subject,
            document_content: typeof file.document_content === 'string' ? JSON.parse(file.document_content) : (file.document_content || {}),
            page_count: file.page_count || 1,
            pages,
            created_at: file.created_at,
            updated_at: file.updated_at
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}

export async function PUT(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        client = await connectToDatabase();

        // Authorization: only creator or admin (role 1 or 2)
        const token = await getToken({ req: request });
        const currentUserId = token?.id;
        const currentUserRole = token?.role;
        if (!currentUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const fileRes = await client.query(`SELECT created_by FROM efiling_files WHERE id = $1`, [id]);
        if (fileRes.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const isAdmin = currentUserRole === 1 || currentUserRole === 2;
        if (!isAdmin && fileRes.rows[0].created_by !== currentUserId) {
            return NextResponse.json({ error: 'Forbidden: only creator or admin can edit document' }, { status: 403 });
        }

        const result = await client.query(`
            UPDATE efiling_files 
            SET subject = $1, document_content = $2::jsonb, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `, [body.subject, JSON.stringify(body.document_content || {}), id]);
        
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, file_id: id, subject: body.subject, document_content: body.document_content || {} });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
