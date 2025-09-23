import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { actionLogger, ENTITY_TYPES } from '@/lib/actionLogger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import ChunkedFileUpload from '@/lib/chunkedFileUpload';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const workRequestId = searchParams.get('workRequestId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    const offset = (page - 1) * limit;
    const filter = searchParams.get('filter') || '';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const client = await connectToDatabase();
    const creatorId = searchParams.get('creator_id');
    const creatorType = searchParams.get('creator_type');

    try {
        if (id) {
            const query = `
                SELECT v.*, wr.request_date, wr.address, ST_AsGeoJSON(v.geo_tag) as geo_tag
                FROM videos v
                JOIN work_requests wr ON v.work_request_id = wr.id
                WHERE v.id = $1
            `;
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Video not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else if (creatorId && creatorType) {
            const query = `
                SELECT v.*, wr.request_date, wr.address, ST_AsGeoJSON(v.geo_tag) as geo_tag
                FROM videos v
                JOIN work_requests wr ON v.work_request_id = wr.id
                WHERE v.creator_id = $1 AND v.creator_type = $2
                ORDER BY v.created_at DESC
            `;
            const result = await client.query(query, [creatorId, creatorType]);
            return NextResponse.json({ data: result.rows, total: result.rows.length }, { status: 200 });
        } else if (workRequestId) {
            const query = `
                SELECT v.*, wr.request_date, wr.address, ST_AsGeoJSON(v.geo_tag) as geo_tag
                FROM videos v
                JOIN work_requests wr ON v.work_request_id = wr.id
                WHERE v.work_request_id = $1
                ORDER BY v.created_at DESC
            `;
            const result = await client.query(query, [workRequestId]);
            return NextResponse.json({ data: result.rows, total: result.rows.length }, { status: 200 });
        } else {
            let countQuery = 'SELECT COUNT(*) FROM videos v JOIN work_requests wr ON v.work_request_id = wr.id';
            let dataQuery = `SELECT v.*, wr.request_date, wr.address, ST_AsGeoJSON(v.geo_tag) as geo_tag FROM videos v JOIN work_requests wr ON v.work_request_id = wr.id`;
            let whereClauses = [];
            let params = [];
            let paramIdx = 1;
            
            if (creatorId && creatorType) {
                whereClauses.push(`v.creator_id = $${paramIdx} AND v.creator_type = $${paramIdx + 1}`);
                params.push(creatorId, creatorType);
                paramIdx += 2;
            }
            if (workRequestId) {
                whereClauses.push(`v.work_request_id = $${paramIdx}`);
                params.push(workRequestId);
                paramIdx++;
            }
            if (filter) {
                whereClauses.push(`(
                    CAST(v.id AS TEXT) ILIKE $${paramIdx} OR
                    v.description ILIKE $${paramIdx} OR
                    wr.address ILIKE $${paramIdx} OR
                    CAST(v.work_request_id AS TEXT) ILIKE $${paramIdx}
                )`);
                params.push(`%${filter}%`);
                paramIdx++;
            }
            if (dateFrom) {
                whereClauses.push(`v.created_at >= $${paramIdx}`);
                params.push(dateFrom);
                paramIdx++;
            }
            if (dateTo) {
                whereClauses.push(`v.created_at <= $${paramIdx}`);
                params.push(dateTo);
                paramIdx++;
            }
            if (whereClauses.length > 0) {
                countQuery += ' WHERE ' + whereClauses.join(' AND ');
                dataQuery += ' WHERE ' + whereClauses.join(' AND ');
            }
            dataQuery += ' ORDER BY v.created_at DESC';
            if (limit > 0) {
                dataQuery += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
                params.push(limit, offset);
            }
            const countResult = await client.query(countQuery, params.slice(0, params.length - (limit > 0 ? 2 : 0)));
            const total = parseInt(countResult.rows[0].count, 10);
            const result = await client.query(dataQuery, params);
            return NextResponse.json({ data: result.rows, total }, { status: 200 });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}

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
        if (files.length !== descriptions.length) {
            return NextResponse.json({ error: 'Each video must have a description' }, { status: 400 });
        }

        // Check if work request exists
        const client = await connectToDatabase();
        const workRequest = await client.query(`
            SELECT id FROM work_requests WHERE id = $1
        `, [workRequestId]);

        if (!workRequest.rows || workRequest.rows.length === 0) {
            return NextResponse.json({ error: 'Work request not found' }, { status: 404 });
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
        await fs.mkdir(uploadsDir, { recursive: true });
        const uploadedVideos = [];
        
        // Process files with improved error handling
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const description = descriptions[i];
            const latitude = latitudes[i] || '0';
            const longitude = longitudes[i] || '0';
            
            if (!description) {
                continue;
            }

            try {
                const filename = `${Date.now()}-${file.name}`;
                const filePath = path.join(uploadsDir, filename);
                
                // For large files (>50MB), use chunked upload
                if (file.size > 50 * 1024 * 1024) {
                    const chunks = await ChunkedFileUpload.fileToChunks(file, 2 * 1024 * 1024);
                    
                    // Write chunks sequentially to avoid memory issues
                    for (const chunk of chunks) {
                        await fs.appendFile(filePath, Buffer.from(chunk.data));
                    }
                } else {
                    // For smaller files, use direct upload
                    const buffer = await file.arrayBuffer();
                    await fs.writeFile(filePath, Buffer.from(buffer));
                }

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

            } catch (fileError) {
                console.error(`Error processing file ${file.name}:`, fileError);
                // Continue with other files instead of failing completely
                continue;
            }
        }
        
        // Log the video upload action
        await actionLogger.upload(req, ENTITY_TYPES.VIDEO, workRequestId, `Videos for Request #${workRequestId}`, {
            videoCount: uploadedVideos.length,
            workRequestId,
            creatorId,
            creatorType,
            hasLocation: true
        });

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