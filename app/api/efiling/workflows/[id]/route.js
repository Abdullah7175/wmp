import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ENTITY_TYPES, EFILING_ACTION_TYPES } from '@/lib/efilingActionLogger';
import { validateEFileAccess, checkEFileRateLimit } from '@/lib/efilingSecurity';

export async function GET(request, { params }) {
    let client;
    try {
        const { id: workflowId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');

        // Rate limiting
        const rateLimit = checkEFileRateLimit(userId || 'anonymous', 'api', userId);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // Validate access
        const accessValidation = await validateEFileAccess(userId, 'workflow', workflowId, 'VIEW_WORKFLOW');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();

        // Get workflow details with file and template information
        const workflowResult = await client.query(`
            SELECT 
                wf.*,
                f.file_number,
                f.subject,
                f.description as file_description,
                f.priority,
                f.confidentiality_level,
                f.created_at as file_created_at,
                wt.name as template_name,
                wt.description as template_description,
                cs.stage_name as current_stage_name,
                cs.stage_code as current_stage_code,
                cs.stage_order as current_stage_order,
                u.name as assigned_user_name,
                u.designation as assigned_user_designation,
                d.name as department_name,
                CASE 
                    WHEN wf.sla_deadline < NOW() AND wf.workflow_status = 'IN_PROGRESS' 
                    THEN true 
                    ELSE false 
                END as sla_breached
            FROM efiling_file_workflows wf
            LEFT JOIN efiling_files f ON wf.file_id = f.id
            LEFT JOIN efiling_workflow_templates wt ON wf.template_id = wt.id
            LEFT JOIN efiling_workflow_stages cs ON wf.current_stage_id = cs.id
            LEFT JOIN efiling_users u ON wf.current_assignee_id = u.id
            LEFT JOIN efiling_departments d ON u.department_id = d.id
            WHERE wf.id = $1
        `, [workflowId]);

        if (workflowResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Workflow not found' },
                { status: 404 }
            );
        }

        const workflow = workflowResult.rows[0];

        // Get all stages for this template
        const stagesResult = await client.query(`
            SELECT 
                ws.*,
                d.name as department_name,
                r.name as role_name
            FROM efiling_workflow_stages ws
            LEFT JOIN efiling_departments d ON ws.department_id = d.id
            LEFT JOIN efiling_roles r ON ws.role_id = r.id
            WHERE ws.template_id = $1
            ORDER BY ws.stage_order ASC
        `, [workflow.template_id]);

        // Get stage instances for this workflow
        const stageInstancesResult = await client.query(`
            SELECT 
                wsi.*,
                ws.stage_name,
                ws.stage_code,
                ws.stage_order,
                u.name as user_name,
                u.designation as user_designation
            FROM efiling_workflow_stage_instances wsi
            LEFT JOIN efiling_workflow_stages ws ON wsi.stage_id = ws.id
            LEFT JOIN efiling_users u ON wsi.assigned_to = u.id
            WHERE wsi.workflow_id = $1
            ORDER BY ws.stage_order ASC
        `, [workflowId]);

        // Get workflow actions history
        const actionsResult = await client.query(`
            SELECT 
                wa.*,
                u.name as user_name,
                u.designation as user_designation
            FROM efiling_workflow_actions wa
            LEFT JOIN efiling_users u ON wa.performed_by = u.id
            WHERE wa.workflow_id = $1
            ORDER BY wa.performed_at DESC
            LIMIT 50
        `, [workflowId]);

        // Log the action
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_WORKFLOW,
            entityId: workflowId,
            action: EFILING_ACTION_TYPES.WORKFLOW_VIEWED,
            userId: userId || 'anonymous',
            details: { workflowId },
            ipAddress
        });

        return NextResponse.json({
            success: true,
            workflow: {
                ...workflow,
                stages: stagesResult.rows,
                stageInstances: stageInstancesResult.rows,
                actions: actionsResult.rows
            }
        });

    } catch (error) {
        console.error('Error fetching workflow details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workflow details' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
