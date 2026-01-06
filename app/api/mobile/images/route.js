import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { validateMobileApiToken } from '@/middleware/mobileApiAuth';
import { getMobileUserToken } from '@/lib/mobileAuthHelper';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Validate API key
    const apiKeyError = validateMobileApiToken(request);
    if (apiKeyError) {
      return apiKeyError;
    }

    // Get and verify JWT token
    const decoded = getMobileUserToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workRequestId = searchParams.get('workRequestId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Map userType from token
    let creatorType = decoded.userType;
    if (creatorType === 'agents') creatorType = 'agent';
    if (creatorType === 'socialmediaperson') creatorType = 'socialmedia';

    const client = await connectToDatabase();

    let query = `
      SELECT 
        i.*, 
        wr.request_date, 
        wr.address as work_request_address,
        ST_AsGeoJSON(i.geo_tag) AS geo_tag
      FROM images i
      JOIN work_requests wr ON i.work_request_id = wr.id
      WHERE i.creator_id = $1 AND i.creator_type = $2
    `;
    const params = [decoded.userId, creatorType];

    if (workRequestId) {
      query += ' AND i.work_request_id = $3';
      params.push(workRequestId);
    }

    query += ' ORDER BY i.created_at DESC';

    if (limit > 0) {
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    }

    const result = await client.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM images i
      WHERE i.creator_id = $1 AND i.creator_type = $2
    `;
    const countParams = [decoded.userId, creatorType];
    if (workRequestId) {
      countQuery += ' AND i.work_request_id = $3';
      countParams.push(workRequestId);
    }
    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching mobile images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
