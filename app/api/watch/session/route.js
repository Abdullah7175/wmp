import { NextResponse } from 'next/server';
import { getClientIp } from '@/middleware/validateNetwork';
import {
    allowWatchAttempt,
    createPlaybackGrant,
    readWatchToken,
    resolveFinalVideo,
} from '@/lib/watchLink';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function noStore(body, status) {
    return NextResponse.json(body, {
        status,
        headers: { 'Cache-Control': 'no-store' },
    });
}

export async function GET() {
    return new NextResponse(null, { status: 404 });
}

export async function POST(request) {
    try {
        const ip = getClientIp(request);
        if (!allowWatchAttempt(ip, 'session', 40)) {
            return noStore({ error: 'unavailable' }, 429);
        }

        const site = request.headers.get('sec-fetch-site');
        if (site && site !== 'same-origin') {
            return noStore({ error: 'unavailable' }, 404);
        }

        let token = '';
        try {
            const body = await request.json();
            token = typeof body?.token === 'string' ? body.token : '';
        } catch {
            return noStore({ error: 'invalid' }, 404);
        }

        const requestId = readWatchToken(token);
        if (!requestId) {
            if (!allowWatchAttempt(ip, 'bad-token', 20)) {
                return noStore({ error: 'unavailable' }, 429);
            }
            return noStore({ error: 'invalid' }, 404);
        }

        const video = await resolveFinalVideo(requestId);
        if (!video) {
            return noStore({ error: 'missing' }, 404);
        }

        return noStore({ ok: true, ...createPlaybackGrant(token) }, 200);
    } catch (error) {
        console.error('Watch session error:', error?.message || error);
        return noStore({ error: 'unavailable' }, 500);
    }
}
