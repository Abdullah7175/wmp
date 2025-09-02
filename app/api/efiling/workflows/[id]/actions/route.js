import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES } from '@/lib/efilingActionLogger';
import { validateEFileAccess, checkEFileRateLimit } from '@/lib/efilingSecurity';

export async function POST(request, { params }) {
    let client;
    try {
        const { id: workflowId } = await params;
        const body = await request.json();
        const { 
            actionType, 
            userId, 
            stageId, 
            details = {}, 
            ipAddress, 
            userAgent 
        } = body;

        // Input validation
        if (!actionType || !userId || !stageId) {
            return NextResponse.json(
                { error: 'Action type, user ID, and stage ID are required' },
                { status: 400 }
            );
        }

        // Rate limiting
        const rateLimit = checkEFileRateLimit(userId, 'workflow_action', userId);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        // Validate access
        const accessValidation = await validateEFileAccess(userId, 'workflow', workflowId, 'PERFORM_WORKFLOW_ACTION');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();

        // Get workflow and stage information
        const workflowResult = await client.query(`
            SELECT wf.*, f.file_number, f.subject, f.id as file_id
            FROM efiling_file_workflows wf
            LEFT JOIN efiling_files f ON wf.file_id = f.id
            WHERE wf.id = $1
        `, [workflowId]);

        if (workflowResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Workflow not found' },
                { status: 404 }
            );
        }

        const workflow = workflowResult.rows[0];

        // Get stage information
        const stageResult = await client.query(`
            SELECT * FROM efiling_workflow_stages WHERE id = $1
        `, [stageId]);

        if (stageResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Stage not found' },
                { status: 404 }
            );
        }

        const stage = stageResult.rows[0];

        // Perform the action based on action type
        let result;
        let nextStageId = null;
        let workflowStatus = workflow.workflow_status;

        switch (actionType) {
            case 'APPROVE':
                result = await handleApproval(client, workflowId, stageId, userId, details);
                nextStageId = await getNextStage(client, workflow.template_id, stage.stage_order);
                break;
                
            case 'REJECT':
                result = await handleRejection(client, workflowId, stageId, userId, details);
                break;
                
            case 'FORWARD':
                result = await handleForward(client, workflowId, stageId, userId, details);
                nextStageId = await getNextStage(client, workflow.template_id, stage.stage_order);
                break;
                
            case 'RETURN':
                result = await handleReturn(client, workflowId, stageId, userId, details);
                break;
                
            case 'ESCALATE':
                result = await handleEscalation(client, workflowId, stageId, userId, details);
                break;
                
            default:
                return NextResponse.json(
                    { error: 'Invalid action type' },
                    { status: 400 }
                );
        }

        // Update workflow if moving to next stage
        if (nextStageId) {
            await client.query(`
                UPDATE efiling_file_workflows 
                SET current_stage_id = $1, current_assignee_id = $2, updated_at = NOW()
                WHERE id = $3
            `, [nextStageId, details.nextAssignee || userId, workflowId]);

            // Create new stage instance
            await client.query(`
                INSERT INTO efiling_workflow_stage_instances (
                    workflow_id, stage_id, stage_status, assigned_to, started_at, created_at
                ) VALUES ($1, $2, 'IN_PROGRESS', $3, NOW(), NOW())
            `, [workflowId, nextStageId, details.nextAssignee || userId]);

            // Update file current stage
            await client.query(`
                UPDATE efiling_files 
                SET current_stage_id = $1, updated_at = NOW()
                WHERE id = $2
            `, [nextStageId, workflow.file_id]);
        }

        // Log the workflow action
        await eFileActionLogger.logWorkflowAction({
            workflowId,
            stageId,
            action: actionType,
            userId,
            details: {
                ...details,
                result,
                nextStageId,
                workflowStatus
            },
            ipAddress,
            userAgent
        });

        return NextResponse.json({
            success: true,
            action: {
                type: actionType,
                result,
                nextStageId,
                workflowStatus
            }
        });

    } catch (error) {
        console.error('Error performing workflow action:', error);
        return NextResponse.json(
            { error: 'Failed to perform workflow action' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

// Helper functions for different action types
async function handleApproval(client, workflowId, stageId, userId, details) {
    // Complete current stage
    await client.query(`
        UPDATE efiling_workflow_stage_instances 
        SET stage_status = 'COMPLETED', completed_at = NOW()
        WHERE workflow_id = $1 AND stage_id = $2
    `, [workflowId, stageId]);

    // Log approval
    await client.query(`
        INSERT INTO efiling_workflow_actions (
            workflow_id, stage_instance_id, action_type, action_data, 
            performed_by, performed_at
        ) VALUES ($1, $2, 'APPROVE', $3, $4, NOW())
    `, [workflowId, stageId, JSON.stringify(details), userId]);

    return { status: 'approved', message: 'Stage approved successfully' };
}

async function handleRejection(client, workflowId, stageId, userId, details) {
    // Mark stage as rejected
    await client.query(`
        UPDATE efiling_workflow_stage_instances 
        SET stage_status = 'REJECTED', completed_at = NOW()
        WHERE workflow_id = $1 AND stage_id = $2
    `, [workflowId, stageId]);

    // Log rejection
    await client.query(`
        INSERT INTO efiling_workflow_actions (
            workflow_id, stage_instance_id, action_type, action_data, 
            performed_by, performed_at
        ) VALUES ($1, $2, 'REJECT', $3, $4, NOW())
    `, [workflowId, stageId, JSON.stringify(details), userId]);

    return { status: 'rejected', message: 'Stage rejected', reason: details.reason };
}

async function handleForward(client, workflowId, stageId, userId, details) {
    // Complete current stage
    await client.query(`
        UPDATE efiling_workflow_stage_instances 
        SET stage_status = 'COMPLETED', completed_at = NOW()
        WHERE workflow_id = $1 AND stage_id = $2
    `, [workflowId, stageId]);

    // Log forward action
    await client.query(`
        INSERT INTO efiling_workflow_actions (
            workflow_id, stage_instance_id, action_type, action_data, 
            performed_by, performed_at
        ) VALUES ($1, $2, 'FORWARD', $3, $4, NOW())
    `, [workflowId, stageId, JSON.stringify(details), userId]);

    return { status: 'forwarded', message: 'Stage forwarded to next level' };
}

async function handleReturn(client, workflowId, stageId, userId, details) {
    // Mark stage as returned
    await client.query(`
        UPDATE efiling_workflow_stage_instances 
        SET stage_status = 'RETURNED', completed_at = NOW()
        WHERE workflow_id = $1 AND stage_id = $2
    `, [workflowId, stageId]);

    // Log return action
    await client.query(`
        INSERT INTO efiling_workflow_actions (
            workflow_id, stage_instance_id, action_type, action_data, 
            performed_by, performed_at
        ) VALUES ($1, $2, 'RETURN', $3, $4, NOW())
    `, [workflowId, stageId, JSON.stringify(details), userId]);

    return { status: 'returned', message: 'Stage returned for revision', reason: details.reason };
}

async function handleEscalation(client, workflowId, stageId, userId, details) {
    // Mark stage as escalated
    await client.query(`
        UPDATE efiling_workflow_stage_instances 
        SET stage_status = 'ESCALATED', completed_at = NOW()
        WHERE workflow_id = $1 AND stage_id = $2
    `, [workflowId, stageId]);

    // Log escalation
    await client.query(`
        INSERT INTO efiling_workflow_actions (
            workflow_id, stage_instance_id, action_type, action_data, 
            performed_by, performed_at
        ) VALUES ($1, $2, 'ESCALATE', $3, $4, NOW())
    `, [workflowId, stageId, JSON.stringify(details), userId]);

    return { status: 'escalated', message: 'Stage escalated', reason: details.reason };
}

async function getNextStage(client, templateId, currentStageOrder) {
    const nextStageResult = await client.query(`
        SELECT id, stage_name, stage_code 
        FROM efiling_workflow_stages 
        WHERE template_id = $1 AND stage_order = $2
    `, [templateId, currentStageOrder + 1]);

    if (nextStageResult.rows.length === 0) {
        // No next stage - workflow completed
        return null;
    }

    return nextStageResult.rows[0].id;
}
