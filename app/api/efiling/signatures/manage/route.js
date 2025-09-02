import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function POST(request) {
    try {
        const { action, signatureId, userId } = await request.json();
        
        if (!action || !signatureId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        if (action === 'activate') {
            // Deactivate all signatures for the user
            await client.query(
                `UPDATE efiling_user_signatures SET is_active = false WHERE user_id = $1`,
                [userId]
            );

            // Activate the selected signature
            const result = await client.query(
                `UPDATE efiling_user_signatures 
                 SET is_active = true 
                 WHERE id = $1 AND user_id = $2
                 RETURNING *`,
                [signatureId, userId]
            );

            if (result.rows.length === 0) {
                await client.release();
                return NextResponse.json(
                    { error: 'Signature not found' },
                    { status: 404 }
                );
            }

            await client.release();
            return NextResponse.json({
                success: true,
                message: 'Signature activated successfully',
                signature: result.rows[0]
            });

        } else if (action === 'deactivate') {
            // Deactivate the selected signature
            const result = await client.query(
                `UPDATE efiling_user_signatures 
                 SET is_active = false 
                 WHERE id = $1 AND user_id = $2
                 RETURNING *`,
                [signatureId, userId]
            );

            if (result.rows.length === 0) {
                await client.release();
                return NextResponse.json(
                    { error: 'Signature not found' },
                    { status: 404 }
                );
            }

            await client.release();
            return NextResponse.json({
                success: true,
                message: 'Signature deactivated successfully',
                signature: result.rows[0]
            });

        } else if (action === 'delete') {
            // Delete the signature
            const result = await client.query(
                `DELETE FROM efiling_user_signatures 
                 WHERE id = $1 AND user_id = $2
                 RETURNING *`,
                [signatureId, userId]
            );

            if (result.rows.length === 0) {
                await client.release();
                return NextResponse.json(
                    { error: 'Signature not found' },
                    { status: 404 }
                );
            }

            await client.release();
            return NextResponse.json({
                success: true,
                message: 'Signature deleted successfully'
            });

        } else {
            await client.release();
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error managing signature:', error);
        return NextResponse.json(
            { error: 'Failed to manage signature' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();
        
        // Get all signatures for the user
        const result = await client.query(
            `SELECT * FROM efiling_user_signatures 
             WHERE user_id = $1 
             ORDER BY signature_type, created_at DESC`,
            [userId]
        );

        await client.release();

        return NextResponse.json({
            success: true,
            signatures: result.rows
        });

    } catch (error) {
        console.error('Error fetching signatures:', error);
        return NextResponse.json(
            { error: 'Failed to fetch signatures' },
            { status: 500 }
        );
    }
}
