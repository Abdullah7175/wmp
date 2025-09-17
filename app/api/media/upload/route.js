import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const type = formData.get('type') || 'before-content';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Determine content type based on file MIME type
        const contentType = file.type.startsWith('video/') ? 'video' : 'image';
        
        // Validate file type
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
        
        if (contentType === 'image' && !allowedImageTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP' }, { status: 400 });
        }
        
        if (contentType === 'video' && !allowedVideoTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid video format. Allowed: MP4, AVI, MOV, WMV, WebM' }, { status: 400 });
        }

        // Check file size (10MB for images, 100MB for videos)
        const maxSize = contentType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
            const maxSizeMB = contentType === 'image' ? '10MB' : '100MB';
            return NextResponse.json({ error: `File size exceeds limit of ${maxSizeMB}` }, { status: 400 });
        }

        // Create upload directory based on content type
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', type, contentType);
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const buffer = await file.arrayBuffer();
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, filename);

        // Save file
        await fs.writeFile(filePath, Buffer.from(buffer));

        // Return the public URL
        const link = `/uploads/${type}/${contentType}/${filename}`;

        return NextResponse.json({ 
            success: true,
            link,
            filename,
            size: file.size,
            type: file.type,
            contentType: contentType
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
