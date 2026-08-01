import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

async function getEfilingProfile(client, session) {
    const res = await client.query(
        `SELECT eu.id, eu.department_id
         FROM efiling_users eu
         WHERE eu.user_id = $1 AND eu.is_active = true
         LIMIT 1`,
        [session.user.id]
    );
    return res.rows[0] || null;
}

async function loadTemplate(client, id) {
    const res = await client.query(
        `SELECT t.*,
                dc.name as category_name,
                dept.name as department_name,
                owner_u.name as owner_name
         FROM efiling_daak_templates t
         LEFT JOIN efiling_daak_categories dc ON t.category_id = dc.id
         LEFT JOIN efiling_departments dept ON t.department_id = dept.id
         LEFT JOIN efiling_users owner_eu ON t.owner_efiling_user_id = owner_eu.id
         LEFT JOIN users owner_u ON owner_eu.user_id = owner_u.id
         WHERE t.id = $1`,
        [id]
    );
    return res.rows[0] || null;
}

function canManage(template, profile, isAdmin) {
    if (isAdmin) return true;
    if (!profile || !template) return false;
    return (
        template.scope === 'USER' &&
        Number(template.owner_efiling_user_id) === Number(profile.id)
    );
}

function canView(template, profile, isAdmin) {
    if (isAdmin) return true;
    if (!profile || !template || !template.is_active) return false;
    if (template.scope === 'GLOBAL') return true;
    if (template.scope === 'DEPARTMENT') {
        return Number(template.department_id) === Number(profile.department_id);
    }
    if (template.scope === 'USER') {
        return Number(template.owner_efiling_user_id) === Number(profile.id);
    }
    return false;
}

export async function GET(request, { params }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        const profile = await getEfilingProfile(client, session);
        const template = await loadTemplate(client, id);

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        if (!canView(template, profile, isAdmin)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ success: true, template });
    } catch (error) {
        console.error('Error fetching daak template:', error);
        return NextResponse.json(
            { error: 'Failed to fetch template', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

export async function PUT(request, { params }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        client = await connectToDatabase();
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        const profile = await getEfilingProfile(client, session);
        const existing = await loadTemplate(client, id);

        if (!existing || !existing.is_active) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        if (!canManage(existing, profile, isAdmin)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Optional: bump usage when applying template
        if (body.mark_used === true) {
            const updated = await client.query(
                `UPDATE efiling_daak_templates
                 SET usage_count = COALESCE(usage_count, 0) + 1,
                     last_used_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1
                 RETURNING *`,
                [id]
            );
            return NextResponse.json({ success: true, template: updated.rows[0] });
        }

        const fields = [];
        const values = [];
        let i = 1;

        const allow = [
            'name',
            'subject',
            'content',
            'to_header',
            'organization_name',
            'reference_number',
            'category_id',
        ];

        for (const key of allow) {
            if (body[key] !== undefined) {
                fields.push(`${key} = $${i++}`);
                values.push(body[key] === '' ? null : body[key]);
            }
        }

        // Admin can change scope / department / owner
        if (isAdmin) {
            if (body.scope !== undefined) {
                const scope = String(body.scope).toUpperCase();
                if (!['GLOBAL', 'DEPARTMENT', 'USER'].includes(scope)) {
                    return NextResponse.json({ error: 'Invalid scope' }, { status: 400 });
                }
                fields.push(`scope = $${i++}`);
                values.push(scope);

                if (scope === 'GLOBAL') {
                    fields.push(`department_id = NULL`);
                    fields.push(`owner_efiling_user_id = NULL`);
                } else if (scope === 'DEPARTMENT') {
                    const deptId = body.department_id ?? existing.department_id;
                    if (!deptId) {
                        return NextResponse.json(
                            { error: 'department_id required for DEPARTMENT scope' },
                            { status: 400 }
                        );
                    }
                    fields.push(`department_id = $${i++}`);
                    values.push(parseInt(deptId));
                    fields.push(`owner_efiling_user_id = NULL`);
                } else if (scope === 'USER') {
                    const ownerId = body.owner_efiling_user_id ?? existing.owner_efiling_user_id;
                    if (!ownerId) {
                        return NextResponse.json(
                            { error: 'owner_efiling_user_id required for USER scope' },
                            { status: 400 }
                        );
                    }
                    fields.push(`owner_efiling_user_id = $${i++}`);
                    values.push(parseInt(ownerId));
                    fields.push(`department_id = NULL`);
                }
            } else {
                if (body.department_id !== undefined && existing.scope === 'DEPARTMENT') {
                    fields.push(`department_id = $${i++}`);
                    values.push(body.department_id ? parseInt(body.department_id) : null);
                }
                if (body.owner_efiling_user_id !== undefined && existing.scope === 'USER') {
                    fields.push(`owner_efiling_user_id = $${i++}`);
                    values.push(
                        body.owner_efiling_user_id ? parseInt(body.owner_efiling_user_id) : null
                    );
                }
            }
        }

        if (fields.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await client.query(
            `UPDATE efiling_daak_templates
             SET ${fields.join(', ')}
             WHERE id = $${i}
             RETURNING *`,
            values
        );

        return NextResponse.json({ success: true, template: result.rows[0] });
    } catch (error) {
        console.error('Error updating daak template:', error);
        return NextResponse.json(
            { error: 'Failed to update template', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

export async function DELETE(request, { params }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        const profile = await getEfilingProfile(client, session);
        const existing = await loadTemplate(client, id);

        if (!existing || !existing.is_active) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        if (!canManage(existing, profile, isAdmin)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await client.query(
            `UPDATE efiling_daak_templates
             SET is_active = false, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [id]
        );

        return NextResponse.json({ success: true, message: 'Template deleted' });
    } catch (error) {
        console.error('Error deleting daak template:', error);
        return NextResponse.json(
            { error: 'Failed to delete template', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}
