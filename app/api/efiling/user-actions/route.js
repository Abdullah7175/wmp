import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// Get user actions with optional filtering
export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const actionType = searchParams.get('action_type');
        const limit = searchParams.get('limit') || '50';
        const offset = searchParams.get('offset') || '0';

        client = await connectToDatabase();
        
        let query = `
            SELECT 
                ua.id,
                ua.file_id,
                ua.user_id,
                ua.action_type,
                ua.description,
                ua.timestamp,
                ua.created_at,
                ua.user_type,
                ua.user_role,
                ua.user_name,
                ua.user_email,
                ua.entity_type,
                ua.entity_name,
                ua.details,
                ua.ip_address,
                ua.user_agent,
                COALESCE(ef.file_number, 'N/A') as file_number,
                COALESCE(ef.subject, 'N/A') as file_subject
            FROM efiling_user_actions ua
            LEFT JOIN efiling_files ef ON (ua.file_id IS NOT NULL AND ua.file_id = ef.id::VARCHAR)
            WHERE 1=1
        `;
        
        const queryParams = [];
        let paramCount = 0;

        if (userId) {
            paramCount++;
            query += ` AND ua.user_id = $${paramCount}::VARCHAR`;
            queryParams.push(userId.toString());
        }

        if (actionType) {
            paramCount++;
            query += ` AND ua.action_type = $${paramCount}`;
            queryParams.push(actionType);
        }

        query += ` ORDER BY ua.timestamp DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const result = await client.query(query, queryParams);
        
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching user actions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user actions' },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

// Create new user action
export async function POST(request) {
    let client;
    try {
        const body = await request.json();
        const { 
            file_id, 
            user_id, 
            action_type, 
            description, 
            user_type = 'efiling_user',
            user_role = 0,
            user_name = 'Unknown User',
            user_email = 'unknown@example.com',
            entity_type = 'efiling_file',
            entity_name = 'E-Filing File',
            details = {},
            ip_address = null,
            user_agent = null
        } = body;

        // Ensure user_id is a string to match the VARCHAR column type
        const userIdString = user_id ? user_id.toString() : null;

        if (!user_id || !action_type) {
            return NextResponse.json(
                { error: 'User ID and action type are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        const query = `
            INSERT INTO efiling_user_actions 
            (file_id, user_id, action_type, description, timestamp, created_at,
             user_type, user_role, user_name, user_email, entity_type, entity_name,
             details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, NOW(), NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        
        const result = await client.query(query, [
            file_id, userIdString, action_type, description, user_type, user_role,
            user_name, user_email, entity_type, entity_name, JSON.stringify(details),
            ip_address, user_agent
        ]);
        
        return NextResponse.json({
            success: true,
            action: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating user action:', error);
        return NextResponse.json(
            { error: 'Failed to create user action' },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
