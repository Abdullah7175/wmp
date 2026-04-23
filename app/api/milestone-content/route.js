import { NextResponse } from 'next/server';
import { connectToDatabase, query } from '@/lib/db';
import { auth } from '@/auth';
import { logUserAction } from '@/lib/userActionLogger';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { resolveEfilingScope, appendGeographyFilters } from '@/lib/efilingGeographyFilters';

export const dynamic = 'force-dynamic';

// GET: Fetch milestone content with optional filters
export async function GET(request) {
  let client;
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const workRequestId = searchParams.get('workRequestId');
    const milestoneId = searchParams.get('milestoneId');

    client = await connectToDatabase();

    const scopeInfo = await resolveEfilingScope(request, client, { scopeKeys: ['scope', 'efiling', 'efilingScoped'] });

    const whereClauses = [];
    const params = [];
    let paramIdx = 1;

    if (workRequestId) {
      whereClauses.push(`mc.work_request_id = $${paramIdx++}`);
      params.push(workRequestId);
    }

    if (milestoneId) {
      whereClauses.push(`mc.milestone_id = $${paramIdx++}`);
      params.push(milestoneId);
    }

    let queryText = `
      SELECT 
        mc.*,
        md.milestone_name,
        wr.address,
        wr.description as work_description
      FROM milestone_content mc
      LEFT JOIN milestone_definitions md ON mc.milestone_id = md.id
      LEFT JOIN work_requests wr ON mc.work_request_id = wr.id
      WHERE 1=1
    `;

    if (whereClauses.length > 0) {
      queryText += ' AND ' + whereClauses.join(' AND ');
    }

    queryText += ' ORDER BY mc.created_at DESC';

    const result = await client.query(queryText, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching milestone content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  } finally {
    if (client?.release) client.release();
  }
}

// POST: Handle Multi-file Upload for Milestones
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const workRequestId = formData.get('work_request_id');
    const milestoneId = formData.get('milestone_id');
    const contentTypeValue = formData.get('content_type'); // 'image' or 'video'
    const files = formData.getAll('files');
    const descriptions = formData.getAll('descriptions');
    const latitudes = formData.getAll('latitudes');
    const longitudes = formData.getAll('longitudes');

    if (!workRequestId || !milestoneId || !files.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    
    // Process file uploads to public/uploads/milestone-content
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'milestone-content', contentTypeValue);
    await mkdir(uploadDir, { recursive: true });

    const results = [];
    const creatorName = session.user.name || 'Unknown';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || file.size === 0) continue;

      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
      const filePath = join(uploadDir, uniqueName);
      const buffer = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(buffer));

      const relativeUrl = `/api/uploads/milestone-content/${contentTypeValue}/${uniqueName}`;
      const geoTag = latitudes[i] && longitudes[i] 
        ? `POINT(${longitudes[i]} ${latitudes[i]})` 
        : `POINT(0 0)`;

      const insertQuery = `
        INSERT INTO milestone_content (work_request_id, milestone_id, description, link, content_type, creator_id, creator_type, creator_name, geo_tag)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFromText($9, 4326))
        RETURNING *
      `;

      const res = await query(insertQuery, [
        workRequestId, milestoneId, descriptions[i] || '', relativeUrl, 
        contentTypeValue, session.user.id, session.user.userType, creatorName, geoTag
      ]);
      results.push(res.rows[0]);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error uploading milestone content:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}