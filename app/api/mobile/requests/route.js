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

export async function POST(req) {
  let client;
  try {
    // Validate API key
    const apiKeyError = validateMobileApiToken(req);
    if (apiKeyError) {
      return apiKeyError;
    }

    // Get and verify JWT token
    const decoded = getMobileUserToken(req);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      town_id,
      subtown_id,
      subtown_ids, // array of additional subtowns
      division_id, // for division-based departments
      complaint_type_id,
      complaint_subtype_id,
      contact_number,
      address,
      description,
      latitude,
      longitude,
      executive_engineer_id,
      contractor_id,
      nature_of_work,
      budget_code,
      file_type,
      additional_locations // array of additional locations
    } = body;

    // Map userType from token
    let creatorType = decoded.userType;
    if (creatorType === 'agents') creatorType = 'agent';
    if (creatorType === 'socialmediaperson') creatorType = 'socialmedia';

    const creator_id = decoded.userId;

    client = await connectToDatabase();

    // Check if complaint type is division-based
    let isDivisionBased = false;
    if (complaint_type_id) {
      const complaintTypeQuery = `
        SELECT 
          ct.*,
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM complaint_type_divisions ctd 
              WHERE ctd.complaint_type_id = ct.id
            ) THEN true
            WHEN ct.division_id IS NOT NULL THEN true
            WHEN ct.efiling_department_id IS NOT NULL AND ed.department_type = 'division' THEN true
            ELSE false
          END as is_division_based,
          ct.division_id,
          ed.department_type as efiling_department_type
        FROM complaint_types ct
        LEFT JOIN efiling_departments ed ON ct.efiling_department_id = ed.id
        WHERE ct.id = $1
      `;
      const complaintTypeResult = await client.query(complaintTypeQuery, [complaint_type_id]);
      
      if (complaintTypeResult.rows.length > 0) {
        const complaintType = complaintTypeResult.rows[0];
        isDivisionBased = Boolean(
          complaintType.is_division_based ||
          complaintType.division_id ||
          (complaintType.efiling_department_type === 'division')
        );
      }
    }

    // Validate required fields
    if (!complaint_type_id || !contact_number || !address || !description || !nature_of_work) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: {
          required: ['complaint_type_id', 'contact_number', 'address', 'description', 'nature_of_work'],
          received: {
            complaint_type_id: !!complaint_type_id,
            contact_number: !!contact_number,
            address: !!address,
            description: !!description,
            nature_of_work: !!nature_of_work
          }
        }
      }, { status: 400 });
    }

    // Validate town-based vs division-based
    let finalTownId, finalSubtownId, finalDivisionId;
    
    if (isDivisionBased) {
      // Division-based: division_id is required, town_id must be null
      if (!division_id) {
        return NextResponse.json({
          success: false,
          error: 'Division is required for this department type',
          details: 'This department is division-based. Please provide division_id.'
        }, { status: 400 });
      }
      // Force town/subtown to null for division-based
      finalTownId = null;
      finalSubtownId = null;
      finalDivisionId = Number(division_id);
    } else {
      // Town-based: town_id is required, division_id must be null
      if (!town_id) {
        return NextResponse.json({
          success: false,
          error: 'Town is required for this department type',
          details: 'This department is town-based. Please provide town_id.'
        }, { status: 400 });
      }
      // Force division to null for town-based
      finalDivisionId = null;
      finalTownId = Number(town_id);
      finalSubtownId = subtown_id ? Number(subtown_id) : null;
    }

    // Validate contact number format
    if (!/^[0-9]{10,15}$/.test(contact_number)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid contact number format',
        details: 'Contact number must be 10-15 digits'
      }, { status: 400 });
    }

    // Validate file_type if provided
    if (file_type && !['SPI', 'R&M', 'ADP', ''].includes(file_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file_type',
        details: 'file_type must be one of: SPI, R&M, ADP, or empty string'
      }, { status: 400 });
    }

    // Final values are already set above in validation

    // Auto-fill contractor/executive engineer IDs for agent submissions
    let final_contractor_id = contractor_id ? Number(contractor_id) : null;
    let final_executive_engineer_id = executive_engineer_id ? Number(executive_engineer_id) : null;

    if (creatorType === 'agent') {
      // Fetch agent role
      const agentRoleRes = await client.query('SELECT role FROM agents WHERE id = $1', [creator_id]);
      if (agentRoleRes.rows.length > 0) {
        const agentRole = agentRoleRes.rows[0]?.role;
        if (Number(agentRole) === 2) {
          // Contractor: set contractor_id to own id
          final_contractor_id = creator_id;
        } else if (Number(agentRole) === 1) {
          // Executive Engineer: set executive_engineer_id to own id
          final_executive_engineer_id = creator_id;
        }
      }
    }

    // Prepare geo tag
    let geoTag = null;
    if (latitude && longitude) {
      geoTag = `SRID=4326;POINT(${longitude} ${latitude})`;
    }

    // Get the default "Pending" status_id
    const statusResult = await client.query('SELECT id FROM status WHERE name = $1', ['Pending']);
    const pendingStatusId = statusResult.rows[0]?.id || 1;

    // Build query with dynamic fields
    let extraFields = '';
    let extraValues = '';
    let extraParams = [];
    const baseParamCount = 11; // town_id, subtown_id, division_id, complaint_type_id, complaint_subtype_id, contact_number, address, description, creator_id, creator_type, status_id
    const geoTagParam = geoTag ? 1 : 0;
    const nextParamNum = baseParamCount + geoTagParam + 1;

    if (final_executive_engineer_id) {
      extraFields += ', executive_engineer_id';
      extraValues += ', $' + (nextParamNum + extraParams.length);
      extraParams.push(final_executive_engineer_id);
    }
    if (final_contractor_id) {
      extraFields += ', contractor_id';
      extraValues += ', $' + (nextParamNum + extraParams.length);
      extraParams.push(final_contractor_id);
    }
    if (nature_of_work) {
      extraFields += ', nature_of_work';
      extraValues += ', $' + (nextParamNum + extraParams.length);
      extraParams.push(nature_of_work);
    }
    if (budget_code) {
      extraFields += ', budget_code';
      extraValues += ', $' + (nextParamNum + extraParams.length);
      extraParams.push(budget_code);
    }
    if (file_type) {
      extraFields += ', file_type';
      extraValues += ', $' + (nextParamNum + extraParams.length);
      extraParams.push(file_type);
    }

    const query = `
      INSERT INTO work_requests (
        town_id,
        subtown_id,
        division_id,
        complaint_type_id,
        complaint_subtype_id,
        contact_number,
        address,
        description,
        creator_id,
        creator_type,
        status_id,
        geo_tag${extraFields}
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ${geoTag ? `$12` : 'NULL'}${extraValues})
      RETURNING id;
    `;

    const params = [
      finalTownId,
      finalSubtownId,
      finalDivisionId,
      Number(complaint_type_id),
      complaint_subtype_id ? Number(complaint_subtype_id) : null,
      contact_number,
      address,
      description,
      creator_id,
      creatorType,
      pendingStatusId
    ];

    if (geoTag) params.push(geoTag);
    params.push(...extraParams);

    await client.query('BEGIN');
    const result = await client.query(query, params);
    const workRequestId = result.rows[0].id;

    // Insert additional subtowns (only for town-based requests)
    if (!isDivisionBased && Array.isArray(subtown_ids) && subtown_ids.length > 0) {
      for (const stId of subtown_ids) {
        await client.query(
          'INSERT INTO work_request_subtowns (work_request_id, subtown_id) VALUES ($1, $2)',
          [workRequestId, Number(stId)]
        );
      }
    }

    // Insert additional locations if present
    if (Array.isArray(additional_locations) && additional_locations.length > 0) {
      for (const location of additional_locations) {
        if (location.latitude && location.longitude) {
          await client.query(
            'INSERT INTO work_request_locations (work_request_id, latitude, longitude, description) VALUES ($1, $2, $3, $4)',
            [workRequestId, Number(location.latitude), Number(location.longitude), location.description || '']
          );
        }
      }
    }

    await client.query('COMMIT');

    // Insert notifications
    try {
      let creatorName = '';
      if (creatorType === 'agent') {
        const res = await client.query('SELECT name, role FROM agents WHERE id = $1', [creator_id]);
        creatorName = res.rows[0]?.name || '';
        const creatorRole = res.rows[0]?.role;

        // Notify the other agent (contractor <-> executive engineer)
        if (Number(creatorRole) === 2 && final_executive_engineer_id && final_executive_engineer_id !== creator_id) {
          await client.query(
            'INSERT INTO notifications (agent_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
            [final_executive_engineer_id, 'request', workRequestId, `New work request from ${creatorName} for you.`]
          );
        } else if (Number(creatorRole) === 1 && final_contractor_id && final_contractor_id !== creator_id) {
          await client.query(
            'INSERT INTO notifications (agent_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
            [final_contractor_id, 'request', workRequestId, `New work request from ${creatorName} for you.`]
          );
        }

        // Notify all managers (role=1 or 2)
        const managers = await client.query('SELECT id FROM users WHERE role IN (1,2)');
        for (const mgr of managers.rows) {
          await client.query(
            'INSERT INTO notifications (user_id, type, entity_id, message) VALUES ($1, $2, $3, $4)',
            [mgr.id, 'request', workRequestId, `New work request from ${creatorName} (Agent).`]
          );
        }
      }
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Work request submitted successfully',
      data: {
        id: workRequestId
      }
    }, { status: 200 });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('Error creating mobile request:', error);
    
    if (error.message.includes('timeout') || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please try again later.'
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to submit work request',
      details: error.message
    }, { status: 500 });
  } finally {
    if (client && typeof client.release === 'function') {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing database client:', releaseError);
      }
    }
  }
}
