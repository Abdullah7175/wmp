import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { logUserAction } from '@/lib/userActionLogger';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const workRequestId = searchParams.get('workRequestId');
    const creatorId = searchParams.get('creator_id');
    const creatorType = searchParams.get('creator_type');

    let queryText = `
      SELECT 
        bc.*,
        wr.address,
        wr.description as work_description,
        ct.type_name as complaint_type,
        t.town,
        st.subtown
      FROM before_content bc
      LEFT JOIN work_requests wr ON bc.work_request_id = wr.id
      LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
      LEFT JOIN town t ON wr.town_id = t.id
      LEFT JOIN subtown st ON wr.subtown_id = st.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (workRequestId) {
      queryText += ` AND bc.work_request_id = $${paramCount}`;
      params.push(workRequestId);
      paramCount++;
    }

    if (creatorId && creatorType) {
      queryText += ` AND bc.creator_id = $${paramCount} AND bc.creator_type = $${paramCount + 1}`;
      params.push(creatorId, creatorType);
      paramCount += 2;
    }

    queryText += ` ORDER BY bc.created_at DESC`;

    const result = await query(queryText, params);

    // Log view action if user is authenticated
    if (session?.user) {
      await logUserAction({
        user_id: session.user.id,
        user_type: session.user.userType,
        user_role: session.user.role,
        user_name: session.user.name || 'Unknown',
        user_email: session.user.email || 'unknown@example.com',
        action_type: 'VIEW',
        entity_type: 'before_content',
        entity_id: workRequestId,
        entity_name: workRequestId ? `Before Content for Request #${workRequestId}` : 'All Before Content',
        details: {
          work_request_id: workRequestId,
          creator_filter: creatorId ? { creator_id: creatorId, creator_type: creatorType } : null,
          result_count: result.length
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching before content:', error);
    return NextResponse.json({ error: 'Failed to fetch before content' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workRequestId, description, link, latitude, longitude, contentType, additionalContent } = body;

    if (!workRequestId || !link || !contentType) {
      return NextResponse.json({ error: 'Work request ID, content link, and content type are required' }, { status: 400 });
    }

    // Validate content type
    if (!['image', 'video'].includes(contentType)) {
      return NextResponse.json({ error: 'Content type must be either "image" or "video"' }, { status: 400 });
    }

    // Insert main before content
    const insertQuery = `
      INSERT INTO before_content (work_request_id, description, link, content_type, creator_id, creator_type, creator_name, geo_tag)
      VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromText($8, 4326))
      RETURNING *
    `;

    const geoTag = `POINT(${longitude || 0} ${latitude || 0})`;
    const creatorName = session.user.name || 'Unknown';

    const result = await query(insertQuery, [
      workRequestId,
      description || '',
      link,
      contentType,
      session.user.id,
      session.user.userType || 'user',
      creatorName,
      geoTag
    ]);

    const beforeContentId = result[0]?.id;

    // Log before content upload action
    await logUserAction({
      user_id: session.user.id,
      user_type: session.user.userType,
      user_role: session.user.role,
      user_name: session.user.name || 'Unknown',
      user_email: session.user.email || 'unknown@example.com',
      action_type: 'UPLOAD',
      entity_type: 'before_content',
      entity_id: beforeContentId,
      entity_name: `Before ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} for Request #${workRequestId}`,
      details: {
        work_request_id: workRequestId,
        content_link: link,
        content_type: contentType,
        description: description || '',
        has_geolocation: !!(latitude && longitude),
        latitude: latitude,
        longitude: longitude
      },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    });

    // Insert additional content if provided
    if (additionalContent && additionalContent.length > 0) {
      for (const additionalItem of additionalContent) {
        const additionalGeoTag = additionalItem.latitude && additionalItem.longitude 
          ? `POINT(${additionalItem.longitude} ${additionalItem.latitude})` 
          : null;

        const additionalResult = await query(insertQuery, [
          workRequestId,
          additionalItem.description || '',
          additionalItem.link,
          additionalItem.contentType || contentType,
          session.user.id,
          session.user.userType || 'user',
          creatorName,
          additionalGeoTag
        ]);

        // Log additional before content upload action
        await logUserAction({
          user_id: session.user.id,
          user_type: session.user.userType,
          user_role: session.user.role,
          user_name: session.user.name || 'Unknown',
          user_email: session.user.email || 'unknown@example.com',
          action_type: 'UPLOAD',
          entity_type: 'before_content',
          entity_id: additionalResult[0]?.id,
          entity_name: `Additional Before ${(additionalItem.contentType || contentType).charAt(0).toUpperCase() + (additionalItem.contentType || contentType).slice(1)} for Request #${workRequestId}`,
          details: {
            work_request_id: workRequestId,
            content_link: additionalItem.link,
            content_type: additionalItem.contentType || contentType,
            description: additionalItem.description || '',
            has_geolocation: !!(additionalItem.latitude && additionalItem.longitude),
            latitude: additionalItem.latitude,
            longitude: additionalItem.longitude,
            is_additional: true
          },
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Before content uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading before content:', error);
    return NextResponse.json({ error: 'Failed to upload before content' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Check if user has permission to delete (creator or admin)
    const checkQuery = `
      SELECT creator_id, creator_type FROM before_content WHERE id = $1
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const content = checkResult.rows[0];
    const isCreator = content.creator_id === session.user.id && content.creator_type === session.user.userType;
    const isAdmin = session.user.userType === 'user' && [1, 2].includes(session.user.role);
    const isSMAgent = session.user.userType === 'socialmedia';

    if (!isCreator && !isAdmin && !isSMAgent) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Get content details before deletion for logging
    const contentDetailsQuery = `
      SELECT bc.*, wr.id as work_request_id, wr.description as work_description
      FROM before_content bc
      LEFT JOIN work_requests wr ON bc.work_request_id = wr.id
      WHERE bc.id = $1
    `;
    const contentDetails = await query(contentDetailsQuery, [id]);

    const deleteQuery = 'DELETE FROM before_content WHERE id = $1';
    await query(deleteQuery, [id]);

    // Log before content deletion action
    if (contentDetails.length > 0) {
      const content = contentDetails[0];
      await logUserAction({
        user_id: session.user.id,
        user_type: session.user.userType,
        user_role: session.user.role,
        user_name: session.user.name || 'Unknown',
        user_email: session.user.email || 'unknown@example.com',
        action_type: 'DELETE',
        entity_type: 'before_content',
        entity_id: parseInt(id),
        entity_name: `Before ${content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)} for Request #${content.work_request_id}`,
        details: {
          work_request_id: content.work_request_id,
          work_description: content.work_description,
          content_link: content.link,
          content_type: content.content_type,
          description: content.description,
          original_creator_id: content.creator_id,
          original_creator_type: content.creator_type,
          original_creator_name: content.creator_name,
          has_geolocation: !!content.geo_tag,
          deletion_reason: 'User initiated deletion'
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      });
    }

    return NextResponse.json({ success: true, message: 'Before content deleted successfully' });
  } catch (error) {
    console.error('Error deleting before content:', error);
    return NextResponse.json({ error: 'Failed to delete before content' }, { status: 500 });
  }
}
