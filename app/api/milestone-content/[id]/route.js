import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
// 1. ADD GET FUNCTION
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await query(`
    SELECT 
        mc.*, 
        md.milestone_name,
        ST_X(mc.geo_tag::geometry) as longitude, 
        ST_Y(mc.geo_tag::geometry) as latitude
    FROM milestone_content mc
    LEFT JOIN milestone_definitions md ON mc.milestone_id = md.id
    WHERE mc.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// 2. UPDATE PUT FUNCTION
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const formData = await request.formData();
    
    const description = formData.get('description');
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const file = formData.get('file'); // This is the file object

    let fileName = null;
    let filePath = null;

    // CHECK: If a new file was actually uploaded
    if (file && typeof file !== 'string' && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a unique name to avoid overwriting others
      fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      filePath = `/uploads/${fileName}`;
      
      const fullPath = path.join(process.cwd(), 'public', 'uploads', fileName);
      await writeFile(fullPath, buffer);
    }

    // Update Database
    // We dynamically build the query: if filePath exists, we update the 'link' column too
    const updateQuery = `
      UPDATE milestone_content 
      SET 
        description = $1, 
        geo_tag = ST_SetSRID(ST_MakePoint($2, $3), 4326),
        ${filePath ? 'link = $4, content_type = $5,' : ''}
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${filePath ? '$6' : '$4'} 
      RETURNING *
    `;

    const queryParams = filePath 
      ? [description, longitude, latitude, filePath, file.type.startsWith('video') ? 'video' : 'image', id]
      : [description, longitude, latitude, id];

    const result = await query(updateQuery, queryParams);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await query('DELETE FROM milestone_content WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}