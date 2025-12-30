import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';
import { sendOTPViaWhatsApp } from '@/lib/whatsappService';
import { sendOTPViaEmail } from '@/lib/emailService';
import { auth } from '@/auth';

export async function POST(request) {
    let client;
    let userId;
    const body = await request.json();
    const method = body.method || 'whatsapp'; // Default to whatsapp, but allow email
    try {
        // Call auth first before reading request body to avoid "body already consumed" error
        let session;
        let sessionUserId;
        try {
            session = await auth();
            sessionUserId = session?.user?.id; // This is users.id
        } catch (authError) {
            console.error('Auth error in send-otp:', authError);
            // Continue without session if auth fails - might be using userId directly
        }
        
        userId = body.userId;
        
        if (!sessionUserId && !userId) {
            return NextResponse.json(
                { error: 'User authentication required' },
                { status: 401 }
            );
        }

        client = await connectToDatabase();
        
        // Get user's phone number and name from database
        // session.user.id is users.id, so we need to find efiling_users by user_id
        // OR if userId is provided and it's an efiling_users.id, use that
        let userResult;
        if (userId && !sessionUserId) {
            // If userId is provided and no session, assume it's efiling_users.id
            userResult = await client.query(`
                SELECT eu.id, u.name, u.contact_number, u.email, eu.google_email
                FROM efiling_users eu
                LEFT JOIN users u ON eu.user_id = u.id
                WHERE eu.id = $1
            `, [userId]);
        } else {
            // Use session user.id (which is users.id) to find efiling_users
            // Get the most recent active efiling_users record for this user
            userResult = await client.query(`
                SELECT eu.id, u.name, u.contact_number, u.email, eu.google_email
                FROM efiling_users eu
                LEFT JOIN users u ON eu.user_id = u.id
                WHERE eu.user_id = $1 AND eu.is_active = true
                ORDER BY eu.id DESC
                LIMIT 1
            `, [sessionUserId]);
        }

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userResult.rows[0];
        
        // Debug: Log what we retrieved
        console.log('Retrieved user data:', {
            efilingUserId: user.id,
            name: user.name,
            contact_number: user.contact_number,
            email: user.email,
            google_email: user.google_email,
            sessionUserId: sessionUserId,
            sessionName: session?.user?.name
        });
        const efilingUserId = user.id; // This is efiling_users.id
        const phoneNumber = user.contact_number;
        // Use google_email from efiling_users table for email verification, fallback to users.email
        const email = user.google_email || user.email;
        // Use session name if available (it's more reliable), otherwise fall back to database name
        const userName = session?.user?.name || user.name || 'User';

        // Validate contact method based on selected method
        if (method === 'whatsapp' && !phoneNumber) {
            return NextResponse.json(
                { error: 'Phone number not found. Please update your profile with a contact number.' },
                { status: 400 }
            );
        }

        if (method === 'email' && !email) {
            return NextResponse.json(
                { error: 'Email address not found. Please update your profile with an email address.' },
                { status: 400 }
            );
        }

        // Check OTP rate limiting (max 3 requests per user)
        // Also get the time since last OTP to show countdown
        const rateLimitCheck = await client.query(`
            SELECT COUNT(*) as count,
                   MAX(created_at) as last_otp_time
            FROM efiling_otp_codes
            WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'
        `, [efilingUserId]);
        
        const recentOTPCount = parseInt(rateLimitCheck.rows[0]?.count || 0);
        const lastOtpTime = rateLimitCheck.rows[0]?.last_otp_time;
        
        if (recentOTPCount >= 3) {
            // Calculate seconds remaining until 60 seconds have passed since last OTP
            let secondsRemaining = 60;
            if (lastOtpTime) {
                const lastOtpDate = new Date(lastOtpTime);
                const now = new Date();
                const secondsSinceLastOtp = Math.floor((now - lastOtpDate) / 1000);
                secondsRemaining = Math.max(0, 60 - secondsSinceLastOtp);
            }
            
            return NextResponse.json(
                { 
                    error: 'Your last OTP timer is still active. Please wait for 60 seconds before requesting another OTP.',
                    message: `Your last OTP timer is still active. Please wait ${secondsRemaining} more seconds before requesting another OTP.`,
                    rateLimited: true,
                    secondsRemaining: secondsRemaining,
                    forceEmail: method === 'whatsapp' // Suggest email if WhatsApp was attempted
                },
                { status: 429 }
            );
        }

        // Check WhatsApp failure count - force email after 3 failures
        if (method === 'whatsapp') {
            const whatsappFailureCheck = await client.query(`
                SELECT COUNT(*) as failure_count
                FROM efiling_otp_codes
                WHERE user_id = $1 
                AND method = 'whatsapp'
                AND created_at > NOW() - INTERVAL '1 hour'
                AND expires_at < NOW() - INTERVAL '1 minute'
            `, [efilingUserId]);
            
            const failureCount = parseInt(whatsappFailureCheck.rows[0]?.failure_count || 0);
            if (failureCount >= 3) {
                // Force email verification after 3 WhatsApp failures
                if (!email) {
                    return NextResponse.json(
                        { 
                            error: 'WhatsApp verification has failed multiple times. Email verification is required, but no email address is available. Please contact support.',
                            forceEmail: true
                        },
                        { status: 400 }
                    );
                }
                
                // Automatically switch to email
                return NextResponse.json(
                    { 
                        error: 'WhatsApp verification has failed multiple times. Switching to email verification.',
                        forceEmail: true,
                        message: 'Please use email verification instead.'
                    },
                    { status: 400 }
                );
            }
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds
        
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
                    verified BOOLEAN DEFAULT FALSE
                )
            `);
            
            // Add verified column if it doesn't exist (for existing tables)
            await client.query(`
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'efiling_otp_codes' 
                        AND column_name = 'verified'
                    ) THEN
                        ALTER TABLE efiling_otp_codes ADD COLUMN verified BOOLEAN DEFAULT FALSE;
                    END IF;
                END $$;
            `);
            
            // Remove unique constraint if it exists (to allow multiple OTPs for rate limiting)
            try {
                await client.query(`
                    ALTER TABLE efiling_otp_codes 
                    DROP CONSTRAINT IF EXISTS efiling_otp_codes_user_id_method_key
                `);
            } catch (constraintError) {
                // Constraint might not exist, continue
                console.log('Constraint removal check:', constraintError.message);
            }
        } catch (tableError) {
            // Table might already exist, continue
            console.log('OTP table check:', tableError.message);
        }

        // Insert new OTP (allow multiple OTPs per user for rate limiting tracking)
        // Use ON CONFLICT UPDATE if unique constraint still exists (for backward compatibility)
        try {
            await client.query(`
                INSERT INTO efiling_otp_codes (user_id, otp_code, method, expires_at, created_at, verified)
                VALUES ($1, $2, $3, $4, NOW(), FALSE)
                ON CONFLICT (user_id, method) 
                DO UPDATE SET 
                    otp_code = EXCLUDED.otp_code,
                    expires_at = EXCLUDED.expires_at,
                    created_at = NOW(),
                    verified = FALSE
            `, [efilingUserId, otpCode, method, expiresAt]);
        } catch (insertError) {
            // If ON CONFLICT fails (constraint doesn't exist), try simple INSERT
            if (insertError.message.includes('ON CONFLICT')) {
                await client.query(`
                    INSERT INTO efiling_otp_codes (user_id, otp_code, method, expires_at, created_at, verified)
                    VALUES ($1, $2, $3, $4, NOW(), FALSE)
                `, [efilingUserId, otpCode, method, expiresAt]);
            } else {
                throw insertError;
            }
        }
        
        // Clean up old expired OTPs (older than 1 hour)
        await client.query(`
            DELETE FROM efiling_otp_codes 
            WHERE expires_at < NOW() - INTERVAL '1 hour'
        `);
        
        // Check if current user is admin (for admin fallback when WhatsApp fails)
        const isAdmin = session?.user?.role && [1, 2].includes(parseInt(session.user.role));
        console.log('[OTP DEBUG] Admin check:', {
            hasSession: !!session,
            userRole: session?.user?.role,
            isAdmin: isAdmin,
            sessionUserId: sessionUserId
        });
        
        // Send OTP via selected method
        try {
            let sendResult;
            
            if (method === 'email') {
                console.log(`Attempting to send OTP ${otpCode} to ${email} via Email...`);
                sendResult = await sendOTPViaEmail(email, otpCode, userName);
            } else {
                // Default to WhatsApp
                console.log(`Attempting to send OTP ${otpCode} to ${phoneNumber} via WhatsApp...`);
                sendResult = await sendOTPViaWhatsApp(phoneNumber, otpCode, userName);
            }
            
            if (!sendResult.success) {
                console.error(`${method.toUpperCase()} OTP send failed:`, sendResult.error);
                
                // If WhatsApp fails and user has email, suggest email verification
                if (method === 'whatsapp' && email) {
                    // Mark this as a failure for tracking
                    await client.query(`
                        UPDATE efiling_otp_codes 
                        SET verified = FALSE
                        WHERE user_id = $1 AND method = 'whatsapp' AND otp_code = $2
                    `, [efilingUserId, otpCode]);
                    
                    return NextResponse.json({
                        success: false,
                        error: sendResult.error || `Failed to send OTP via WhatsApp`,
                        message: `WhatsApp delivery failed. Please try email verification instead.`,
                        forceEmail: true,
                        requiresEmail: true,
                        // Include OTP in development mode for testing
                        ...(process.env.NODE_ENV === 'development' && { otpCode: otpCode })
                    }, { status: 500 });
                }
                
                // SECURITY: Log OTP for admin users only (server-side only, never exposed to browser)
                if (isAdmin) {
                    console.log(`[ADMIN OTP LOG] ${method.toUpperCase()} failed. OTP for user ${efilingUserId} (${userName}): ${otpCode}`);
                    console.log(`[ADMIN OTP LOG] User can verify this OTP manually. Expires at: ${expiresAt.toISOString()}`);
                }
                
                // Still store OTP in database even if sending fails
                // Return error but allow manual OTP entry for testing
                return NextResponse.json({
                    success: false,
                    error: sendResult.error || `Failed to send OTP via ${method}`,
                    message: `OTP generated but ${method} delivery failed. Please try again or contact support.`,
                    // Include OTP in development mode for testing
                    ...(process.env.NODE_ENV === 'development' && { otpCode: otpCode })
                }, { status: 500 });
            }
            
            console.log(`OTP ${otpCode} sent to user ${efilingUserId} via ${method}`);
        } catch (sendError) {
            console.error(`Exception while sending ${method.toUpperCase()} OTP:`, sendError);
            // Log the full error for debugging
            console.error(`${method.toUpperCase()} error details:`, {
                message: sendError.message,
                stack: sendError.stack,
                contact: method === 'email' ? email : phoneNumber,
                otpCode: otpCode
            });
            
            // SECURITY: Log OTP for admin users only (server-side only, never exposed to browser)
            if (isAdmin) {
                console.log(`[ADMIN OTP LOG] ${method.toUpperCase()} exception. OTP for user ${efilingUserId} (${userName}): ${otpCode}`);
                console.log(`[ADMIN OTP LOG] User can verify this OTP manually. Expires at: ${expiresAt.toISOString()}`);
            }
            
            // Return error but don't fail completely - OTP is still stored in DB
            return NextResponse.json({
                success: false,
                error: sendError.message || `Failed to send OTP via ${method}`,
                message: 'OTP was generated but could not be sent. Please try again.',
                // Include OTP in development mode for testing
                ...(process.env.NODE_ENV === 'development' && { otpCode: otpCode })
            }, { status: 500 });
        }
        
        // Log the action
        try {
            await logAction(request, 'SEND_OTP', 'efiling_otp', {
                entityId: efilingUserId,
                entityName: `User ${efilingUserId}`,
                details: { 
                    method, 
                    contact: method === 'email' 
                        ? (email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'N/A')
                        : (phoneNumber ? phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3') : 'N/A')
                }
            });
        } catch (logError) {
            console.error('Error logging action:', logError);
            // Don't fail if logging fails
        }
        
        // Return success message based on method
        const successMessage = method === 'email' 
            ? 'OTP sent to your email address'
            : 'OTP sent to your WhatsApp number';
        
        const contactInfo = method === 'email'
            ? email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : email // Mask email
            : phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3'); // Mask phone number

        return NextResponse.json({
            success: true,
            message: successMessage,
            expiresIn: '60 seconds',
            expiresInSeconds: 60,
            method: method,
            contact: contactInfo
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
