import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';

// GET - Fetch signatures for a file
export async function GET(request, { params }) {
    const { id } = await params;
    let client;

    try {
        client = await connectToDatabase();
        
        // Check if signatures table exists, create if not
        await client.query(`
            CREATE TABLE IF NOT EXISTS efiling_document_signatures (
                id SERIAL PRIMARY KEY,
                file_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                user_role VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                position JSONB NOT NULL,
                font VARCHAR(100),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (file_id) REFERENCES efiling_files(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Fetch signatures for the file
        const result = await client.query(`
            SELECT * FROM efiling_document_signatures 
            WHERE file_id = $1 AND is_active = TRUE 
            ORDER BY timestamp ASC
        `, [id]);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching signatures:', error);
        return NextResponse.json(
            { error: 'Failed to fetch signatures' },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}

// POST - Add a new signature to a file
export async function POST(request, { params }) {
    const { id } = await params;
    let client;

    try {
        const body = await request.json();
        const { user_id, user_name, user_role, type, content, position, font } = body;

        // Validate required fields
        if (!user_id || !user_name || !user_role || !type || !content || !position) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        // Check if signatures table exists, create if not
        await client.query(`
            CREATE TABLE IF NOT EXISTS efiling_document_signatures (
                id SERIAL PRIMARY KEY,
                file_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                user_role VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                position JSONB NOT NULL,
                font VARCHAR(100),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (file_id) REFERENCES efiling_files(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Insert new signature
        const result = await client.query(`
            INSERT INTO efiling_document_signatures 
            (file_id, user_id, user_name, user_role, type, content, position, font)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [id, user_id, user_name, user_role, type, content, position, font]);

        // Log the action
        await logAction({
            user_id,
            file_id: id,
            action_type: 'ADD_SIGNATURE',
            details: `Added ${type} signature to document`,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding signature:', error);
        return NextResponse.json(
            { error: 'Failed to add signature' },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
