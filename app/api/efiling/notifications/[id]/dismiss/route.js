import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function PUT(request, { params }) {
    let client;
    try {
        const { id } = params;
        
        if (!id) {
            return NextResponse.json(
                { error: 'Notification ID is required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        const query = `
            UPDATE efiling_notifications 
            SET is_dismissed = true, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await client.query(query, [id]);
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            notification: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error dismissing notification:', error);
        return NextResponse.json(
            { error: 'Failed to dismiss notification' },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
