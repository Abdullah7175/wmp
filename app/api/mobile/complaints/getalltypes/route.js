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

        // Get and verify JWT token (optional for this endpoint, but good practice)
        const decoded = getMobileUserToken(request);
        // Note: We don't require token for this endpoint as it's public data, but we validate if provided

        client = await connectToDatabase();

        // Check if complaint_type_divisions bridge table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'complaint_type_divisions'
            );
        `);
        
        const hasBridgeTable = tableCheck.rows[0]?.exists || false;
        
        let query;
        if (hasBridgeTable) {
            query = `
                SELECT 
                    ct.id,
                    ct.type_name as name,
                    ct.division_id as single_division_id,
                    d.name as division_name,
                    ed.department_type as efiling_department_type,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM complaint_type_divisions ctd 
                            WHERE ctd.complaint_type_id = ct.id
                        ) THEN true
                        WHEN ct.division_id IS NOT NULL THEN true
                        WHEN ct.efiling_department_id IS NOT NULL AND ed.department_type = 'division' THEN true
                        ELSE false
                    END as is_division_based,
                    ct.division_id,
                    COALESCE(
                        (SELECT json_agg(jsonb_build_object('id', d2.id, 'name', d2.name))
                         FROM complaint_type_divisions ctd
                         LEFT JOIN divisions d2 ON ctd.division_id = d2.id
                         WHERE ctd.complaint_type_id = ct.id AND d2.id IS NOT NULL),
                        NULL
                    ) as divisions_from_bridge,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM complaint_type_divisions ctd 
                            WHERE ctd.complaint_type_id = ct.id
                        ) THEN NULL
                        WHEN ct.division_id IS NOT NULL THEN 
                            json_build_array(jsonb_build_object('id', d.id, 'name', d.name))
                        ELSE '[]'::json
                    END as divisions_from_direct
                FROM complaint_types ct
                LEFT JOIN divisions d ON ct.division_id = d.id
                LEFT JOIN efiling_departments ed ON ct.efiling_department_id = ed.id
                ORDER BY ct.type_name ASC
            `;
        } else {
            query = `
                SELECT 
                    ct.id,
                    ct.type_name as name,
                    d.name as division_name,
                    ed.department_type as efiling_department_type,
                    CASE 
                        WHEN ct.division_id IS NOT NULL THEN true
                        WHEN ct.efiling_department_id IS NOT NULL AND ed.department_type = 'division' THEN true
                        ELSE false
                    END as is_division_based,
                    ct.division_id,
                    CASE 
                        WHEN ct.division_id IS NOT NULL THEN 
                            json_build_array(jsonb_build_object('id', d.id, 'name', d.name))
                        ELSE '[]'::json
                    END as divisions
                FROM complaint_types ct
                LEFT JOIN divisions d ON ct.division_id = d.id
                LEFT JOIN efiling_departments ed ON ct.efiling_department_id = ed.id
                ORDER BY ct.type_name ASC
            `;
        }
        
        const result = await client.query(query);
        
        // Process results to combine divisions
        const processedRows = result.rows.map(row => {
            let divisions = [];
            if (row.divisions_from_bridge && Array.isArray(row.divisions_from_bridge)) {
                divisions = row.divisions_from_bridge;
            } else if (row.divisions_from_direct && Array.isArray(row.divisions_from_direct)) {
                divisions = row.divisions_from_direct;
            } else if (row.divisions && Array.isArray(row.divisions)) {
                divisions = row.divisions;
            }
            
            return {
                id: row.id,
                name: row.name,
                type_name: row.name, // Alias for compatibility
                is_division_based: row.is_division_based || false,
                division_id: row.division_id || row.single_division_id || null,
                divisions: divisions,
                efiling_department_type: row.efiling_department_type || (row.is_division_based ? 'division' : 'town')
            };
        });
        
        return NextResponse.json({
            success: true,
            data: processedRows
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching complaint types:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch complaint types'
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
