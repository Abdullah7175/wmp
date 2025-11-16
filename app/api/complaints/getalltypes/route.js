
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(request) {
    const client = await connectToDatabase();

    try {
        const query = `
            SELECT 
                ct.*,
                d.name as division_name
            FROM complaint_types ct
            LEFT JOIN divisions d ON ct.division_id = d.id
            ORDER BY ct.type_name ASC
        `;
        const result = await client.query(query);
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

