// import { NextResponse } from 'next/server';
// import multer from 'multer';
// import { promises as fs } from 'fs';

// // Configure Multer for file storage
// const upload = multer({
//     storage: multer.diskStorage({
//         destination: 'C:/Users/DELL/Downloads/uploads',
//         filename: (req, file, cb) => {
//             cb(null, `${Date.now()}-${file.originalname}`);
//         },
//     }),
// });

// // Helper function to handle Multer middleware
// const runMiddleware = (req, res, fn) => {
//     return new Promise((resolve, reject) => {
//         fn(req, res, (result) => {
//             if (result instanceof Error) {
//                 return reject(result);
//             }
//             resolve(result);
//         });
//     });
// };

// // Define the POST method for file upload
// export async function POST(req) {
//     try {
//         // Convert the incoming request to form data
//         const formData = await req.formData();

//         // Extract the file from form data
//         const file = formData.get('vid');
//         if (!file) {
//             return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//         }

//         // Save the file to the uploads directory
//         const buffer = await file.arrayBuffer();
//         const filename = `C:/Users/DELL/Downloads/uploads/${Date.now()}-${file.name}`;
//         await fs.writeFile(filename, Buffer.from(buffer));

//         return NextResponse.json({
//             message: 'Video uploaded successfully',
//             path: filename, // Send back the saved file path
//         });
//     } catch (error) {
//         console.error('File upload error:', error);
//         return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
//     }
// }
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const workRequestId = formData.get('workRequestId');
        const creatorId = formData.get('creator_id');
        const creatorType = formData.get('creator_type');
        const files = formData.getAll('vid');
        const descriptions = formData.getAll('description');
        const latitudes = formData.getAll('latitude');
        const longitudes = formData.getAll('longitude');

        if (!workRequestId || files.length === 0) {
            return NextResponse.json({ error: 'Work Request ID and at least one video are required' }, { status: 400 });
        }
        if (files.length !== descriptions.length || files.length !== latitudes.length || files.length !== longitudes.length) {
            return NextResponse.json({ error: 'Each video must have a description, latitude, and longitude' }, { status: 400 });
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
        await fs.mkdir(uploadsDir, { recursive: true });
        const client = await connectToDatabase();
        const uploadedVideos = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const description = descriptions[i];
            const latitude = latitudes[i];
            const longitude = longitudes[i];
            if (!description || !latitude || !longitude) {
                continue;
            }
            const buffer = await file.arrayBuffer();
            const filename = `${Date.now()}-${file.name}`;
            const filePath = path.join(uploadsDir, filename);
            await fs.writeFile(filePath, Buffer.from(buffer));
            const geoTag = `SRID=4326;POINT(${longitude} ${latitude})`;
            const query = `
                INSERT INTO videos (work_request_id, description, link, geo_tag, created_at, updated_at, creator_id, creator_type)
                VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), NOW(), NOW(), $5, $6)
                RETURNING *;
            `;
            const { rows } = await client.query(query, [
                workRequestId,
                description,
                `/uploads/videos/${filename}`,
                geoTag,
                creatorId || null,
                creatorType || null
            ]);
            uploadedVideos.push(rows[0]);
        }
        // Notify all managers (role=1 or 2)
        try {
            const client2 = await connectToDatabase();
            const managers = await client2.query('SELECT id FROM users WHERE role IN (1,2)');
            for (const mgr of managers.rows) {
                await client2.query(
                    'INSERT INTO notifications (user_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                    [mgr.id, 'video', workRequestId, `New video uploaded for request #${workRequestId}.`]
                );
            }
            client2.release && client2.release();
        } catch (notifErr) {
            // Log but don't fail
            console.error('Notification insert error:', notifErr);
        }
        return NextResponse.json({
            message: 'Video(s) uploaded successfully',
            videos: uploadedVideos
        }, { status: 201 });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file(s)' }, { status: 500 });
    }
}