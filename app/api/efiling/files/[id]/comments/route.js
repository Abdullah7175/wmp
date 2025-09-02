import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';

// GET - Fetch comments for a file
export async function GET(request, { params }) {
    const { id } = await params;
    let client;

    try {
        client = await connectToDatabase();
        
        // Check if comments table exists, create if not
        await client.query(`
            CREATE TABLE IF NOT EXISTS efiling_document_comments (
                id SERIAL PRIMARY KEY,
                file_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                user_role VARCHAR(100) NOT NULL,
                text TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                edited BOOLEAN DEFAULT FALSE,
                edited_at TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (file_id) REFERENCES efiling_files(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Fetch comments for the file
        const result = await client.query(`
            SELECT * FROM efiling_document_comments 
            WHERE file_id = $1 AND is_active = TRUE 
            ORDER BY timestamp ASC
        `, [id]);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}

// POST - Add a new comment to a file
export async function POST(request, { params }) {
    const { id } = await params;
    let client;

    try {
        const body = await request.json();
        const { user_id, user_name, user_role, text } = body;

        // Validate required fields
        if (!user_id || !user_name || !user_role || !text) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        // Check if comments table exists, create if not
        await client.query(`
            CREATE TABLE IF NOT EXISTS efiling_document_comments (
                id SERIAL PRIMARY KEY,
                file_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                user_role VARCHAR(100) NOT NULL,
                text TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                edited BOOLEAN DEFAULT FALSE,
                edited_at TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (file_id) REFERENCES efiling_files(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Insert new comment
        const result = await client.query(`
            INSERT INTO efiling_document_comments 
            (file_id, user_id, user_name, user_role, text)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [id, user_id, user_name, user_role, text]);

        // Log the action
        await logAction({
            user_id,
            file_id: id,
            action_type: 'ADD_COMMENT',
            details: 'Added comment to document',
            ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json(
            { error: 'Failed to add comment' },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
