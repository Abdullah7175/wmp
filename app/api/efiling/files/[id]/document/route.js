import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction, ENTITY_TYPES } from '@/lib/actionLogger';

export async function POST(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        const { content, template } = body;

        client = await connectToDatabase();

        // Check if the efiling_documents table exists, if not create it
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS efiling_documents (
                    id SERIAL PRIMARY KEY,
                    file_id INTEGER NOT NULL REFERENCES efiling_files(id) ON DELETE CASCADE,
                    content JSONB NOT NULL,
                    template_id INTEGER,
                    created_by INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    version INTEGER DEFAULT 1
                )
            `);
        } catch (tableError) {
            console.error('Error creating documents table:', tableError);
        }

        // Check if document already exists for this file
        const existingDoc = await client.query(
            'SELECT id FROM efiling_documents WHERE file_id = $1',
            [id]
        );

        if (existingDoc.rows.length > 0) {
            // Update existing document
            const result = await client.query(`
                UPDATE efiling_documents 
                SET content = $1, template_id = $2, updated_at = CURRENT_TIMESTAMP, version = version + 1
                WHERE file_id = $3
                RETURNING *
            `, [JSON.stringify(content), template, id]);

            // Log the action
            await logAction(request, 'UPDATE', ENTITY_TYPES.EFILING_DOCUMENT, {
                entityId: result.rows[0].id,
                entityName: `Document for file ${id}`,
                details: { file_id: id, template_id: template }
            });

            return NextResponse.json(result.rows[0]);
        } else {
            // Create new document
            const result = await client.query(`
                INSERT INTO efiling_documents (file_id, content, template_id, created_by)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [id, JSON.stringify(content), template, null]); // created_by will be set from session

            // Log the action
            await logAction(request, 'CREATE', ENTITY_TYPES.EFILING_DOCUMENT, {
                entityId: result.rows[0].id,
                entityName: `Document for file ${id}`,
                details: { file_id: id, template_id: template }
            });

            return NextResponse.json(result.rows[0], { status: 201 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function GET(request, { params }) {
    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();

        // Check if the efiling_documents table exists
        try {
            const tableCheck = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'efiling_documents'
                );
            `);

            if (!tableCheck.rows[0].exists) {
                return NextResponse.json({ error: 'Documents table does not exist' }, { status: 404 });
            }
        } catch (tableError) {
            console.error('Error checking documents table existence:', tableError);
            return NextResponse.json({ error: 'Documents table does not exist' }, { status: 404 });
        }

        // Fetch document content
        const result = await client.query(`
            SELECT * FROM efiling_documents WHERE file_id = $1 ORDER BY version DESC LIMIT 1
        `, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

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

export async function PUT(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        
        client = await connectToDatabase();
        
        // Update document
        const result = await client.query(`
            UPDATE efiling_documents 
            SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND file_id = $4
            RETURNING *
        `, [body.title, body.description, body.document_id, id]);
        
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        
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
