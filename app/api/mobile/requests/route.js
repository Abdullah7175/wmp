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
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    // Map userType from token
    let creatorType = decoded.userType;
    if (creatorType === 'agents') creatorType = 'agent';
    if (creatorType === 'socialmediaperson') creatorType = 'socialmedia';

    const client = await connectToDatabase();

    if (id) {
      // Get single request
      const query = `
        SELECT 
          wr.*,
          ST_Y(wr.geo_tag) as latitude,
          ST_X(wr.geo_tag) as longitude,
          t.town as town_name,
          ct.type_name as complaint_type,
          cst.subtype_name as complaint_subtype,
          s.name as status_name,
          COALESCE(u.name, ag.name, sm.name) as creator_name
        FROM work_requests wr
        LEFT JOIN town t ON wr.town_id = t.id
        LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
        LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
        LEFT JOIN status s ON wr.status_id = s.id
        LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
        LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
        LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
        WHERE wr.id = $1
      `;
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      }, { status: 200 });
    }

    // Get list of requests
    // For agents: show requests where they are creator, contractor, or executive engineer
    // For socialmedia: show requests where they are creator or assigned
    let whereClauses = [];
    let params = [];
    let paramIdx = 1;

    if (creatorType === 'agent') {
      whereClauses.push(`(
        wr.creator_id = $${paramIdx} AND wr.creator_type = $${paramIdx + 1} OR
        wr.contractor_id = $${paramIdx} OR
        wr.executive_engineer_id = $${paramIdx}
      )`);
      params.push(decoded.userId, creatorType);
      paramIdx += 2;
    } else if (creatorType === 'socialmedia') {
      whereClauses.push(`(
        wr.creator_id = $${paramIdx} AND wr.creator_type = $${paramIdx + 1} OR
        wr.id IN (SELECT work_requests_id FROM request_assign_smagent WHERE socialmedia_agent_id = $${paramIdx})
      )`);
      params.push(decoded.userId, creatorType);
      paramIdx += 2;
    } else {
      whereClauses.push(`wr.creator_id = $${paramIdx} AND wr.creator_type = $${paramIdx + 1}`);
      params.push(decoded.userId, creatorType);
      paramIdx += 2;
    }

    if (status) {
      whereClauses.push(`wr.status_id = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }

    if (search) {
      whereClauses.push(`(
        CAST(wr.id AS TEXT) ILIKE $${paramIdx} OR
        wr.address ILIKE $${paramIdx} OR
        wr.description ILIKE $${paramIdx}
      )`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    let dataQuery = `
      SELECT 
        wr.id, 
        wr.request_date, 
        wr.address,
        ST_Y(wr.geo_tag) as latitude, 
        ST_X(wr.geo_tag) as longitude, 
        t.town as town_name, 
        ct.type_name as complaint_type, 
        cst.subtype_name as complaint_subtype, 
        s.name as status_name,
        s.id as status_id,
        COALESCE(u.name, ag.name, sm.name) as creator_name,
        wr.creator_type,
        wr.contact_number
      FROM work_requests wr
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
      LEFT JOIN status s ON wr.status_id = s.id
      LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
      LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
      LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
    `;

    if (creatorType === 'socialmedia') {
      dataQuery += ' LEFT JOIN request_assign_smagent ras ON wr.id = ras.work_requests_id';
    }

    if (whereClauses.length > 0) {
      dataQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    dataQuery += ' ORDER BY wr.request_date DESC, wr.created_date DESC';

    // Count query
    let countQuery = `
      SELECT COUNT(*) 
      FROM work_requests wr
    `;
    if (creatorType === 'socialmedia') {
      countQuery += ' LEFT JOIN request_assign_smagent ras ON wr.id = ras.work_requests_id';
    }
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    const countResult = await client.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Add pagination
    if (limit > 0) {
      dataQuery += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
      params.push(limit, offset);
    }

    const result = await client.query(dataQuery, params);

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
    console.error('Error fetching mobile requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
