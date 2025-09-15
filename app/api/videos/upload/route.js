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
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        // Check upload permission for videos
        const client = await connectToDatabase();
        const approvalStatus = await client.query(`
            SELECT 
                wra.approval_status,
                wr.id,
                wr.creator_id,
                wr.creator_type
            FROM work_requests wr
            LEFT JOIN work_request_approvals wra ON wr.id = wra.work_request_id
            WHERE wr.id = $1
        `, [workRequestId]);

        if (!approvalStatus.rows || approvalStatus.rows.length === 0) {
            return NextResponse.json({ error: 'Work request not found' }, { status: 404 });
        }

        const request = approvalStatus.rows[0];
        const isApproved = request.approval_status === 'approved';
        const isRejected = request.approval_status === 'rejected';
        const isPending = request.approval_status === 'pending';

        // Check if user is the creator of the request
        const isCreator = (
            (session.user.userType === 'user' && request.creator_type === 'user' && session.user.id === request.creator_id) ||
            (session.user.userType === 'agent' && request.creator_type === 'agent' && session.user.id === request.creator_id) ||
            (session.user.userType === 'socialmedia' && request.creator_type === 'socialmedia' && session.user.id === request.creator_id)
        );

        // Check if user is CEO or admin
        const isCEO = session.user.userType === 'user' && session.user.role === 5;
        const isAdmin = session.user.userType === 'user' && (session.user.role === 1 || session.user.role === 2);

        let canUpload = false;
        let reason = "";

        if (isRejected) {
            // Rejected requests - only CEO and admin can make them live again
            if (isCEO || isAdmin) {
                canUpload = true;
                reason = "Request can be reactivated by CEO/Admin";
            } else {
                canUpload = false;
                reason = "Request rejected by CEO KW&SC. Only CEO or Admin can reactivate.";
            }
        } else if (isPending) {
            // Pending approval - only before images allowed, not videos
            canUpload = false;
            reason = "Only before images allowed before CEO approval";
        } else if (isApproved) {
            // Approved requests - all media types allowed
            if (isCreator || isCEO || isAdmin) {
                canUpload = true;
                reason = "Request approved by CEO - all media uploads allowed";
            } else {
                canUpload = false;
                reason = "Only request creators, CEO, or Admin can upload media";
            }
        } else {
            // No approval record found (should not happen for new requests)
            canUpload = false;
            reason = "Request approval status unknown";
        }

        if (!canUpload) {
            return NextResponse.json({ 
                error: 'Upload not allowed', 
                details: reason 
            }, { status: 403 });
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
        await fs.mkdir(uploadsDir, { recursive: true });
        const uploadedVideos = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const description = descriptions[i];
            const latitude = latitudes[i] || '0';
            const longitude = longitudes[i] || '0';
            if (!description) {
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