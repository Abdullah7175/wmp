import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

async function ensureDaakTemplatesTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.efiling_daak_templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            subject VARCHAR(500) NULL,
            content TEXT NULL,
            to_header TEXT NULL,
            organization_name VARCHAR(255) NULL DEFAULT 'KW&SC',
            reference_number VARCHAR(100) NULL,
            category_id INTEGER NULL REFERENCES public.efiling_daak_categories(id) ON DELETE SET NULL,
            scope VARCHAR(20) NOT NULL DEFAULT 'USER'
                CHECK (scope IN ('GLOBAL', 'DEPARTMENT', 'USER')),
            department_id INTEGER NULL REFERENCES public.efiling_departments(id) ON DELETE SET NULL,
            owner_efiling_user_id INTEGER NULL REFERENCES public.efiling_users(id) ON DELETE CASCADE,
            created_by INTEGER NULL REFERENCES public.efiling_users(id) ON DELETE SET NULL,
            is_active BOOLEAN DEFAULT true,
            usage_count INTEGER DEFAULT 0,
            last_used_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

async function getEfilingProfile(client, session) {
    const res = await client.query(
        `SELECT eu.id, eu.department_id, eu.efiling_role_id
         FROM efiling_users eu
         WHERE eu.user_id = $1 AND eu.is_active = true
         LIMIT 1`,
        [session.user.id]
    );
    return res.rows[0] || null;
}

/**
 * GET /api/efiling/daak/templates
 * Query:
 *  - mine=true → only personal USER templates owned by current user
 *  - scope=GLOBAL|DEPARTMENT|USER
 *  - department_id=
 *  - for_create=true → templates current user can apply when creating a daak
 * Admin without filters sees all active templates.
 */
export async function GET(request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let client;
    try {
        client = await connectToDatabase();
        await ensureDaakTemplatesTable(client);

        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        const profile = await getEfilingProfile(client, session);
        const { searchParams } = new URL(request.url);
        const mine = searchParams.get('mine') === 'true';
        const forCreate = searchParams.get('for_create') === 'true';
        const scopeFilter = searchParams.get('scope');
        const departmentId = searchParams.get('department_id');

        const params = [];
        let param = 1;
        const conditions = ['t.is_active = true'];

        if (mine) {
            if (!profile) {
                return NextResponse.json({ error: 'E-filing profile required' }, { status: 403 });
            }
            conditions.push(`t.scope = 'USER'`);
            conditions.push(`t.owner_efiling_user_id = $${param++}`);
            params.push(profile.id);
        } else if (forCreate) {
            if (!profile && !isAdmin) {
                return NextResponse.json({ error: 'E-filing profile required' }, { status: 403 });
            }
            if (isAdmin && !profile) {
                // Admin without efiling profile: global only
                conditions.push(`t.scope = 'GLOBAL'`);
            } else {
                conditions.push(`(
                    t.scope = 'GLOBAL'
                    OR (t.scope = 'DEPARTMENT' AND t.department_id = $${param})
                    OR (t.scope = 'USER' AND t.owner_efiling_user_id = $${param + 1})
                )`);
                params.push(profile.department_id || -1, profile.id);
                param += 2;
            }
        } else if (!isAdmin) {
            // Non-admin list without mine/for_create: own + visible
            if (!profile) {
                return NextResponse.json({ error: 'E-filing profile required' }, { status: 403 });
            }
            conditions.push(`(
                t.scope = 'GLOBAL'
                OR (t.scope = 'DEPARTMENT' AND t.department_id = $${param})
                OR (t.scope = 'USER' AND t.owner_efiling_user_id = $${param + 1})
            )`);
            params.push(profile.department_id || -1, profile.id);
            param += 2;
        }

        if (scopeFilter && ['GLOBAL', 'DEPARTMENT', 'USER'].includes(scopeFilter.toUpperCase())) {
            conditions.push(`t.scope = $${param++}`);
            params.push(scopeFilter.toUpperCase());
        }

        if (departmentId) {
            conditions.push(`t.department_id = $${param++}`);
            params.push(parseInt(departmentId));
        }

        const result = await client.query(
            `SELECT
                t.*,
                dc.name as category_name,
                dc.color as category_color,
                dept.name as department_name,
                owner_u.name as owner_name,
                creator_u.name as created_by_name
             FROM efiling_daak_templates t
             LEFT JOIN efiling_daak_categories dc ON t.category_id = dc.id
             LEFT JOIN efiling_departments dept ON t.department_id = dept.id
             LEFT JOIN efiling_users owner_eu ON t.owner_efiling_user_id = owner_eu.id
             LEFT JOIN users owner_u ON owner_eu.user_id = owner_u.id
             LEFT JOIN efiling_users creator_eu ON t.created_by = creator_eu.id
             LEFT JOIN users creator_u ON creator_eu.user_id = creator_u.id
             WHERE ${conditions.join(' AND ')}
             ORDER BY t.scope, t.name ASC`,
            params
        );

        return NextResponse.json({ success: true, templates: result.rows });
    } catch (error) {
        console.error('Error fetching daak templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daak templates', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

/**
 * POST /api/efiling/daak/templates
 * Admin: can create GLOBAL / DEPARTMENT / USER (for any user)
 * Efilinguser: can only create USER templates for themselves
 */
export async function POST(request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let client;
    try {
        const body = await request.json();
        const {
            name,
            subject,
            content,
            to_header,
            organization_name = 'KW&SC',
            reference_number,
            category_id,
            scope: rawScope,
            department_id,
            owner_efiling_user_id,
        } = body;

        if (!name || (!subject && !content && !to_header)) {
            return NextResponse.json(
                { error: 'Name and at least one of subject, content, or to_header is required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();
        await ensureDaakTemplatesTable(client);

        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        const profile = await getEfilingProfile(client, session);

        if (!isAdmin && !profile) {
            return NextResponse.json({ error: 'E-filing profile required' }, { status: 403 });
        }

        let scope = (rawScope || 'USER').toUpperCase();
        let finalDepartmentId = department_id ? parseInt(department_id) : null;
        let finalOwnerId = owner_efiling_user_id ? parseInt(owner_efiling_user_id) : null;

        if (!isAdmin) {
            // Users may only create personal templates
            scope = 'USER';
            finalDepartmentId = null;
            finalOwnerId = profile.id;
        } else {
            if (scope === 'GLOBAL') {
                finalDepartmentId = null;
                finalOwnerId = null;
            } else if (scope === 'DEPARTMENT') {
                if (!finalDepartmentId) {
                    return NextResponse.json(
                        { error: 'department_id is required for DEPARTMENT templates' },
                        { status: 400 }
                    );
                }
                finalOwnerId = null;
            } else if (scope === 'USER') {
                if (!finalOwnerId) {
                    return NextResponse.json(
                        { error: 'owner_efiling_user_id is required for USER templates' },
                        { status: 400 }
                    );
                }
                finalDepartmentId = null;
            } else {
                return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });
            }
        }

        const result = await client.query(
            `INSERT INTO efiling_daak_templates (
                name, subject, content, to_header, organization_name, reference_number,
                category_id, scope, department_id, owner_efiling_user_id, created_by, is_active
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true)
             RETURNING *`,
            [
                name.trim(),
                subject || null,
                content || null,
                to_header || null,
                organization_name || 'KW&SC',
                reference_number || null,
                category_id || null,
                scope,
                finalDepartmentId,
                finalOwnerId,
                profile?.id || null,
            ]
        );

        return NextResponse.json({
            success: true,
            template: result.rows[0],
            message: 'Daak template created successfully',
        });
    } catch (error) {
        console.error('Error creating daak template:', error);
        return NextResponse.json(
            { error: 'Failed to create daak template', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
