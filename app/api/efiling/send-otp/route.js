import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';
import { sendOTPViaWhatsApp } from '@/lib/whatsappService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function POST(request) {
    let client;
    try {
        const { userId, method } = await request.json();
        
        // Get session to verify user
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id || userId;
        
        if (!currentUserId || !method) {
            return NextResponse.json(
                { error: 'User ID and method are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        
        // Get user's phone number and name from database
        // efiling_users table references users table via user_id, so we need to join
        const userResult = await client.query(`
            SELECT eu.id, u.name, u.contact_number, u.email
            FROM efiling_users eu
            LEFT JOIN users u ON eu.user_id = u.id
            WHERE eu.id = $1
        `, [currentUserId]);

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userResult.rows[0];
        const phoneNumber = user.contact_number;
        const userName = user.name || 'User';

        if (!phoneNumber) {
            return NextResponse.json(
                { error: 'Phone number not found. Please update your profile with a contact number.' },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Store OTP in database
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS efiling_otp_codes (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    otp_code VARCHAR(6) NOT NULL,
                    method VARCHAR(50) NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(user_id, method)
                )
            `);
        } catch (tableError) {
            // Table might already exist, continue
            console.log('OTP table check:', tableError.message);
        }

        await client.query(`
            INSERT INTO efiling_otp_codes (user_id, otp_code, method, expires_at, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (user_id, method) 
            DO UPDATE SET 
                otp_code = $2, 
                expires_at = $4, 
                created_at = NOW()
        `, [currentUserId, otpCode, method, expiresAt]);
        
        // Send OTP via WhatsApp if method is 'sms' or 'whatsapp'
        if (method === 'sms' || method === 'whatsapp') {
            try {
                console.log(`Attempting to send OTP ${otpCode} to ${phoneNumber} via WhatsApp...`);
                const whatsappResult = await sendOTPViaWhatsApp(phoneNumber, otpCode, userName);
                
                if (!whatsappResult.success) {
                    console.error('WhatsApp OTP send failed:', whatsappResult.error);
                    // Still store OTP in database even if WhatsApp fails
                    // Return error but allow manual OTP entry for testing
                    return NextResponse.json({
                        success: false,
                        error: whatsappResult.error || 'Failed to send OTP via WhatsApp',
                        message: 'OTP generated but WhatsApp delivery failed. Please try again or contact support.',
                        // Include OTP in development mode for testing
                        ...(process.env.NODE_ENV === 'development' && { otpCode: otpCode })
                    }, { status: 500 });
                }
                
                console.log(`OTP ${otpCode} sent to user ${currentUserId} (${phoneNumber}) via WhatsApp`);
            } catch (whatsappError) {
                console.error('Exception while sending WhatsApp OTP:', whatsappError);
                // Log the full error for debugging
                console.error('WhatsApp error details:', {
                    message: whatsappError.message,
                    stack: whatsappError.stack,
                    phoneNumber: phoneNumber,
                    otpCode: otpCode
                });
                
                // Return error but don't fail completely - OTP is still stored in DB
                return NextResponse.json({
                    success: false,
                    error: whatsappError.message || 'Failed to send OTP via WhatsApp',
                    message: 'OTP was generated but could not be sent. Please try again.',
                    // Include OTP in development mode for testing
                    ...(process.env.NODE_ENV === 'development' && { otpCode: otpCode })
                }, { status: 500 });
            }
        }
        
        // Log the action
        try {
            await logAction('SEND_OTP', `OTP sent to user ${currentUserId} via ${method}`, currentUserId);
        } catch (logError) {
            console.error('Error logging action:', logError);
            // Don't fail if logging fails
        }
        
        return NextResponse.json({
            success: true,
            message: method === 'sms' || method === 'whatsapp' 
                ? 'OTP sent to your WhatsApp number' 
                : 'Code generated for Google Authenticator',
            expiresIn: '10 minutes',
            phoneNumber: phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3') // Mask phone number
        });
        
    } catch (error) {
        console.error('Error sending OTP:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            userId: userId,
            method: method
        });
        return NextResponse.json(
            { 
                error: error.message || 'Failed to send OTP',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    } finally {
        if (client) {
            try {
                await client.release();
            } catch (releaseError) {
                console.error('Error releasing database client:', releaseError);
            }
        }
    }
}
