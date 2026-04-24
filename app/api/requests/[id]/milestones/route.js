import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; 

export async function GET(request, { params }) {
    // FIX 1: Await params. In newer Next.js versions, params is a Promise.
    // Without this, 'id' will be undefined, causing your queries to fail or return 404s.
    const { id } = await params; 

    try {
        // 1. Get nature of work for this request
        const requestInfo = await query(
            'SELECT nature_of_work, status_id FROM work_requests WHERE id = $1',
            [id]
        );

        if (requestInfo.rows.length === 0) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        const natureOfWork = requestInfo.rows[0].nature_of_work;

        // 2. Fetch all defined milestones for this nature of work
        const definitions = await query(
            'SELECT * FROM milestone_definitions WHERE nature_of_work = $1 ORDER BY order_sequence ASC',
            [natureOfWork]
        );

        // 3. Fetch completed milestones for this specific request
        // Ensure your table column is 'work_request_id' as seen in your blueprint
        const content = await query(
            'SELECT milestone_id FROM milestone_content WHERE work_request_id = $1',
            [id]
        );

        const completedIds = content.rows.map(c => c.milestone_id);

        // Return a 200 OK with the data
        return NextResponse.json({
            success: true,
            definitions: definitions.rows,
            completedMilestoneIds: completedIds
        });

    } catch (error) {
        console.error('Milestone API Error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}