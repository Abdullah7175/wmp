import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

/**
 * GET /api/efiling/templates
 * Get templates filtered by department, role, and template type
 * Query params:
 * - department_id (optional)
 * - role_id (optional)
 * - template_type (optional)
 * - user_id (optional) - filter templates created by user
 * - include_system (optional, default: true)
 */
export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get('department_id');
        const roleId = searchParams.get('role_id');
        const templateType = searchParams.get('template_type');
        const userId = searchParams.get('user_id');
        const includeSystem = searchParams.get('include_system') !== 'false';

        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        client = await connectToDatabase();

        // Get user's e-filing profile for filtering
        const userRes = await client.query(`
            SELECT eu.id, eu.department_id, eu.efiling_role_id, u.role as user_role
            FROM efiling_users eu
            JOIN users u ON eu.user_id = u.id
            WHERE u.id = $1 AND eu.is_active = true
        `, [token.user.id]);

        const isAdmin = [1, 2].includes(token.user.role);
        const userEfiling = userRes.rows[0] || null;

        // Build query with multiple departments/roles support
        let query = `
            SELECT DISTINCT
                t.id,
                t.name,
                t.template_type,
                t.title,
                t.subject,
                t.main_content,
                t.category_id,
                c.name as category_name,
                t.department_id as single_department_id,
                t.role_id as single_role_id,
                t.created_by,
                u_creator.name as created_by_name,
                t.is_system_template,
                t.is_active,
                t.usage_count,
                t.last_used_at,
                t.created_at,
                t.updated_at,
                -- Multiple departments
                COALESCE(
                    json_agg(DISTINCT jsonb_build_object('id', td.department_id, 'name', d.name)) 
                    FILTER (WHERE td.department_id IS NOT NULL),
                    '[]'::json
                ) as departments,
                -- Multiple roles
                COALESCE(
                    json_agg(DISTINCT jsonb_build_object('id', tr.role_id, 'name', r.name, 'code', r.code)) 
                    FILTER (WHERE tr.role_id IS NOT NULL),
                    '[]'::json
                ) as roles
            FROM efiling_templates t
            LEFT JOIN efiling_file_categories c ON t.category_id = c.id
            LEFT JOIN efiling_template_departments td ON t.id = td.template_id
            LEFT JOIN efiling_departments d ON td.department_id = d.id
            LEFT JOIN efiling_template_roles tr ON t.id = tr.template_id
            LEFT JOIN efiling_roles r ON tr.role_id = r.id
            LEFT JOIN efiling_users eu_creator ON t.created_by = eu_creator.id
            LEFT JOIN users u_creator ON eu_creator.user_id = u_creator.id
            WHERE t.is_active = true
        `;

        const params = [];
        let paramIndex = 1;
        const conditions = [];

        // For non-admin users, filter by their department/role
        if (!isAdmin && userEfiling) {
            conditions.push(`(
                -- Templates matching user's department (from bridge table or single department)
                (EXISTS (
                    SELECT 1 FROM efiling_template_departments td 
                    WHERE td.template_id = t.id AND td.department_id = $${paramIndex}
                ) OR t.department_id = $${paramIndex} OR t.department_id IS NULL)
                AND
                -- Templates matching user's role (from bridge table or single role)
                (EXISTS (
                    SELECT 1 FROM efiling_template_roles tr 
                    WHERE tr.template_id = t.id AND tr.role_id = $${paramIndex + 1}
                ) OR t.role_id = $${paramIndex + 1} OR t.role_id IS NULL)
                OR
                -- User's own templates
                (t.created_by = $${paramIndex + 2})
            )`);
            params.push(userEfiling.department_id, userEfiling.efiling_role_id, userEfiling.id);
            paramIndex += 3;
        }

        // Filter by department_id if provided (check both bridge table and single department)
        if (departmentId) {
            conditions.push(`(
                EXISTS (
                    SELECT 1 FROM efiling_template_departments td 
                    WHERE td.template_id = t.id AND td.department_id = $${paramIndex}
                ) OR t.department_id = $${paramIndex}
            )`);
            params.push(parseInt(departmentId));
            paramIndex++;
        }

        // Filter by role_id if provided (check both bridge table and single role)
        if (roleId) {
            conditions.push(`(
                EXISTS (
                    SELECT 1 FROM efiling_template_roles tr 
                    WHERE tr.template_id = t.id AND tr.role_id = $${paramIndex}
                ) OR t.role_id = $${paramIndex}
            )`);
            params.push(parseInt(roleId));
            paramIndex++;
        }

        // Filter by template_type if provided
        if (templateType) {
            conditions.push(`t.template_type = $${paramIndex}`);
            params.push(templateType);
            paramIndex++;
        }

        // Filter by user_id if provided
        if (userId) {
            conditions.push(`t.created_by = $${paramIndex}`);
            params.push(parseInt(userId));
            paramIndex++;
        }

        // Filter system templates if needed
        if (!includeSystem) {
            conditions.push(`t.is_system_template = false`);
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        query += ' GROUP BY t.id, c.name, u_creator.name ORDER BY t.template_type, t.name';

        const result = await client.query(query, params);

        return NextResponse.json({
            success: true,
            templates: result.rows
        });

    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

/**
 * POST /api/efiling/templates
 * Create a new template
 * Body: { name, template_type, title, subject, main_content, category_id, department_id, role_id }
 */
export async function POST(request) {
    let client;
    try {
        const body = await request.json();
        const { name, template_type, title, subject, main_content, category_id, department_id, role_id, department_ids, role_ids } = body;

        if (!name || (!title && !subject && !main_content)) {
            return NextResponse.json(
                { error: 'Name and at least one of (title, subject, main_content) is required' },
                { status: 400 }
            );
        }

        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        client = await connectToDatabase();

        const isAdmin = [1, 2].includes(token.user.role);

        // Get user's e-filing profile
        const userRes = await client.query(`
            SELECT eu.id, eu.department_id, eu.efiling_role_id
            FROM efiling_users eu
            JOIN users u ON eu.user_id = u.id
            WHERE u.id = $1 AND eu.is_active = true
        `, [token.user.id]);

        if (userRes.rows.length === 0 && !isAdmin) {
            return NextResponse.json({ error: 'User not found in e-filing system' }, { status: 403 });
        }

        const userEfiling = userRes.rows[0];

        // Support both single and multiple departments/roles
        let finalDepartmentIds = department_ids && Array.isArray(department_ids) && department_ids.length > 0 
            ? department_ids.filter(id => id).map(id => parseInt(id)) 
            : (department_id ? [parseInt(department_id)] : []);
        
        let finalRoleIds = role_ids && Array.isArray(role_ids) && role_ids.length > 0 
            ? role_ids.filter(id => id).map(id => parseInt(id)) 
            : (role_id ? [parseInt(role_id)] : []);

        // For non-admin users, auto-populate department and role
        let isSystemTemplate = false;

        if (!isAdmin) {
            finalDepartmentIds = userEfiling.department_id ? [userEfiling.department_id] : [];
            finalRoleIds = userEfiling.efiling_role_id ? [userEfiling.efiling_role_id] : [];
            isSystemTemplate = false;
        } else {
            // Admin can set multiple departments/roles or leave empty for global templates
            isSystemTemplate = true;
        }

        await client.query('BEGIN');

        // Insert template (keep single department_id/role_id for backward compatibility)
        const singleDepartmentId = finalDepartmentIds.length === 1 ? finalDepartmentIds[0] : null;
        const singleRoleId = finalRoleIds.length === 1 ? finalRoleIds[0] : null;

        const result = await client.query(`
            INSERT INTO efiling_templates (
                name, template_type, title, subject, main_content,
                category_id, department_id, role_id, created_by, is_system_template
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            name,
            template_type || null,
            title || null,
            subject || null,
            main_content || null,
            category_id || null,
            singleDepartmentId,
            singleRoleId,
            userEfiling?.id || null,
            isSystemTemplate
        ]);

        const templateId = result.rows[0].id;

        // Insert multiple departments
        if (finalDepartmentIds.length > 0) {
            for (const deptId of finalDepartmentIds) {
                await client.query(`
                    INSERT INTO efiling_template_departments (template_id, department_id)
                    VALUES ($1, $2)
                    ON CONFLICT (template_id, department_id) DO NOTHING
                `, [templateId, deptId]);
            }
        }

        // Insert multiple roles
        if (finalRoleIds.length > 0) {
            for (const roleIdVal of finalRoleIds) {
                await client.query(`
                    INSERT INTO efiling_template_roles (template_id, role_id)
                    VALUES ($1, $2)
                    ON CONFLICT (template_id, role_id) DO NOTHING
                `, [templateId, roleIdVal]);
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            template: result.rows[0],
            message: 'Template created successfully'
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Error creating template:', error);
        return NextResponse.json(
            { error: 'Failed to create template', details: error.message },
            { status: 500 }
        );
    } finally {
        if (client) await client.release();
    }
}

