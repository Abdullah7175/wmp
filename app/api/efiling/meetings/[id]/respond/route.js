import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

async function getEfilingUserId(session, client) {
    if ([1, 2].includes(parseInt(session.user.role))) {
        const adminEfiling = await client.query(
            'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true',
            [session.user.id]
        );
        return adminEfiling.rows[0]?.id || null;
    }

    const efilingUser = await client.query(
        'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true',
        [session.user.id]
    );

    return efilingUser.rows[0]?.id || null;
}

// POST - Respond to meeting invitation (Accept/Decline/Tentative)
export async function POST(request, { params }) {
    let client;
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { response_status, notes } = body;

        if (!response_status || !['ACCEPTED', 'DECLINED', 'TENTATIVE'].includes(response_status)) {
            return NextResponse.json(
                { error: 'Valid response_status (ACCEPTED, DECLINED, TENTATIVE) is required' },
                { status: 400 }
            );
        }

        if (response_status === 'DECLINED' && (!notes || notes.trim() === '')) {
            return NextResponse.json(
                { error: 'A comment is required when declining a meeting.' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        const efilingUserId = await getEfilingUserId(session, client);

        if (!efilingUserId) {
            return NextResponse.json({ error: 'User not found in e-filing system' }, { status: 403 });
        }

        // Check if meeting exists
        const meetingCheck = await client.query(
            'SELECT id, status FROM efiling_meetings WHERE id = $1',
            [id]
        );

        if (meetingCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        }

        // Check if user is an attendee
        const attendeeCheck = await client.query(
            'SELECT id FROM efiling_meeting_attendees WHERE meeting_id = $1 AND attendee_id = $2',
            [id, efilingUserId]
        );

        if (attendeeCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'You are not an attendee of this meeting' },
                { status: 403 }
            );
        }

        // ... after attendeeCheck ...

        // Only perform conflict check if the user is trying to ACCEPT
        if (response_status === 'ACCEPTED') {
            // 1. Get the time details of the meeting the user is currently responding to
            const currentMeetingReq = await client.query(
                'SELECT meeting_date, start_time, end_time FROM efiling_meetings WHERE id = $1',
                [id]
            );
            const curr = currentMeetingReq.rows[0];

            // 2. Check if this user has already ACCEPTED another meeting that overlaps with this one
            const existingConflict = await client.query(
                `SELECT m.title, m.start_time, m.end_time 
         FROM efiling_meetings m
         JOIN efiling_meeting_attendees ma ON m.id = ma.meeting_id
         WHERE ma.attendee_id = $1 
         AND ma.response_status = 'ACCEPTED'
         AND m.meeting_date = $2
         AND ($3::time < m.end_time AND $4::time > m.start_time)
         AND m.id != $5`,
                [efilingUserId, curr.meeting_date, curr.start_time, curr.end_time, id]
            );

            // 3. Also check if the user is the ORGANIZER of a meeting at this time 
            // (An organizer is automatically "busy" at their own meeting)
            const organizerConflict = await client.query(
                `SELECT title, start_time, end_time 
         FROM efiling_meetings 
         WHERE organizer_id = $1 
         AND status != 'CANCELLED'
         AND meeting_date = $2
         AND ($3::time < end_time AND $4::time > start_time)
         AND id != $5`,
                [efilingUserId, curr.meeting_date, curr.start_time, curr.end_time, id]
            );

            if (existingConflict.rows.length > 0 || organizerConflict.rows.length > 0) {
                const conflict = existingConflict.rows[0] || organizerConflict.rows[0];
                return NextResponse.json(
                    { error: `You cannot acknowledge this meeting because you are already committed to "${conflict.title}" at this time.` },
                    { status: 400 }
                );
            }
        }

        // Update response
        await client.query(
            `UPDATE efiling_meeting_attendees 
             SET response_status = $1, responded_at = CURRENT_TIMESTAMP, notes = $2, updated_at = CURRENT_TIMESTAMP
             WHERE meeting_id = $3 AND attendee_id = $4
             RETURNING *`,
            [response_status, notes || null, id, efilingUserId]
        );

        // Update meeting accepted count
        const acceptedCount = await client.query(
            `SELECT COUNT(*) FROM efiling_meeting_attendees 
             WHERE meeting_id = $1 AND response_status = 'ACCEPTED'`,
            [id]
        );
        await client.query(
            'UPDATE efiling_meetings SET accepted_count = $1 WHERE id = $2',
            [parseInt(acceptedCount.rows[0].count), id]
        );

        // Mark notification as read
        await client.query(
            `UPDATE efiling_notifications 
             SET is_read = true, read_at = NOW()
             WHERE user_id = $1 AND type = 'MEETING_INVITATION' 
             AND metadata->>'meeting_id' = $2`,
            [efilingUserId, id.toString()]
        );

        return NextResponse.json({
            success: true,
            message: `Meeting invitation ${response_status === 'ACCEPTED' ? 'acknowledged' : response_status.toLowerCase()} successfully`
        });
    } catch (error) {
        console.error('Error responding to meeting:', error);
        return NextResponse.json(
            { error: 'Failed to respond to meeting', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

