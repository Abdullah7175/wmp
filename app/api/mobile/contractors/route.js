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

        // Get and verify JWT token (optional for this endpoint, but recommended)
        const decoded = getMobileUserToken(request);

        const { searchParams } = new URL(request.url);
        const complaintTypeId = searchParams.get('complaint_type_id');
        const townId = searchParams.get('town_id');
        const divisionId = searchParams.get('division_id');

        client = await connectToDatabase();

        let query = `
            SELECT 
                a.id,
                a.name,
                a.company_name,
                a.email,
                a.contact_number,
                a.designation,
                a.town_id,
                a.division_id,
                a.complaint_type_id,
                t.town as town_name,
                div.name as division_name,
                ct.type_name as complaint_type_name
            FROM agents a
            LEFT JOIN town t ON a.town_id = t.id
            LEFT JOIN divisions div ON a.division_id = div.id
            LEFT JOIN complaint_types ct ON a.complaint_type_id = ct.id
            WHERE a.role = 2
            AND a.id IS NOT NULL
        `;
        
        const params = [];

        // Filter by complaint type if provided
        if (complaintTypeId) {
            params.push(complaintTypeId);
            query += ` AND a.complaint_type_id = $${params.length}`;
        }

        // Filter by town if provided (for town-based requests)
        if (townId && !divisionId) {
            params.push(townId);
            query += ` AND a.town_id = $${params.length}`;
        }

        // Filter by division if provided (for division-based requests)
        if (divisionId) {
            params.push(divisionId);
            query += ` AND a.division_id = $${params.length}`;
        }

        query += ' ORDER BY COALESCE(a.company_name, a.name) ASC';

        const result = await client.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                company_name: row.company_name || null,
                email: row.email || null,
                contact_number: row.contact_number || null,
                designation: row.designation || null,
                town_id: row.town_id || null,
                town_name: row.town_name || null,
                division_id: row.division_id || null,
                division_name: row.division_name || null,
                complaint_type_id: row.complaint_type_id || null,
                complaint_type_name: row.complaint_type_name || null
            }))
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching contractors:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch contractors'
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
