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
        const isActive = searchParams.get('is_active');
        const departmentId = searchParams.get('department_id');

        client = await connectToDatabase();

        const params = [];
        let query = `
            SELECT d.id, d.name, d.is_active, d.department_id
            FROM divisions d
            WHERE 1=1
        `;

        if (isActive === 'true') {
            params.push(true);
            query += ` AND d.is_active = $${params.length}`;
        }

        if (departmentId) {
            params.push(departmentId);
            query += ` AND d.department_id = $${params.length}`;
        }

        query += ' ORDER BY d.name ASC';

        const result = await client.query(query, params);

        return NextResponse.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                is_active: row.is_active,
                department_id: row.department_id
            }))
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching divisions:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch divisions'
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
