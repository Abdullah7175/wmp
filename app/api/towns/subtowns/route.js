import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const client = await connectToDatabase();

    try {
        const query = 'SELECT * FROM subtown';
        const result = await client.query(query);
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching subtowns:', error);
        return NextResponse.json({ error: 'Failed to fetch subtowns' }, { status: 500 });
    } finally {
        client.release && client.release();
    }
}