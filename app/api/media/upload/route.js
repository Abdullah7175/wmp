import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const type = formData.get('type') || 'before-image';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Create upload directory based on type
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', type);
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const buffer = await file.arrayBuffer();
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, filename);

        // Save file
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Return the public URL
        const link = `/uploads/${type}/${filename}`;

        return NextResponse.json({ 
            success: true,
            link,
            filename,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
