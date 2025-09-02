import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction, ENTITY_TYPES } from '@/lib/actionLogger';

export async function POST(request, { params }) {
    const client = await connectToDatabase();
    
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, userId, remarks } = body;

        // Start transaction
        await client.query('BEGIN');

        // Get file details with workflow information
        const fileQuery = await client.query(`
            SELECT f.*, wf.current_stage_id, wt.id as template_id
            FROM efiling_files f
            LEFT JOIN efiling_file_workflows wf ON f.workflow_id = wf.id
            LEFT JOIN efiling_workflow_templates wt ON f.workflow_id = wt.id
            WHERE f.id = $1
        `, [id]);

        if (fileQuery.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const file = fileQuery.rows[0];
        
        if (!file.workflow_id) {
            return NextResponse.json({ error: 'File is not connected to any workflow' }, { status: 400 });
        }

        // Get current stage details
        const currentStageQuery = await client.query(`
            SELECT ws.*, d.name as department_name, r.name as role_name
            FROM efiling_workflow_stages ws
            LEFT JOIN efiling_departments d ON ws.department_id = d.id
            LEFT JOIN efiling_roles r ON ws.role_id = r.id
            WHERE ws.id = $1
        `, [file.current_stage_id]);

        if (currentStageQuery.rows.length === 0) {
            return NextResponse.json({ error: 'Current workflow stage not found' }, { status: 404 });
        }

        const currentStage = currentStageQuery.rows[0];

        // Get next stage based on action
        let nextStageId = null;
        let nextStage = null;

        if (action === 'APPROVE' || action === 'FORWARD') {
            // Get next stage in sequence
            const nextStageQuery = await client.query(`
                SELECT ws.*, d.name as department_name, r.name as role_name
                FROM efiling_workflow_stages ws
                WHERE ws.template_id = $1 AND ws.stage_order > $2
                ORDER BY ws.stage_order ASC
                LIMIT 1
            `, [file.template_id, currentStage.stage_order]);

            if (nextStageQuery.rows.length > 0) {
                nextStage = nextStageQuery.rows[0];
                nextStageId = nextStage.id;
            }
        } else if (action === 'REJECT' || action === 'RETURN') {
            // Get previous stage or stay in current stage
            const prevStageQuery = await client.query(`
                SELECT ws.*, d.name as department_name, r.name as role_name
                FROM efiling_workflow_stages ws
                WHERE ws.template_id = $1 AND ws.stage_order < $2
                ORDER BY ws.stage_order DESC
                LIMIT 1
            `, [file.template_id, currentStage.stage_order]);

            if (prevStageQuery.rows.length > 0) {
                nextStage = prevStageQuery.rows[0];
                nextStageId = nextStage.id;
            }
        }

        // Update workflow stage
        if (nextStageId) {
            await client.query(`
                UPDATE efiling_file_workflows 
                SET current_stage_id = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [nextStageId, file.workflow_id]);

            // Update file current stage
            await client.query(`
                UPDATE efiling_files 
                SET current_stage_id = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [nextStageId, file.id]);
        }

        // Create workflow action record
        await client.query(`
            INSERT INTO efiling_workflow_actions (
                workflow_id, stage_instance_id, from_stage_id, to_stage_id,
                action_type, action_data, performed_by, performed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `, [
            file.workflow_id,
            file.current_stage_id,
            file.current_stage_id,
            nextStageId,
            action,
            JSON.stringify({ remarks, nextStage: nextStage?.stage_name }),
            userId
        ]);

        // Create file movement record
        await client.query(`
            INSERT INTO efiling_file_movements (
                file_id, from_user_id, to_user_id, action_type, remarks, workflow_action_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            file.id,
            userId,
            nextStage?.role_id ? null : userId, // If next stage has specific role, mark as unassigned
            action,
            remarks,
            file.workflow_id
        ]);

        // Commit transaction
        await client.query('COMMIT');

        // Log the action
        await logAction(request, 'WORKFLOW_PROGRESS', ENTITY_TYPES.EFILING_FILE, {
            entityId: file.id,
            entityName: file.file_number,
            details: { 
                action, 
                fromStage: currentStage.stage_name,
                toStage: nextStage?.stage_name || 'No change',
                remarks 
            }
        });

        return NextResponse.json({ 
            message: `File workflow progressed successfully`,
            action: action,
            fromStage: currentStage.stage_name,
            toStage: nextStage?.stage_name || 'No change',
            nextStageId
        });

    } catch (error) {
        // Rollback transaction on error
        if (client) {
            await client.query('ROLLBACK');
        }
        
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function GET(request, { params }) {
    const client = await connectToDatabase();
    
    try {
        const { id } = await params;

        // Get file workflow status
        const result = await client.query(`
            SELECT 
                f.id, f.file_number, f.subject,
                wf.current_stage_id, wf.workflow_status,
                ws.stage_name, ws.stage_order, ws.description,
                d.name as department_name, r.name as role_name,
                wt.name as workflow_template_name
            FROM efiling_files f
            LEFT JOIN efiling_file_workflows wf ON f.workflow_id = wf.id
            LEFT JOIN efiling_workflow_stages ws ON wf.current_stage_id = ws.id
            LEFT JOIN efiling_departments d ON ws.department_id = d.id
            LEFT JOIN efiling_roles r ON ws.role_id = r.id
            LEFT JOIN efiling_workflow_templates wt ON f.workflow_id = wt.id
            WHERE f.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) {
            await client.release();
        }
    }
}
