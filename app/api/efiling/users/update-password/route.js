import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { comparePassword } from '@/lib/passwordUtils';

export async function POST(request) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { current_password, new_password } = body;

        if (!current_password || !new_password) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        if (new_password.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        const userId = parseInt(session.user.id, 10);
        if (!userId || Number.isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid session user' },
                { status: 401 }
            );
        }

        client = await connectToDatabase();

        const userResult = await client.query(
            'SELECT id, password FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userResult.rows[0];
        const isCurrentValid = await comparePassword(
            current_password,
            user.password,
            bcrypt
        );

        if (!isCurrentValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        const result = await client.query(
            `UPDATE users 
             SET password = $1, updated_date = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [hashedPassword, userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
