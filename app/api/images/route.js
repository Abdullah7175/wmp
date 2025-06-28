import path from 'path';
import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { actionLogger, ENTITY_TYPES } from '@/lib/actionLogger';

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
                SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag
                FROM images i
                JOIN work_requests wr ON i.work_request_id = wr.id
                WHERE i.id = $1
            `;
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Image not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0], { status: 200 });
        } else if (creatorId && creatorType) {
            const query = `
                SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag
                FROM images i
                JOIN work_requests wr ON i.work_request_id = wr.id
                WHERE i.creator_id = $1 AND i.creator_type = $2
                ORDER BY i.created_at DESC
            `;
            const result = await client.query(query, [creatorId, creatorType]);
            return NextResponse.json({ data: result.rows, total: result.rows.length }, { status: 200 });
        } else if (workRequestId) {
            const query = `
                SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag
                FROM images i
                JOIN work_requests wr ON i.work_request_id = wr.id
                WHERE i.work_request_id = $1
                ORDER BY i.created_at DESC
            `;
            const result = await client.query(query, [workRequestId]);
            return NextResponse.json({ data: result.rows, total: result.rows.length }, { status: 200 });
        } else {
            let countQuery = 'SELECT COUNT(*) FROM images i JOIN work_requests wr ON i.work_request_id = wr.id';
            let dataQuery = `SELECT i.*, wr.request_date, wr.address, ST_AsGeoJSON(i.geo_tag) as geo_tag FROM images i JOIN work_requests wr ON i.work_request_id = wr.id`;
            let whereClauses = [];
            let params = [];
            let paramIdx = 1;
            if (creatorId && creatorType) {
                whereClauses.push(`i.creator_id = $${paramIdx} AND i.creator_type = $${paramIdx + 1}`);
                params.push(creatorId, creatorType);
                paramIdx += 2;
            }
            if (workRequestId) {
                whereClauses.push(`i.work_request_id = $${paramIdx}`);
                params.push(workRequestId);
                paramIdx++;
            }
            if (filter) {
                whereClauses.push(`(
                    CAST(i.id AS TEXT) ILIKE $${paramIdx} OR
                    i.description ILIKE $${paramIdx} OR
                    wr.address ILIKE $${paramIdx} OR
                    CAST(i.work_request_id AS TEXT) ILIKE $${paramIdx}
                )`);
                params.push(`%${filter}%`);
                paramIdx++;
            }
            if (dateFrom) {
                whereClauses.push(`i.created_at >= $${paramIdx}`);
                params.push(dateFrom);
                paramIdx++;
            }
            if (dateTo) {
                whereClauses.push(`i.created_at <= $${paramIdx}`);
                params.push(dateTo);
                paramIdx++;
            }
            if (whereClauses.length > 0) {
                countQuery += ' WHERE ' + whereClauses.join(' AND ');
                dataQuery += ' WHERE ' + whereClauses.join(' AND ');
            }
            dataQuery += ' ORDER BY i.created_at DESC';
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
        const formData = await req.formData();
        const workRequestId = formData.get('workRequestId');
        const creatorId = formData.get('creator_id');
        const creatorType = formData.get('creator_type');
        const files = formData.getAll('img');
        const descriptions = formData.getAll('description');
        const latitudes = formData.getAll('latitude');
        const longitudes = formData.getAll('longitude');

        if (!workRequestId || files.length === 0) {
            return NextResponse.json({ error: 'Work Request ID and at least one image are required' }, { status: 400 });
        }
        if (files.length !== descriptions.length || files.length !== latitudes.length || files.length !== longitudes.length) {
            return NextResponse.json({ error: 'Each image must have a description, latitude, and longitude' }, { status: 400 });
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
        await fs.mkdir(uploadsDir, { recursive: true });
        const client = await connectToDatabase();
        const uploadedImages = [];
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
                INSERT INTO images (work_request_id, description, link, geo_tag, created_at, updated_at, creator_id, creator_type)
                VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), NOW(), NOW(), $5, $6)
                RETURNING *;
            `;
            const { rows } = await client.query(query, [
                workRequestId,
                description,
                `/uploads/images/${filename}`,
                geoTag,
                creatorId || null,
                creatorType || null
            ]);
            uploadedImages.push(rows[0]);
        }
        
        // Log the image upload action
        await actionLogger.upload(req, ENTITY_TYPES.IMAGE, workRequestId, `Images for Request #${workRequestId}`, {
            imageCount: uploadedImages.length,
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
                    [mgr.id, 'image', workRequestId, `New image uploaded for request #${workRequestId}.`]
                );
            }
            client2.release && client2.release();
        } catch (notifErr) {
            // Log but don't fail
            console.error('Notification insert error:', notifErr);
        }
        return NextResponse.json({
            message: 'Image(s) uploaded successfully',
            images: uploadedImages
        }, { status: 201 });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload file(s)' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();
        const {id, workRequestId, description} = body;

        if (!id || !workRequestId || !description) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const query = `
            UPDATE images 
            SET work_request_id = $1, 
                description = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `; 
        const { rows: updatedImage } = await client.query(query, [
            workRequestId,
            description,
            id
        ]);

        if (updatedImage.length === 0) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Log the image update action
        await actionLogger.update(req, ENTITY_TYPES.IMAGE, updatedImage[0].id, `Image #${updatedImage[0].id}`, {
            workRequestId,
            description: updatedImage[0].description
        });

        return NextResponse.json({ message: 'Image updated successfully', image: updatedImage[0] }, { status: 200 });

    } catch (error) {
        console.error('Error updating image:', error);
        return NextResponse.json({ error: 'Error updating image' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const client = await connectToDatabase();

        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Image Id is required' }, { status: 400 });
        }

        // First get the image to delete the file
        const getQuery = 'SELECT link FROM images WHERE id = $1';
        const { rows: [image] } = await client.query(getQuery, [id]);

        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Delete the file
        if (image.link) {
            try {
                const filePath = path.join(process.cwd(), 'public', image.link);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error('Error deleting image file:', fileError);
            }
        }

        // Delete from database
        const deleteQuery = `
            DELETE FROM images 
            WHERE id = $1
            RETURNING *;
        `;

        const { rows: deletedImage } = await client.query(deleteQuery, [id]);

        // Log the image deletion action
        await actionLogger.delete(req, ENTITY_TYPES.IMAGE, deletedImage[0].id, `Image #${deletedImage[0].id}`, {
            workRequestId: deletedImage[0].work_request_id,
            hadFile: !!image.link
        });

        return NextResponse.json({ message: 'Image deleted successfully', image: deletedImage[0] }, { status: 200 });

    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json({ error: 'Error deleting image' }, { status: 500 });
    }
} 