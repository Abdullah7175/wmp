import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction } from '@/lib/actionLogger';
import { auth } from '@/auth';

export async function POST(request) {
    let client;
    try {
        const { userId, code } = await request.json();
        
        if (!userId || !code) {
            return NextResponse.json(
                { error: 'User ID and code are required' },
                { status: 400 }
            );
        }
        
        // Always use WhatsApp method
        const method = 'whatsapp';

        client = await connectToDatabase();
        
        // userId might be users.id (from session) or efiling_users.id
        // OTP is stored in efiling_otp_codes.user_id as varchar(255) with efiling_users.id as string
        // We need to always convert users.id to efiling_users.id first
        
        const session = await auth();
        const sessionUserId = session?.user?.id;
        
        let efilingUserId = userId;
        
        // If userId matches session user.id, it's users.id - need to convert to efiling_users.id
        if (sessionUserId && userId === sessionUserId) {
            // userId is users.id, need to find efiling_users.id
            const efilingUserResult = await client.query(`
                SELECT id FROM efiling_users 
                WHERE user_id = $1 AND is_active = true
                ORDER BY id DESC
                LIMIT 1
            `, [userId]);
            
            if (efilingUserResult.rows.length > 0) {
                efilingUserId = efilingUserResult.rows[0].id;
                console.log('Converted users.id to efiling_users.id:', { 
                    usersId: userId, 
                    efilingUserId: efilingUserId,
                    efilingUserIdType: typeof efilingUserId
                });
            } else {
                console.log('No efiling_users record found for users.id:', userId);
                return NextResponse.json(
                    { error: 'E-filing user not found' },
                    { status: 404 }
                );
            }
        }
        
        // Convert efilingUserId to string since efiling_otp_codes.user_id is varchar(255)
        const efilingUserIdStr = String(efilingUserId);
        
        // Look up OTP using efiling_users.id (as string)
        const result = await client.query(`
            SELECT otp_code, expires_at 
            FROM efiling_otp_codes 
            WHERE user_id = $1 AND method = $2 AND expires_at > NOW()
            ORDER BY created_at DESC 
            LIMIT 1
        `, [efilingUserIdStr, method]);
        
        if (result.rows.length === 0) {
            console.log('OTP verification failed - no valid OTP found:', {
                userId,
                efilingUserId,
                method,
                sessionUserId
            });
            return NextResponse.json(
                { error: 'Invalid or expired code' },
                { status: 400 }
            );
        }
        
        const storedCode = result.rows[0].otp_code;
        
        console.log('OTP verification attempt:', {
            userId,
            efilingUserId,
            method,
            providedCode: code,
            storedCode: storedCode.substring(0, 2) + '****' // Mask for security
        });
        
        // Verify the code
        if (code !== storedCode) {
            console.log('OTP verification failed - code mismatch');
            return NextResponse.json(
                { error: 'Invalid code' },
                { status: 400 }
            );
        }
        
        console.log('OTP verification successful for efiling user:', efilingUserId);
        
        // Delete the used OTP (user_id is varchar, so use string)
        await client.query(`
            DELETE FROM efiling_otp_codes 
            WHERE user_id = $1 AND method = $2
        `, [efilingUserIdStr, method]);
        
        // Log the successful authentication
        try {
            await logAction(request, 'VERIFY_AUTH', 'efiling_auth', {
                entityId: efilingUserId,
                entityName: `User ${efilingUserId}`,
                details: { method, originalUserId: userId }
            });
        } catch (logError) {
            console.error('Error logging action:', logError);
            // Don't fail if logging fails
        }
        
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
