import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger } from '@/lib/efilingActionLogger';
import { auth } from '@/auth';
import { getUserGeography, isGlobalRoleCode } from '@/lib/efilingGeographicRouting';

export async function GET(request) {
    // SECURITY: Require authentication
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const isActive = searchParams.get('is_active');

        const client = await connectToDatabase();

        try {
            let userGeography = null;
            let canSeeAll = false;

            if (session?.user) {
                if ([1, 2].includes(parseInt(session.user.role))) {
                    canSeeAll = true;
                } else {
                    userGeography = await getUserGeography(client, session.user.id);
                    if (userGeography && isGlobalRoleCode(userGeography.role_code)) {
                        canSeeAll = true;
                    }
                }
            }

            if (id) {
                // Fetch single role by ID
                const query = `
                    SELECT 
                        r.*, 
                        d.name as department_name,
                        STRING_AGG(u.name, ', ') as user_name
                    FROM efiling_roles r
                    LEFT JOIN efiling_departments d ON r.department_id = d.id
                    LEFT JOIN efiling_users eu ON eu.efiling_role_id = r.id
                    LEFT JOIN users u ON u.id = eu.user_id
                    WHERE r.id = $1
                    GROUP BY r.id, d.name
                `;
                const result = await client.query(query, [id]);
                
                if (result.rows.length === 0) {
                    return NextResponse.json(
                        { error: 'Role not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json(result.rows[0]);
            } else {
                // Check if efiling_role_locations table exists
                let hasRoleLocationsTable = false;
                try {
                    const tableCheck = await client.query(`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = 'efiling_role_locations'
                        );
                    `);
                    hasRoleLocationsTable = tableCheck.rows[0]?.exists || false;
                } catch (tableError) {
                    console.warn('Could not check for efiling_role_locations table:', tableError.message);
                }

                // Fetch all roles
                let query = `
                    SELECT 
                        r.*, 
                        d.name as department_name,
                        STRING_AGG(DISTINCT u.name, ', ') as user_name
                    FROM efiling_roles r
                    LEFT JOIN efiling_departments d ON r.department_id = d.id
                    LEFT JOIN efiling_users eu ON eu.efiling_role_id = r.id
                    LEFT JOIN users u ON u.id = eu.user_id
                    ${hasRoleLocationsTable ? 'LEFT JOIN efiling_role_locations rl ON rl.role_id = r.id' : ''}
                `;
                
                const params = [];
                const conditions = [];

                if (isActive !== null) {
                    conditions.push(`r.is_active = $${params.length + 1}`);
                    params.push(isActive === 'true');
                }

                if (!canSeeAll && userGeography && hasRoleLocationsTable) {
                    const locationParts = [];
                    const pushParam = (value) => {
                        params.push(value);
                        return `$${params.length}`;
                    };

                    if (userGeography.zone_ids && userGeography.zone_ids.length > 0) {
                        const placeholder = pushParam(userGeography.zone_ids);
                        locationParts.push(`rl.zone_id = ANY(${placeholder}::int[])`);
                    }
                    if (userGeography.division_id) {
                        locationParts.push(`rl.division_id = ${pushParam(userGeography.division_id)}`);
                    }
                    if (userGeography.district_id) {
                        locationParts.push(`rl.district_id = ${pushParam(userGeography.district_id)}`);
                    }
                    if (userGeography.town_id) {
                        locationParts.push(`rl.town_id = ${pushParam(userGeography.town_id)}`);
                    }

                    if (locationParts.length > 0) {
                        conditions.push(`(rl.id IS NULL OR ${locationParts.join(' OR ')})`);
                    }
                }

                if (conditions.length > 0) {
                    query += ` WHERE ${conditions.join(' AND ')}`;
                }

                query += ` GROUP BY r.id, d.name ORDER BY r.name ASC`;
                const result = await client.query(query, params);

                return NextResponse.json({
                    success: true,
                    roles: result.rows
                });
            }

        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error fetching roles:', error);
        const { handleDatabaseError } = await import('@/lib/errorHandler');
        const dbError = handleDatabaseError(error, 'fetch roles');
        return NextResponse.json(
            { error: dbError.error },
            { status: dbError.status }
        );
    }
}

export async function POST(request) {
    try {
        const { name, code, description, department_id, permissions, is_active, allowed_file_type_ids } = await request.json();

        // Validate required fields
        if (!name || !code) {
            return NextResponse.json(
                { error: 'Name and code are required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        try {
            await client.query('BEGIN'); // Start transaction

            // Check if code already exists
            const existingCode = await client.query(
                'SELECT id FROM efiling_roles WHERE code = $1',
                [code]
            );

            if (existingCode.rows.length > 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Role code already exists' },
                    { status: 400 }
                );
            }

            const query = `
                INSERT INTO efiling_roles (name, code, description, department_id, permissions, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const result = await client.query(query, [
                name, 
                code, 
                description || null, 
                department_id || null, 
                permissions ? JSON.stringify(permissions) : null,
                is_active !== undefined ? is_active : true
            ]);

            const roleCode = code.toUpperCase();

            // Handle Allowed File Types (can_create_roles jsonb update)
            if (Array.isArray(allowed_file_type_ids)) {
                // 1. Remove this role code from all file types where it currently exists
                await client.query(`
                    UPDATE efiling_file_types 
                    SET can_create_roles = (
                        SELECT jsonb_agg(elem)
                        FROM jsonb_array_elements_text(COALESCE(can_create_roles, '[]'::jsonb)) AS elem
                        WHERE elem != $1
                    )
                    WHERE can_create_roles ? $1
                `, [roleCode]);

                // 2. Add this role code to selected file types
                if (allowed_file_type_ids.length > 0) {
                    await client.query(`
                        UPDATE efiling_file_types
                        SET can_create_roles = CASE 
                            WHEN can_create_roles IS NULL THEN jsonb_build_array($1::text)
                            WHEN can_create_roles ? $1 THEN can_create_roles
                            ELSE can_create_roles || jsonb_build_array($1::text)
                        END
                        WHERE id = ANY($2::int[])
                    `, [roleCode, allowed_file_type_ids]);
                }
            }

            await client.query('COMMIT'); // Commit transaction

            // Log the action
            try {
                await eFileActionLogger.logAction({
                    entityId: null,
                    userId: 'system',
                    action: 'ROLE_CREATED',
                    entityType: 'efiling_role',
                    details: { 
                        name, 
                        code, 
                        description, 
                        department_id, 
                        permissions, 
                        is_active,
                        allowed_file_type_ids,
                        description: `Role "${name}" (${code}) created`
                    }
                });
            } catch (logError) {
                console.error('Error logging role creation action:', logError);
            }

            return NextResponse.json({
                success: true,
                role: result.rows[0]
            }, { status: 201 });

        } catch (dbErr) {
            await client.query('ROLLBACK');
            throw dbErr;
        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error creating role:', error);
        const { handleDatabaseError } = await import('@/lib/errorHandler');
        const dbError = handleDatabaseError(error, 'create role');
        return NextResponse.json(
            { error: dbError.error },
            { status: dbError.status }
        );
    }
}

export async function PUT(request) {
    try {
        const { id, name, code, description, department_id, permissions, is_active, allowed_file_type_ids } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Role ID is required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        try {
            await client.query('BEGIN');

            // Check if role exists
            const existing = await client.query(
                'SELECT * FROM efiling_roles WHERE id = $1',
                [id]
            );

            if (existing.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Role not found' },
                    { status: 404 }
                );
            }

            const oldCode = existing.rows[0].code;
            const newCode = code ? code.toUpperCase() : oldCode;

            // Check if code already exists (excluding current role)
            if (code && code !== oldCode) {
                const existingCode = await client.query(
                    'SELECT id FROM efiling_roles WHERE code = $1 AND id != $2',
                    [code, id]
                );

                if (existingCode.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return NextResponse.json(
                        { error: 'Role code already exists' },
                        { status: 400 }
                    );
                }
            }

            const query = `
                UPDATE efiling_roles 
                SET name = COALESCE($2, name),
                    code = COALESCE($3, code),
                    description = COALESCE($4, description),
                    department_id = COALESCE($5, department_id),
                    permissions = COALESCE($6, permissions),
                    is_active = COALESCE($7, is_active),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;

            const result = await client.query(query, [
                id, 
                name, 
                newCode, 
                description, 
                department_id, 
                permissions ? JSON.stringify(permissions) : null,
                is_active
            ]);

            // Handle Allowed File Types (can_create_roles jsonb update)
            if (Array.isArray(allowed_file_type_ids)) {
                // 1. Remove old and new role code references from all file types
                await client.query(`
                    UPDATE efiling_file_types 
                    SET can_create_roles = (
                        SELECT jsonb_agg(elem)
                        FROM jsonb_array_elements_text(COALESCE(can_create_roles, '[]'::jsonb)) AS elem
                        WHERE elem != $1 AND elem != $2
                    )
                    WHERE can_create_roles ? $1 OR can_create_roles ? $2
                `, [oldCode, newCode]);

                // 2. Add new role code to selected file types
                if (allowed_file_type_ids.length > 0) {
                    await client.query(`
                        UPDATE efiling_file_types
                        SET can_create_roles = CASE 
                            WHEN can_create_roles IS NULL THEN jsonb_build_array($1::text)
                            WHEN can_create_roles ? $1 THEN can_create_roles
                            ELSE can_create_roles || jsonb_build_array($1::text)
                        END
                        WHERE id = ANY($2::int[])
                    `, [newCode, allowed_file_type_ids]);
                }
            }

            await client.query('COMMIT');

            // Log action
            try {
                await eFileActionLogger.logAction({
                    entityId: null,
                    userId: 'system',
                    action: 'ROLE_UPDATED',
                    entityType: 'efiling_role',
                    details: { 
                        name, 
                        code: newCode, 
                        description, 
                        department_id, 
                        permissions, 
                        is_active,
                        allowed_file_type_ids,
                        description: `Role "${name}" (${newCode}) updated`
                    }
                });
            } catch (logError) {
                console.error('Error logging role update action:', logError);
            }

            return NextResponse.json({
                success: true,
                role: result.rows[0]
            });

        } catch (dbErr) {
            await client.query('ROLLBACK');
            throw dbErr;
        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error updating role:', error);
        const { handleDatabaseError } = await import('@/lib/errorHandler');
        const dbError = handleDatabaseError(error, 'update role');
        return NextResponse.json(
            { error: dbError.error },
            { status: dbError.status }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Role ID is required' },
                { status: 400 }
            );
        }

        const client = await connectToDatabase();

        try {
            // Check if role exists
            const existing = await client.query(
                'SELECT * FROM efiling_roles WHERE id = $1',
                [id]
            );

            if (existing.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Role not found' },
                    { status: 404 }
                );
            }

            // Check if role has users
            const usersCount = await client.query(
                'SELECT COUNT(*) FROM efiling_users WHERE efiling_role_id = $1',
                [id]
            );

            if (parseInt(usersCount.rows[0].count) > 0) {
                return NextResponse.json({ 
                    error: 'Cannot delete role with assigned users' 
                }, { status: 400 });
            }

            await client.query('DELETE FROM efiling_roles WHERE id = $1', [id]);

            // Log the action
            try {
                            await eFileActionLogger.logAction({
                entityId: null,
                userId: 'system', // Since this is system-level action
                action: 'ROLE_DELETED',
                entityType: 'efiling_role',
                details: { 
                    name: existing.rows[0].name, 
                    code: existing.rows[0].code,
                    description: `Role "${existing.rows[0].name}" (${existing.rows[0].code}) deleted`
                }
            });
            } catch (logError) {
                console.error('Error logging role deletion action:', logError);
            }

            return NextResponse.json({
                success: true,
                message: 'Role deleted successfully'
            });

        } finally {
            await client.release();
        }

    } catch (error) {
        console.error('Error deleting role:', error);
        const { handleDatabaseError } = await import('@/lib/errorHandler');
        const dbError = handleDatabaseError(error, 'delete role');
        return NextResponse.json(
            { error: dbError.error },
            { status: dbError.status }
        );
    }
}
