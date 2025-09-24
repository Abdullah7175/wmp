import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { 
  UPLOAD_CONFIG, 
  validateFile, 
  generateUniqueFilename, 
  saveFileStream, 
  getDatabaseConnectionWithRetry,
  createErrorResponse,
  createSuccessResponse 
} from '@/lib/fileUploadOptimized';

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
    const creatorId = searchParams.get('creator_id');
    const creatorType = searchParams.get('creator_type');
    const client = await connectToDatabase();

    try {
        if (id) {
            const query = `
                SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag
                FROM final_videos fv
                JOIN work_requests wr ON fv.work_request_id = wr.id
                WHERE fv.id = $1
            `;
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Final video not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else if (creatorId && creatorType) {
            const query = `
                SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag
                FROM final_videos fv
                JOIN work_requests wr ON fv.work_request_id = wr.id
                WHERE fv.creator_id = $1 AND fv.creator_type = $2
                ORDER BY fv.created_at DESC
            `;
            const result = await client.query(query, [creatorId, creatorType]);
            return NextResponse.json(result.rows, { status: 200 });
        } else if (workRequestId) {
            const query = `
                SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag
                FROM final_videos fv
                JOIN work_requests wr ON fv.work_request_id = wr.id
                WHERE fv.work_request_id = $1
                ORDER BY fv.created_at DESC
            `;
            const result = await client.query(query, [workRequestId]);
            return NextResponse.json(result.rows, { status: 200 });
        } else {
            let countQuery = 'SELECT COUNT(*) FROM final_videos fv JOIN work_requests wr ON fv.work_request_id = wr.id';
            let dataQuery = `SELECT fv.*, wr.request_date, wr.address, ST_AsGeoJSON(fv.geo_tag) as geo_tag FROM final_videos fv JOIN work_requests wr ON fv.work_request_id = wr.id`;
            let whereClauses = [];
            let params = [];
            let paramIdx = 1;
            if (creatorId && creatorType) {
                whereClauses.push(`fv.creator_id = $${paramIdx} AND fv.creator_type = $${paramIdx + 1}`);
                params.push(creatorId, creatorType);
                paramIdx += 2;
            }
            if (workRequestId) {
                whereClauses.push(`fv.work_request_id = $${paramIdx}`);
                params.push(workRequestId);
                paramIdx++;
            }
            if (filter) {
                whereClauses.push(`(
                    CAST(fv.id AS TEXT) ILIKE $${paramIdx} OR
                    fv.description ILIKE $${paramIdx} OR
                    wr.address ILIKE $${paramIdx} OR
                    CAST(fv.work_request_id AS TEXT) ILIKE $${paramIdx}
                )`);
                params.push(`%${filter}%`);
                paramIdx++;
            }
            if (dateFrom) {
                whereClauses.push(`fv.created_at >= $${paramIdx}`);
                params.push(dateFrom);
                paramIdx++;
            }
            if (dateTo) {
                whereClauses.push(`fv.created_at <= $${paramIdx}`);
                params.push(dateTo);
                paramIdx++;
            }
            if (whereClauses.length > 0) {
                countQuery += ' WHERE ' + whereClauses.join(' AND ');
                dataQuery += ' WHERE ' + whereClauses.join(' AND ');
            }
            dataQuery += ' ORDER BY fv.created_at DESC';
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
        const description = formData.get('description');
        const latitude = formData.get('latitude');
        const longitude = formData.get('longitude');
        const file = formData.get('videoFile');
        const creatorId = formData.get('creator_id');
        const creatorType = formData.get('creator_type');
        const creatorName = formData.get('creator_name');

        if (!workRequestId || !description || !file || !creatorId || !creatorType) {
            return createErrorResponse('Missing required fields', 400);
        }

        if (!latitude || !longitude) {
            return createErrorResponse('Location coordinates are required', 400);
        }

        // Validate file size and type
        const validation = validateFile(file, UPLOAD_CONFIG.ALLOWED_VIDEO_TYPES, UPLOAD_CONFIG.MAX_FILE_SIZE);
        if (!validation.isValid) {
            return createErrorResponse(`File validation failed: ${validation.errors.join(', ')}`, 400);
        }

        // Validate creator type (only social media agents can upload final videos)
        if (creatorType !== 'socialmedia') {
            return createErrorResponse('Only Media Cell agents can upload final videos', 403);
        }

        // Use optimized database connection with retry logic
        const client = await getDatabaseConnectionWithRetry();
        
        try {
        // Check upload permission for final videos
            const workRequestResult = await client.query(`
            SELECT id FROM work_requests WHERE id = $1
        `, [workRequestId]);

        if (workRequestResult.rows.length === 0) {
                return createErrorResponse('Work request not found', 404);
            }

            // Save the file using optimized method
            const uploadsDir = path.join(process.cwd(), 'public', UPLOAD_CONFIG.UPLOAD_DIRS.finalVideos);
            const filename = generateUniqueFilename(file.name);
            const saveResult = await saveFileStream(file, uploadsDir, filename);
            
            if (!saveResult.success) {
                return createErrorResponse(`Failed to save file: ${saveResult.error}`, 500);
            }

        // Create geo_tag from latitude and longitude (use defaults if not provided)
        const geoTag = `SRID=4326;POINT(${longitude || 0} ${latitude || 0})`;

            // Save to database with additional file metadata
        const query = `
                INSERT INTO final_videos (work_request_id, description, link, geo_tag, created_at, updated_at, creator_id, creator_type, creator_name, file_name, file_size, file_type)
                VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), NOW(), NOW(), $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
            const { rows } = await client.query(query, [
            workRequestId,
            description,
            `/uploads/final-videos/${filename}`,
            geoTag,
            creatorId,
            creatorType,
                creatorName || null,
                file.name,
                file.size,
                file.type
        ]);

        // Notify all managers (role=1 or 2)
        try {
                const managers = await client.query('SELECT id FROM users WHERE role IN (1,2)');
            for (const mgr of managers.rows) {
                    await client.query(
                    'INSERT INTO notifications (user_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
                    [mgr.id, 'final_video', workRequestId, `New final video uploaded for request #${workRequestId}.`]
                );
            }
        } catch (notifErr) {
            // Log but don't fail
            console.error('Notification insert error:', notifErr);
        }
            
            return createSuccessResponse({
            video: rows[0]
            }, 'Final video uploaded successfully');
            
        } finally {
            // Ensure client is released
            if (client && client.release) {
                await client.release();
            }
        }

    } catch (error) {
        console.error('File upload error:', error);
        return createErrorResponse('Failed to upload file', 500, error.message);
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        
        const id = formData.get('id');
        const workRequestId = formData.get('workRequestId');
        const description = formData.get('description');
        const latitude = formData.get('latitude');
        const longitude = formData.get('longitude');
        const file = formData.get('videoFile');
        const creatorId = formData.get('creator_id') || session.user.id;
        const creatorType = formData.get('creator_type') || 'admin';
        const creatorName = formData.get('creator_name') || session.user.name;

        if (!id || !workRequestId || !description) {
            return createErrorResponse('Missing required fields', 400);
        }

        if (!latitude || !longitude) {
            return createErrorResponse('Location coordinates are required', 400);
        }

        const client = await getDatabaseConnectionWithRetry();

        try {
            // Check if video exists
            const checkQuery = 'SELECT * FROM final_videos WHERE id = $1';
            const { rows: existingVideo } = await client.query(checkQuery, [id]);
            
            if (existingVideo.length === 0) {
                return createErrorResponse('Final video not found', 404);
            }

            let updateQuery;
            let queryParams;
            let filePath = existingVideo[0].file_path;

            // If a new file is provided, handle file upload
            if (file) {
                // Validate file
                const validationResult = validateFile(file);
                if (!validationResult.valid) {
                    return createErrorResponse(validationResult.error, 400);
                }

                // Generate unique filename
                const uniqueFilename = generateUniqueFilename(file.name);
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'final-videos');
                
                // Ensure directory exists
                await fs.mkdir(uploadDir, { recursive: true });
                
                // Save new file
                const newFilePath = path.join(uploadDir, uniqueFilename);
                await saveFileStream(file, newFilePath);
                
                // Delete old file if it exists
                if (existingVideo[0].file_path) {
                    const oldFilePath = path.join(process.cwd(), 'public', 'uploads', existingVideo[0].file_path);
                    try {
                        await fs.unlink(oldFilePath);
                    } catch (unlinkError) {
                        console.warn('Could not delete old file:', unlinkError.message);
                    }
                }
                
                filePath = `final-videos/${uniqueFilename}`;
                
                // Update with new file
                updateQuery = `
                    UPDATE final_videos 
                    SET work_request_id = $2, description = $3, latitude = $4, longitude = $5,
                        file_path = $6, file_name = $7, file_size = $8, file_type = $9,
                        updated_at = NOW()
                    WHERE id = $1
                    RETURNING *;
                `;
                queryParams = [
                    id, workRequestId, description, latitude, longitude,
                    filePath, file.name, file.size, file.type
                ];
            } else {
                // Update without new file
                updateQuery = `
            UPDATE final_videos 
                    SET work_request_id = $2, description = $3, latitude = $4, longitude = $5,
                updated_at = NOW()
                    WHERE id = $1
            RETURNING *;
        `; 
                queryParams = [id, workRequestId, description, latitude, longitude];
            }

            const { rows: updatedVideo } = await client.query(updateQuery, queryParams);

            return createSuccessResponse({
                message: 'Final video updated successfully',
                video: updatedVideo[0]
            });

        } finally {
            client.release && client.release();
        }

    } catch (error) {
        console.error('Error updating final video:', error);
        return createErrorResponse('Failed to update final video', 500);
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Final video ID is required' }, { status: 400 });
        }

        // First get the video to delete the file
        const getQuery = 'SELECT link FROM final_videos WHERE id = $1';
        const { rows: [video] } = await client.query(getQuery, [id]);

        if (!video) {
            return NextResponse.json({ error: 'Final video not found' }, { status: 404 });
        }

        // Delete the file
        if (video.link) {
            try {
                const filePath = path.join(process.cwd(), 'public', video.link);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error('Error deleting final video file:', fileError);
            }
        }

        // Delete from database
        const deleteQuery = `
            DELETE FROM final_videos 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedVideo } = await client.query(deleteQuery, [id]);

        return NextResponse.json({ message: 'Final video deleted successfully', video: deletedVideo[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting final video:', error);
        return NextResponse.json({ error: 'Error deleting final video' }, { status: 500 });
    }
} 