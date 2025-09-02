import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';

export async function POST(request) {
    let client;
    try {
        const { userId, method, code } = await request.json();
        
        if (!userId || !method || !code) {
            return NextResponse.json(
                { error: 'User ID, method, and code are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        // Verify the OTP/code from the database
        const result = await client.query(`
            SELECT otp_code, expires_at 
            FROM efiling_otp_codes 
            WHERE user_id = $1 AND method = $2 AND expires_at > NOW()
            ORDER BY created_at DESC 
            LIMIT 1
        `, [userId, method]);
        
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or expired code' },
                { status: 400 }
            );
        }
        
        const storedCode = result.rows[0].otp_code;
        
        // Verify the code
        if (code !== storedCode) {
            return NextResponse.json(
                { error: 'Invalid code' },
                { status: 400 }
            );
        }
        
        // Delete the used OTP
        await client.query(`
            DELETE FROM efiling_otp_codes 
            WHERE user_id = $1 AND method = $2
        `, [userId, method]);
        
        // Log the successful authentication
        await logAction('VERIFY_AUTH', `User ${userId} authenticated via ${method}`, userId);
        
        return NextResponse.json({
            success: true,
            message: 'Authentication successful'
        });
        
    } catch (error) {
        console.error('Error verifying authentication:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
