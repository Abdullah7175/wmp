import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await connectToDatabase();
    try {
        // Fetch active departments
        const deptsRes = await client.query(
            `SELECT id, name, code FROM efiling_departments WHERE is_active = true ORDER BY name ASC`
        );

        // Fetch active categories
        const catsRes = await client.query(
            `SELECT id, name, code, department_id FROM efiling_file_categories WHERE is_active = true ORDER BY name ASC`
        );

        // Fetch active file types with their current can_create_roles
        const typesRes = await client.query(
            `SELECT id, name, code, category_id, department_id, can_create_roles FROM efiling_file_types WHERE is_active = true ORDER BY name ASC`
        );

        return NextResponse.json({
            departments: deptsRes.rows,
            categories: catsRes.rows,
            fileTypes: typesRes.rows
        });
    } catch (error) {
        console.error('Error fetching file types tree:', error);
        return NextResponse.json({ error: 'Failed to fetch file metadata' }, { status: 500 });
    } finally {
        await client.release();
    }
}