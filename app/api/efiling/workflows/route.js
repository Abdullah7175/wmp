import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ENTITY_TYPES, EFILING_ACTION_TYPES } from '@/lib/efilingActionLogger';
import { eFileSecurityManager, validateEFileAccess, checkEFileRateLimit } from '@/lib/efilingSecurity';

export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const departmentId = searchParams.get('departmentId');
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
        const accessValidation = await validateEFileAccess(userId, 'workflow', null, 'VIEW_WORKFLOWS');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();
        
        let query = `
            SELECT 
                wf.*,
                f.file_number,
                f.subject,
                f.priority,
                f.confidentiality_level,
                wt.name as template_name,
                wt.description as template_description,
                cs.stage_name as current_stage_name,
                cs.stage_code as current_stage_code,
                usr.name as assigned_user_name,
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
            LEFT JOIN users usr ON u.user_id = usr.id
            LEFT JOIN efiling_departments d ON u.department_id = d.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (userId) {
            query += ` AND (wf.current_assignee_id = $${paramCount} OR wf.created_by = $${paramCount})`;
            params.push(userId);
            paramCount++;
        }

        if (status) {
            query += ` AND wf.workflow_status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (departmentId) {
            query += ` AND u.department_id = $${paramCount}`;
            params.push(departmentId);
            paramCount++;
        }

        query += ` ORDER BY 
            CASE WHEN wf.sla_breached THEN 1 ELSE 0 END DESC,
            wf.sla_deadline ASC,
            wf.created_at DESC`;

        const result = await client.query(query, params);
        
        // Log the action
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_WORKFLOW,
            entityId: null,
            action: EFILING_ACTION_TYPES.WORKFLOW_VIEWED,
            userId: userId || 'anonymous',
            details: { status, departmentId, count: result.rows.length },
            ipAddress
        });

        return NextResponse.json({
            success: true,
            workflows: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Error fetching workflows:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workflows' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function POST(request) {
    let client;
    try {
        const body = await request.json();
        const { 
            fileId, 
            templateId, 
            createdBy, 
            currentAssigneeId,
            ipAddress,
            userAgent 
        } = body;

        // Input validation and sanitization
        if (!fileId || !templateId || !createdBy) {
            return NextResponse.json(
                { error: 'File ID, template ID, and creator are required' },
                { status: 400 }
            );
        }

        // Rate limiting
        const rateLimit = checkEFileRateLimit(createdBy, 'workflow_action', createdBy);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // Validate access
        const accessValidation = await validateEFileAccess(createdBy, 'workflow', null, 'CREATE_WORKFLOW');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();

        // Check if workflow already exists for this file
        const existingWorkflow = await client.query(`
            SELECT id FROM efiling_file_workflows WHERE file_id = $1
        `, [fileId]);

        if (existingWorkflow.rows.length > 0) {
            return NextResponse.json(
                { error: 'Workflow already exists for this file' },
                { status: 409 }
            );
        }

        // Get template stages to set initial stage
        const templateStages = await client.query(`
            SELECT id, stage_name, stage_code 
            FROM efiling_workflow_stages 
            WHERE template_id = $1 AND stage_order = 1
            ORDER BY stage_order ASC
        `, [templateId]);

        if (templateStages.rows.length === 0) {
            return NextResponse.json(
                { error: 'No stages found for workflow template' },
                { status: 400 }
            );
        }

        const initialStage = templateStages.rows[0];

        // Create workflow
        const workflowResult = await client.query(`
            INSERT INTO efiling_file_workflows (
                file_id, template_id, current_stage_id, workflow_status,
                started_at, current_assignee_id, sla_deadline, created_by, created_at
            ) VALUES ($1, $2, $3, 'IN_PROGRESS', NOW(), $4, 
                NOW() + INTERVAL '24 hours', $5, NOW())
            RETURNING *
        `, [
            fileId,
            templateId,
            initialStage.id,
            currentAssigneeId || createdBy,
            createdBy
        ]);

        const workflow = workflowResult.rows[0];

        // Create initial stage instance
        await client.query(`
            INSERT INTO efiling_workflow_stage_instances (
                workflow_id, stage_id, stage_status, assigned_to, started_at, created_at
            ) VALUES ($1, $2, 'IN_PROGRESS', $3, NOW(), NOW())
        `, [
            workflow.id,
            initialStage.id,
            currentAssigneeId || createdBy
        ]);

        // Update file with workflow information
        await client.query(`
            UPDATE efiling_files 
            SET workflow_id = $1, current_stage_id = $2, updated_at = NOW()
            WHERE id = $1
        `, [workflow.id, initialStage.id]);

        // Log the workflow creation
        await eFileActionLogger.logWorkflowAction({
            workflowId: workflow.id,
            stageId: initialStage.id,
            action: EFILING_ACTION_TYPES.WORKFLOW_STARTED,
            userId: createdBy,
            details: {
                fileId,
                templateId,
                initialStage: initialStage.stage_name,
                currentAssignee: currentAssigneeId || createdBy
            },
            ipAddress,
            userAgent
        });

        return NextResponse.json({
            success: true,
            workflow: {
                id: workflow.id,
                fileId: workflow.file_id,
                templateId: workflow.template_id,
                currentStage: {
                    id: initialStage.id,
                    name: initialStage.stage_name,
                    code: initialStage.stage_code
                },
                status: workflow.workflow_status,
                currentAssignee: currentAssigneeId || createdBy,
                slaDeadline: workflow.sla_deadline,
                createdAt: workflow.created_at
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating workflow:', error);
        return NextResponse.json(
            { error: 'Failed to create workflow' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
