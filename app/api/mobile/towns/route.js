import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { validateMobileApiToken } from '@/middleware/mobileApiAuth';
import { getMobileUserToken } from '@/lib/mobileAuthHelper';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    let client;
    try {
        // Validate API key
        const apiKeyError = validateMobileApiToken(request);
        if (apiKeyError) {
            return apiKeyError;
        }

        // Get and verify JWT token (optional for this endpoint)
        const decoded = getMobileUserToken(request);

        const { searchParams } = new URL(request.url);
        const districtId = searchParams.get('district_id');

        client = await connectToDatabase();

        let query = 'SELECT id, town as name, district_id FROM town WHERE 1=1';
        const params = [];

        if (districtId) {
            query += ' AND district_id = $1';
            params.push(districtId);
        }

        query += ' ORDER BY town ASC';

        const result = await client.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                town: row.name, // Alias for compatibility
                district_id: row.district_id
            }))
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching towns:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch towns'
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
