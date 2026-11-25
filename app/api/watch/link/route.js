import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { createWatchToken } from '@/lib/watchLink';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = Number(new URL(request.url).searchParams.get('id'));
        if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const existing = await query('SELECT id FROM work_requests WHERE id = $1', [id]);
        if (!existing.rows.length) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const token = createWatchToken(id);
        return NextResponse.json(
            { path: `/v/${token}` },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('Watch link error:', error?.message || error);
        return NextResponse.json({ error: 'Unavailable' }, { status: 500 });
    }
}
