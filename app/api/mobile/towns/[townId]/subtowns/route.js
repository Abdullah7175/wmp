import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { validateMobileApiToken } from '@/middleware/mobileApiAuth';
import { getMobileUserToken } from '@/lib/mobileAuthHelper';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    let client;
    try {
        // Validate API key
        const apiKeyError = validateMobileApiToken(request);
        if (apiKeyError) {
            return apiKeyError;
        }

        // Get and verify JWT token (optional for this endpoint)
        const decoded = getMobileUserToken(request);

        const { townId } = await params;
        const parsedTownId = parseInt(String(townId), 10);

        if (isNaN(parsedTownId) || parsedTownId <= 0) {
            return NextResponse.json({
                success: false,
                error: 'Invalid town ID'
            }, { status: 400 });
        }

        client = await connectToDatabase();

        const query = 'SELECT id, subtown as name, town_id FROM subtown WHERE town_id = $1 ORDER BY subtown ASC';
        const result = await client.query(query, [parsedTownId]);

        return NextResponse.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                subtown: row.name, // Alias for compatibility
                town_id: row.town_id
            }))
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching subtowns:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch subtowns'
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
