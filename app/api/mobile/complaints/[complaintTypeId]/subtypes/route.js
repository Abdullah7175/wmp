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

        const { complaintTypeId } = await params;
        const parsedComplaintTypeId = parseInt(String(complaintTypeId), 10);

        if (isNaN(parsedComplaintTypeId) || parsedComplaintTypeId <= 0) {
            return NextResponse.json({
                success: false,
                error: 'Invalid complaint type ID'
            }, { status: 400 });
        }

        client = await connectToDatabase();

        const query = `
            SELECT 
                cs.id,
                cs.subtype_name as name,
                cs.description,
                cs.complaint_type_id
            FROM complaint_subtypes cs
            WHERE cs.complaint_type_id = $1
            ORDER BY cs.subtype_name ASC
        `;
        const result = await client.query(query, [parsedComplaintTypeId]);

        return NextResponse.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                subtype_name: row.name, // Alias for compatibility
                description: row.description,
                complaint_type_id: row.complaint_type_id
            }))
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching complaint subtypes:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch complaint subtypes'
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
