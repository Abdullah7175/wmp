import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction, ENTITY_TYPES } from '@/lib/actionLogger';

export async function POST(request, { params }) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        const { user_ids, remarks } = body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 });
        }

        client = await connectToDatabase();
        await client.query('BEGIN');

        const fileRes = await client.query(`
            SELECT f.*, eu_from.department_id as from_department_id, eu_from.id as from_user_efiling_id
            FROM efiling_files f
            LEFT JOIN efiling_users eu_from ON eu_from.id = f.assigned_to
            WHERE f.id = $1
        `, [id]);
        if (fileRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const fileRow = fileRes.rows[0];

        try {
            await client.query(`
                UPDATE efiling_files 
                SET status_id = (
                    SELECT id FROM efiling_file_status WHERE code = 'IN_PROGRESS'
                ), updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND status_id = (
                    SELECT id FROM efiling_file_status WHERE code = 'DRAFT'
                )
                RETURNING id
            `, [id]);

            const movementPromises = user_ids.map(async (userId) => {
                const target = await client.query(`
                    SELECT eu.id, eu.department_id, eu.efiling_role_id, r.code as role_code
                    FROM efiling_users eu
                    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                    WHERE eu.id = $1
                `, [userId]);
                if (target.rows.length === 0) throw new Error('Target user not found');
                const t = target.rows[0];

                const actorRes = await client.query(`
                    SELECT eu.id, eu.department_id, r.code as role_code
                    FROM efiling_users eu
                    LEFT JOIN efiling_roles r ON r.id = eu.efiling_role_id
                    WHERE eu.id = $1
                `, [fileRow.assigned_to || fileRow.created_by]);
                const actor = actorRes.rows[0] || {};

                const allowedNext = {
                    XEN: ['SE'],
                    SE: ['CONSULTANT','CE'],
                    CONSULTANT: ['SE'],
                    CE: ['COO'],
                    COO: ['CEO'],
                    CEO: ['CE','PC'],
                    PC: ['IAO_II'],
                    IAO_II: ['COO'],
                    BUDGET: ['ADLFA'],
                    ADLFA: ['FINANCE'],
                    FINANCE: []
                };

                const fromRole = (actor.role_code || '').toUpperCase();
                const toRole = (t.role_code || '').toUpperCase();
                if (allowedNext[fromRole] && allowedNext[fromRole].length > 0) {
                    if (!allowedNext[fromRole].includes(toRole)) {
                        throw new Error(`Assignment not allowed: ${fromRole} → ${toRole}`);
                    }
                }

                if (fromRole === 'XEN' && toRole === 'SE') {
                    if (actor.department_id && t.department_id && actor.department_id !== t.department_id) {
                        throw new Error('XEN can assign only to SE within same department');
                    }
                }
                return await client.query(`
                    INSERT INTO efiling_file_movements (
                        file_id, from_user_id, to_user_id, action_type, remarks
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `, [id, fileRow.assigned_to || fileRow.created_by, userId, 'forward', remarks]);
            });

            const movements = await Promise.all(movementPromises);

            const newAssignee = user_ids[user_ids.length - 1];
            await client.query(`
                UPDATE efiling_files
                SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [newAssignee, id]);

            await client.query(`
                UPDATE efiling_file_workflows
                SET current_assignee_id = $1, updated_at = CURRENT_TIMESTAMP
                WHERE file_id = $2
            `, [newAssignee, id]);

            const lastTarget = await client.query(`
                SELECT eu.id, u.name as user_name, r.code as role_code
                FROM efiling_users eu
                LEFT JOIN users u ON eu.user_id = u.id
                LEFT JOIN efiling_roles r ON r.id = eu.efiling_role_id
                WHERE eu.id = $1
            `, [newAssignee]);
            let addHours = 0;
            const roleCode = lastTarget.rows[0]?.role_code || '';
            const assigneeDisplayName = lastTarget.rows[0]?.user_name || 'User';
            if (roleCode === 'SE') addHours = 0;
            else if (roleCode === 'CONSULTANT') addHours = 48;
            else if (roleCode === 'IAO_II') addHours = 24;
            else if (roleCode === 'PROCUREMENT_COMMITTEE') addHours = 7 * 24;
            if (addHours >= 0) {
                await client.query(`
                    UPDATE efiling_file_workflows
                    SET sla_deadline = NOW() + ($1 || ' hours')::interval
                    WHERE file_id = $2
                `, [addHours.toString(), id]);
            }

            // Notify new assignee
            try {
                await client.query(`
                    INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                    VALUES ($1, $2, $3, $4, 'normal', true, NOW())
                `, [newAssignee, id, 'file_assigned', `A file has been assigned to you: File ${id}`]);
            } catch (e) {
                console.warn('Notify assignee on forward failed', e);
            }

            // Notify creator that the file has been forwarded
            try {
                const meta = await client.query(`
                    SELECT f.created_by, u.name as assignee_name, r.code as assignee_role_code
                    FROM efiling_files f
                    LEFT JOIN efiling_users eu ON eu.id = $1
                    LEFT JOIN users u ON eu.user_id = u.id
                    LEFT JOIN efiling_roles r ON r.id = eu.efiling_role_id
                    WHERE f.id = $2
            `, [newAssignee, id]);
                const createdBy = meta.rows[0]?.created_by;
                const assigneeName = meta.rows[0]?.assignee_name || assigneeDisplayName;
                const assigneeRole = (meta.rows[0]?.assignee_role_code || '').toUpperCase();

                const actorId = fileRow.assigned_to || fileRow.created_by;
                if (createdBy && createdBy !== actorId) {
                await client.query(`
                        INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                        VALUES ($1, $2, $3, $4, 'low', false, NOW())
                    `, [createdBy, id, 'file_forwarded', `Your file has been forwarded to ${assigneeName} (${assigneeRole})`]);
                }
            } catch (e) {
                console.warn('Notify creator on forward failed', e);
            }

            await client.query('COMMIT');

            await logAction(request, 'MARK_TO', ENTITY_TYPES.EFILING_FILE, {
                entityId: id,
                entityName: `File ${id}`,
                details: { user_ids, remarks, movements_created: movements.length }
            });

            return NextResponse.json({ 
                message: `File marked to ${user_ids.length} user(s) successfully`,
                movements: movements.map((m) => m.rows[0])
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}

export async function GET(request, { params }) {
    let client;
    try {
        const { id } = await params;
        client = await connectToDatabase();
        const result = await client.query(`
            SELECT 
                fm.*,
                u1.name as from_user_name,
                u2.name as to_user_name,
                d1.name as from_department_name,
                d2.name as to_department_name
            FROM efiling_file_movements fm
            LEFT JOIN efiling_users eu1 ON fm.from_user_id = eu1.id
            LEFT JOIN users u1 ON eu1.user_id = u1.id
            LEFT JOIN efiling_users eu2 ON fm.to_user_id = eu2.id
            LEFT JOIN users u2 ON eu2.user_id = u2.id
            LEFT JOIN efiling_departments d1 ON fm.from_department_id = d1.id
            LEFT JOIN efiling_departments d2 ON fm.to_department_id = d2.id
            WHERE fm.file_id = $1
            ORDER BY fm.created_at DESC
        `, [id]);
        return NextResponse.json({ file_id: id, movements: result.rows });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
