import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const workRequestId = formData.get('workRequestId');
        const geoTag = formData.get('geo_tag');
        
        if (!workRequestId) {
            return NextResponse.json({ error: 'Work Request ID is required' }, { status: 400 });
        }

        // Process images
        const imageFiles = formData.getAll('images');
        const imageDescriptions = formData.getAll('imageDescriptions');
        const imageResults = await processMediaFiles(
            imageFiles, 
            imageDescriptions, 
            workRequestId, 
            geoTag, 
            'images'
        );

        // Process videos
        const videoFiles = formData.getAll('videos');
        const videoDescriptions = formData.getAll('videoDescriptions');
        const videoResults = await processMediaFiles(
            videoFiles, 
            videoDescriptions, 
            workRequestId, 
            geoTag, 
            'videos'
        );

        return NextResponse.json({
            message: 'Media uploaded successfully',
            images: imageResults,
            videos: videoResults
        }, { status: 201 });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
    }
}

async function processMediaFiles(files, descriptions, workRequestId, geoTag, mediaType) {
    const client = await connectToDatabase();
    const results = [];
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', mediaType);
    await fs.mkdir(uploadsDir, { recursive: true });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        const buffer = await file.arrayBuffer();
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, Buffer.from(buffer));

        const query = `
            INSERT INTO ${mediaType} 
            (work_request_id, description, link, geo_tag, created_at)
            VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), NOW())
            RETURNING *;
        `;

        const { rows } = await client.query(query, [
            workRequestId,
            descriptions[i] || null,
            `/uploads/${mediaType}/${filename}`,
            geoTag || null
        ]);

        results.push(rows[0]);
    }

    return results;
}