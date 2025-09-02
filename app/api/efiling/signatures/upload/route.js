import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
    try {
        const { signatureData, userId, userName, signatureType } = await request.json();
        
        if (!signatureData || !userId || !userName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create user-specific folder path
        const userFolderName = userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'signatures', userFolderName);
        
        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${signatureType}_${timestamp}.png`;
        const filePath = join(uploadDir, filename);

        // Convert base64 to buffer and save
        const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/signatures/${userFolderName}/${filename}`;

        // Save signature info to database with signature management
        const client = await connectToDatabase();
        
        // Check if user already has a signature of this type
        const existingSignature = await client.query(
            `SELECT id FROM efiling_user_signatures 
             WHERE user_id = $1 AND signature_type = $2`,
            [userId, signatureType]
        );

        let result;
        if (existingSignature.rows.length > 0) {
            // Update existing signature
            result = await client.query(
                `UPDATE efiling_user_signatures 
                 SET signature_name = $1, file_name = $2, file_size = $3, file_type = $4, 
                     file_url = $5, signature_data = $6, created_at = NOW()
                 WHERE user_id = $7 AND signature_type = $8
                 RETURNING id`,
                [
                    `${signatureType}_signature`,
                    filename,
                    buffer.length,
                    'image/png',
                    publicUrl,
                    signatureData,
                    userId,
                    signatureType
                ]
            );
        } else {
            // Check if user already has 3 signatures
            const signatureCount = await client.query(
                `SELECT COUNT(*) FROM efiling_user_signatures WHERE user_id = $1`,
                [userId]
            );

            if (parseInt(signatureCount.rows[0].count) >= 3) {
                return NextResponse.json(
                    { error: 'Maximum 3 signatures allowed per user. Please update an existing signature.' },
                    { status: 400 }
                );
            }

            // Deactivate all other signatures for this user
            await client.query(
                `UPDATE efiling_user_signatures SET is_active = false WHERE user_id = $1`,
                [userId]
            );

            // Insert new signature as active
            result = await client.query(
                `INSERT INTO efiling_user_signatures 
                 (id, user_id, signature_name, signature_type, file_name, file_size, file_type, file_url, signature_data, is_active, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW()) 
                 RETURNING id`,
                [
                    `sig_${Date.now()}`,
                    userId,
                    `${signatureType}_signature`,
                    signatureType,
                    filename,
                    buffer.length,
                    'image/png',
                    publicUrl,
                    signatureData
                ]
            );
        }

        await client.release();

        return NextResponse.json({
            success: true,
            signatureId: result.rows[0].id,
            fileUrl: publicUrl,
            message: 'Signature saved successfully'
        });

    } catch (error) {
        console.error('Error uploading signature:', error);
        return NextResponse.json(
            { error: 'Failed to upload signature' },
            { status: 500 }
        );
    }
}
