import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';
import {
    resolveEfilingScope,
    appendGeographyFilters,
} from '@/lib/efilingGeographyFilters';

function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatAdditionalLocations(locations) {
    if (!locations) return '';
    const arr = typeof locations === 'string' ? JSON.parse(locations) : locations;
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr
        .map((loc) => {
            const parts = [];
            if (loc.latitude != null && loc.longitude != null) {
                parts.push(`${loc.latitude}, ${loc.longitude}`);
            }
            if (loc.description) parts.push(`(${loc.description})`);
            return parts.join(' ');
        })
        .join('; ');
}

function buildCsv(rows) {
    const headers = [
        'ID',
        'Request Date',
        'Address',
        'Description',
        'Contact Number',
        'Latitude',
        'Longitude',
        'Additional Locations',
        'Town',
        'Subtown',
        'Division',
        'District',
        'Department',
        'Sub Department',
        'Nature of Work',
        'Budget Code',
        'File Type',
        'Status',
        'Submitted By',
        'Creator Type',
        'Executive Engineer',
        'Contractor',
        'Assigned To',
        'CEO Approval',
        'COO Approval',
        'CE Approval',
        'Created Date',
        'Updated Date',
    ];

    const csvRows = [headers.join(',')];

    rows.forEach((row) => {
        const values = [
            row.id,
            row.request_date ? new Date(row.request_date).toISOString().slice(0, 10) : '',
            row.address,
            row.description,
            row.contact_number,
            row.latitude,
            row.longitude,
            formatAdditionalLocations(row.additional_locations),
            row.town_name,
            row.subtown_name,
            row.division_name,
            row.district_name,
            row.complaint_type,
            row.complaint_subtype,
            row.nature_of_work,
            row.budget_code,
            row.file_type,
            row.status_name,
            row.creator_name,
            row.creator_type,
            row.executive_engineer_name,
            row.contractor_name,
            row.assigned_to_name,
            row.ceo_approval_status,
            row.coo_approval_status,
            row.ce_approval_status,
            row.created_date ? formatDateTime(row.created_date) : '',
            row.updated_date ? formatDateTime(row.updated_date) : '',
        ].map(escapeCsvValue);
        csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let client;
    try {
        client = await connectToDatabase();

        const scopeInfo = await resolveEfilingScope(request, client, { scopeKeys: ['scope', 'efiling', 'efilingScoped'] });
        if (scopeInfo.apply && scopeInfo.error) {
            return NextResponse.json({ error: scopeInfo.error.message }, { status: scopeInfo.error.status });
        }

        if (scopeInfo.apply) {
            await auth();
        }

        let dataQuery = `
            SELECT 
                wr.id,
                wr.request_date,
                wr.address,
                wr.description,
                wr.contact_number,
                wr.nature_of_work,
                wr.budget_code,
                wr.file_type,
                wr.created_date,
                wr.updated_date,
                ST_Y(wr.geo_tag) as latitude,
                ST_X(wr.geo_tag) as longitude,
                t.town as town_name,
                st.subtown as subtown_name,
                t.district_id as town_district_id,
                d.title as district_name,
                dv.name AS division_name,
                ct.type_name as complaint_type,
                cst.subtype_name as complaint_subtype,
                s.name as status_name,
                COALESCE(u.name, ag.name, sm.name) as creator_name,
                wr.creator_type,
                exen.name as executive_engineer_name,
                COALESCE(contractor.company_name, contractor.name) as contractor_name,
                a.name as assigned_to_name,
                ceo_approval.approval_status as ceo_approval_status,
                coo_approval.approval_status as coo_approval_status,
                ce_approval.approval_status as ce_approval_status,
                (
                    SELECT json_agg(
                        json_build_object(
                            'latitude', wrl.latitude,
                            'longitude', wrl.longitude,
                            'description', wrl.description
                        )
                    ) FROM work_request_locations wrl WHERE wrl.work_request_id = wr.id
                ) as additional_locations
            FROM work_requests wr
            LEFT JOIN town t ON wr.town_id = t.id
            LEFT JOIN subtown st ON wr.subtown_id = st.id
            LEFT JOIN district d ON t.district_id = d.id
            LEFT JOIN complaint_types ct ON wr.complaint_type_id = ct.id
            LEFT JOIN complaint_subtypes cst ON wr.complaint_subtype_id = cst.id
            LEFT JOIN status s ON wr.status_id = s.id
            LEFT JOIN users u ON wr.creator_type = 'user' AND wr.creator_id = u.id
            LEFT JOIN agents ag ON wr.creator_type = 'agent' AND wr.creator_id = ag.id
            LEFT JOIN socialmediaperson sm ON wr.creator_type = 'socialmedia' AND wr.creator_id = sm.id
            LEFT JOIN divisions dv ON wr.division_id = dv.id
            LEFT JOIN agents exen ON wr.executive_engineer_id = exen.id AND exen.role = 1
            LEFT JOIN agents contractor ON wr.contractor_id = contractor.id AND contractor.role = 2
            LEFT JOIN users a ON wr.assigned_to = a.id
            LEFT JOIN work_request_soft_approvals ceo_approval ON wr.id = ceo_approval.work_request_id AND ceo_approval.approver_type = 'ceo'
            LEFT JOIN work_request_soft_approvals coo_approval ON wr.id = coo_approval.work_request_id AND coo_approval.approver_type = 'coo'
            LEFT JOIN work_request_soft_approvals ce_approval ON wr.id = ce_approval.work_request_id AND ce_approval.approver_type = 'ce'
        `;

        const dataWhereClauses = [];
        const dataParams = [];
        let dataParamIdx = 1;

        if (filter) {
            dataWhereClauses.push(`(
                CAST(wr.id AS TEXT) ILIKE $${dataParamIdx} OR
                wr.address ILIKE $${dataParamIdx} OR
                t.town ILIKE $${dataParamIdx} OR
                dv.name ILIKE $${dataParamIdx} OR
                ct.type_name ILIKE $${dataParamIdx} OR
                s.name ILIKE $${dataParamIdx} OR
                COALESCE(u.name, ag.name, sm.name) ILIKE $${dataParamIdx}
            )`);
            dataParams.push(`%${filter}%`);
            dataParamIdx++;
        }

        if (dateFrom) {
            dataWhereClauses.push(`wr.request_date >= $${dataParamIdx}`);
            dataParams.push(dateFrom);
            dataParamIdx++;
        }

        if (dateTo) {
            dataWhereClauses.push(`wr.request_date <= $${dataParamIdx}`);
            dataParams.push(dateTo);
            dataParamIdx++;
        }

        if (scopeInfo.apply && !scopeInfo.isGlobal) {
            const geoAliases = {
                zone: 'wr.zone_id',
                division: 'wr.division_id',
                town: 'wr.town_id',
                district: 't.district_id',
            };
            const beforeLength = dataWhereClauses.length;
            dataParamIdx = appendGeographyFilters(
                dataWhereClauses,
                dataParams,
                dataParamIdx,
                scopeInfo.geography,
                geoAliases
            );

            if (dataWhereClauses.length === beforeLength) {
                const hasAnyGeo = scopeInfo.geography.divisionId ||
                    scopeInfo.geography.townId ||
                    scopeInfo.geography.districtId ||
                    (scopeInfo.geography.zoneIds && scopeInfo.geography.zoneIds.length > 0);

                if (!hasAnyGeo) {
                    const csv = buildCsv([]);
                    return new NextResponse('\uFEFF' + csv, {
                        headers: {
                            'Content-Type': 'text/csv; charset=utf-8',
                            'Content-Disposition': `attachment; filename="work-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
                        },
                    });
                }
            }
        }

        if (dataWhereClauses.length > 0) {
            dataQuery += ' WHERE ' + dataWhereClauses.join(' AND ');
        }

        let orderBy = 'wr.request_date DESC, wr.created_date DESC, wr.id DESC';
        if (sortBy) {
            const allowedSortFields = {
                id: 'wr.id',
                request_date: 'wr.request_date',
                address: 'wr.address',
                town_name: 't.town',
                division_name: 'dv.name',
                complaint_type: 'ct.type_name',
                status_name: 's.name',
            };

            if (allowedSortFields[sortBy]) {
                const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
                orderBy = `${allowedSortFields[sortBy]} ${direction}, wr.request_date DESC, wr.created_date DESC, wr.id DESC`;
            }
        }

        dataQuery += ` ORDER BY ${orderBy}`;

        const result = await client.query(dataQuery, dataParams);
        const csv = buildCsv(result.rows);

        return new NextResponse('\uFEFF' + csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="work-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        });
    } catch (error) {
        console.error('Error exporting requests:', error);
        return NextResponse.json({ error: 'Failed to export requests' }, { status: 500 });
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
