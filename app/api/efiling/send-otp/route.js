import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';

export async function POST(request) {
    let client;
    try {
        const { userId, method } = await request.json();
        
        if (!userId || !method) {
            return NextResponse.json(
                { error: 'User ID and method are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        // For demo purposes, we'll simulate OTP generation
        // In production, you would integrate with actual SMS/email services
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Store OTP in database (you'll need to create this table)
        await client.query(`
            INSERT INTO efiling_otp_codes (user_id, otp_code, method, expires_at, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (user_id, method) 
            DO UPDATE SET 
                otp_code = $2, 
                expires_at = $4, 
                created_at = NOW()
        `, [userId, otpCode, method, expiresAt]);
        
        // Log the action
        await logAction('SEND_OTP', `OTP sent to user ${userId} via ${method}`, userId);
        
        // In production, send actual SMS/email here
        console.log(`OTP ${otpCode} sent to user ${userId} via ${method}`);
        
        return NextResponse.json({
            success: true,
            message: method === 'sms' ? 'OTP sent to your phone' : 'Code generated for Google Authenticator',
            expiresIn: '10 minutes'
        });
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json(
            { error: 'Failed to send OTP' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
