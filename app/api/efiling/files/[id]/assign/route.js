import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger } from '@/lib/efilingActionLogger';
import { getToken } from 'next-auth/jwt';

export async function POST(request, { params }) {
    let client;
    try {
        client = await connectToDatabase();
        const { id } = params; // file id
        const body = await request.json();
        const { to_user_id, remarks } = body;

        // Actor identity from session token
        const token = await getToken({ req: { headers: Object.fromEntries(request.headers) }, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!id || !to_user_id) {
            return NextResponse.json({ error: 'file id and to_user_id are required' }, { status: 400 });
        }

        // Load file
        const fileRes = await client.query('SELECT * FROM efiling_files WHERE id = $1', [id]);
        if (fileRes.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        const file = fileRes.rows[0];

        // Load current user (from) and target user (to)
        const fromRes = await client.query('SELECT id, department_id, efiling_role_id, is_consultant FROM efiling_users WHERE user_id = $1 AND is_active = true', [token.user.id]);
        if (fromRes.rows.length === 0) {
            return NextResponse.json({ error: 'Current user not active in e-filing' }, { status: 403 });
        }
        const fromUser = fromRes.rows[0];

        const toRes = await client.query('SELECT id, department_id, efiling_role_id, is_consultant FROM efiling_users WHERE id = $1 AND is_active = true', [to_user_id]);
        if (toRes.rows.length === 0) {
            return NextResponse.json({ error: 'Target user not found or inactive' }, { status: 404 });
        }
        const toUser = toRes.rows[0];

        // Determine role codes for from/to users
        const [fromRoleRes, toRoleRes] = await Promise.all([
            client.query(`SELECT r.code FROM efiling_roles r JOIN efiling_users eu ON eu.efiling_role_id = r.id WHERE eu.id = $1`, [fromUser.id]),
            client.query(`SELECT r.code FROM efiling_roles r JOIN efiling_users eu ON eu.efiling_role_id = r.id WHERE eu.id = $1`, [toUser.id])
        ]);
        const fromRoleCode = fromRoleRes.rows[0]?.code || '';
        const toRoleCode = toRoleRes.rows[0]?.code || '';

        // Get current workflow and stage
        const wfRes = await client.query('SELECT id, current_stage_id, template_id FROM efiling_file_workflows WHERE file_id = $1', [id]);
        if (wfRes.rows.length === 0) {
            return NextResponse.json({ error: 'Workflow not initialized for this file' }, { status: 400 });
        }
        const workflow = wfRes.rows[0];

        // Verify actor belongs to current stage role group (if set)
        const curStageRes = await client.query(`
            SELECT ws.id, ws.role_group_id, rg.role_codes
            FROM efiling_workflow_stages ws
            LEFT JOIN efiling_role_groups rg ON rg.id = ws.role_group_id
            WHERE ws.id = $1
        `, [workflow.current_stage_id]);
        if (curStageRes.rows.length === 0) {
            return NextResponse.json({ error: 'Current workflow stage not found' }, { status: 400 });
        }
        const curStage = curStageRes.rows[0];

        const matchesAny = (roleCode, codes) => {
            if (!roleCode) return false;
            let list = codes;
            if (!Array.isArray(list)) {
                try { list = JSON.parse(codes || '[]'); } catch { list = []; }
            }
            return list.some((p) => {
                if (typeof p !== 'string') p = String(p);
                if (p.endsWith('*')) return roleCode.toUpperCase().startsWith(p.slice(0, -1).toUpperCase());
                if (p.length <= 4) return roleCode.toUpperCase().includes(p.toUpperCase());
                return roleCode.toUpperCase() === p.toUpperCase();
            });
        };

        if (curStage.role_group_id && !matchesAny(fromRoleCode, curStage.role_codes)) {
            return NextResponse.json({ error: 'You are not permitted to act at this stage' }, { status: 403 });
        }

        // Resolve next stage by transition and target user role group match
        const transRes = await client.query(`
            SELECT st.to_stage_id, ws.sla_hours, ws.role_group_id, rg.role_codes
            FROM efiling_stage_transitions st
            JOIN efiling_workflow_stages ws ON ws.id = st.to_stage_id
            LEFT JOIN efiling_role_groups rg ON rg.id = ws.role_group_id
            WHERE st.from_stage_id = $1 AND st.is_active = true
            ORDER BY ws.stage_order ASC
        `, [workflow.current_stage_id]);

        if (transRes.rows.length === 0) {
            return NextResponse.json({ error: 'No allowed transitions from current stage' }, { status: 400 });
        }

        const candidate = transRes.rows.find(row => !row.role_group_id || matchesAny(toRoleCode, row.role_codes));
        if (!candidate) {
            return NextResponse.json({ error: 'Target user does not match any allowed next stage group' }, { status: 403 });
        }

        // Compute new SLA deadline from target stage
        let slaDeadline = null;
        if (candidate.sla_hours !== null && candidate.sla_hours !== undefined) {
            const d = new Date();
            d.setHours(d.getHours() + Number(candidate.sla_hours));
            slaDeadline = d.toISOString();
        }

        // Begin transaction
        await client.query('BEGIN');

        // Update file and workflow
        await client.query(`
            UPDATE efiling_files 
            SET assigned_to = $1, updated_at = NOW(), sla_deadline = $2, sla_breached = false
            WHERE id = $3
        `, [toUser.id, slaDeadline, id]);

        // Update workflow stage and assignee
        await client.query(`
            UPDATE efiling_file_workflows 
            SET current_assignee_id = $1, current_stage_id = $2, updated_at = NOW(), sla_deadline = $3, sla_breached = false
            WHERE file_id = $4
        `, [toUser.id, candidate.to_stage_id, slaDeadline, id]);

        // Log movement
        await client.query(`
            INSERT INTO efiling_file_movements (file_id, from_user_id, to_user_id, from_department_id, to_department_id, action_type, remarks, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [id, fromUser.id, toUser.id, fromUser.department_id, toUser.department_id, 'ASSIGNED', remarks || null]);

        // Log workflow action
        await client.query(`
            INSERT INTO efiling_workflow_actions (workflow_id, from_stage_id, to_stage_id, action_type, action_data, performed_by, performed_at, sla_breached)
            VALUES ((SELECT id FROM efiling_file_workflows WHERE file_id = $1), $2, $3, $4, $5, $6, NOW(), false)
        `, [id, workflow.current_stage_id, candidate.to_stage_id, 'FORWARD', JSON.stringify({ to_user_id, remarks, sla_deadline: slaDeadline }), fromUser.id]);

        // Notification to new assignee
        await client.query(`
            INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
            VALUES ($1, $2, $3, $4, 'normal', true, NOW())
        `, [toUser.id, id, 'file_assigned', `A file has been assigned to you by user ${fromUser.id}`]);

        // Notify creator as well about current assignment
        try {
            const creatorRes = await client.query('SELECT created_by FROM efiling_files WHERE id = $1', [id]);
            const creatorEUserId = creatorRes.rows[0]?.created_by;
            if (creatorEUserId && creatorEUserId !== toUser.id) {
                await client.query(`
                    INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                    VALUES ($1, $2, $3, $4, 'low', false, NOW())
                `, [creatorEUserId, id, 'workflow_action', `File is now marked to user ${toUser.id}`, ]);
            }
        } catch (e) {
            console.warn('Creator notify failed', e);
        }

        await client.query('COMMIT');

        // High-level logging
        try {
            await eFileActionLogger.logAction({
                entityType: 'efiling_file',
                entityId: id.toString(),
                action: 'FILE_FORWARDED',
                userId: fromUser.id.toString(),
                details: { to_user_id, sla_deadline: slaDeadline, remarks }
            });
        } catch {}

        return NextResponse.json({ success: true, sla_deadline: slaDeadline });
    } catch (error) {
        if (client) {
            try { await client.query('ROLLBACK'); } catch {}
        }
        console.error('Assign error:', error);
        return NextResponse.json({ error: 'Failed to assign file' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
