import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES } from '@/lib/efilingActionLogger';
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
        const accessValidation = await validateEFileAccess(userId, 'workflow', workflowId, 'VIEW_WORKFLOW_STAGES');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();

        // Get stage instances for this workflow
        const result = await client.query(`
            SELECT 
                wsi.*,
                ws.stage_name,
                ws.stage_code,
                ws.stage_order,
                ws.sla_hours,
                ws.can_attach_files,
                ws.can_comment,
                ws.can_escalate,
                u.name as user_name,
                u.designation as user_designation,
                d.name as department_name
            FROM efiling_workflow_stage_instances wsi
            LEFT JOIN efiling_workflow_stages ws ON wsi.stage_id = ws.id
            LEFT JOIN efiling_users u ON wsi.assigned_to = u.id
            LEFT JOIN efiling_departments d ON u.department_id = d.id
            WHERE wsi.workflow_id = $1
            ORDER BY ws.stage_order ASC
        `, [workflowId]);

        // Log the action
        await eFileActionLogger.logAction({
            entityType: 'WORKFLOW_STAGE',
            entityId: workflowId,
            action: 'WORKFLOW_STAGES_VIEWED',
            userId: userId || 'anonymous',
            details: { workflowId, stageCount: result.rows.length },
            ipAddress
        });

        return NextResponse.json({
            success: true,
            stages: result.rows
        });

    } catch (error) {
        console.error('Error fetching workflow stages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workflow stages' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function POST(request, { params }) {
    let client;
    try {
        const { id: workflowId } = await params;
        const body = await request.json();
        const { 
            stageId, 
            assignedTo, 
            remarks, 
            userId, 
            ipAddress, 
            userAgent 
        } = body;

        // Input validation
        if (!stageId || !assignedTo || !userId) {
            return NextResponse.json(
                { error: 'Stage ID, assigned user, and user ID are required' },
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
        const accessValidation = await validateEFileAccess(userId, 'workflow', workflowId, 'MANAGE_WORKFLOW_STAGES');
        if (!accessValidation.allowed) {
            return NextResponse.json(
                { error: accessValidation.reason },
                { status: 403 }
            );
        }

        client = await connectToDatabase();

        // Check if stage instance already exists
        const existingStage = await client.query(`
            SELECT id FROM efiling_workflow_stage_instances 
            WHERE workflow_id = $1 AND stage_id = $2
        `, [workflowId, stageId]);

        if (existingStage.rows.length > 0) {
            return NextResponse.json(
                { error: 'Stage instance already exists for this workflow' },
                { status: 409 }
            );
        }

        // Create stage instance
        const result = await client.query(`
            INSERT INTO efiling_workflow_stage_instances (
                workflow_id, stage_id, stage_status, assigned_to, 
                started_at, remarks, created_at
            ) VALUES ($1, $2, 'IN_PROGRESS', $3, NOW(), $4, NOW())
            RETURNING *
        `, [workflowId, stageId, assignedTo, remarks]);

        // Log the action
        await eFileActionLogger.logAction({
            entityType: 'WORKFLOW_STAGE',
            entityId: workflowId,
            action: 'WORKFLOW_STAGE_CREATED',
            userId,
            details: {
                workflowId,
                stageId,
                assignedTo,
                remarks
            },
            ipAddress,
            userAgent
        });

        return NextResponse.json({
            success: true,
            stageInstance: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating workflow stage instance:', error);
        return NextResponse.json(
            { error: 'Failed to create workflow stage instance' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
