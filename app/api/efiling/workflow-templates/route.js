import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ENTITY_TYPES, EFILING_ACTION_TYPES } from '@/lib/efilingActionLogger';
import { getToken } from 'next-auth/jwt';

export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const fileTypeId = searchParams.get('fileTypeId');
        const isActive = searchParams.get('is_active');
        const userId = searchParams.get('userId');
        
        client = await connectToDatabase();
        
        if (id) {
            // Fetch single template with stages
            const templateResult = await client.query(`
                SELECT 
                    wt.*,
                    ft.name as file_type_name,
                    ft.description as file_type_description
                FROM efiling_workflow_templates wt
                LEFT JOIN efiling_file_types ft ON wt.file_type_id = ft.id
                WHERE wt.id = $1
            `, [id]);

            if (templateResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Workflow template not found' },
                    { status: 404 }
                );
            }

            const template = templateResult.rows[0];

            // Get stages for this template
            const stagesResult = await client.query(`
                SELECT 
                    ws.*,
                    d.name as department_name,
                    r.name as role_name,
                    rg.name as role_group_name,
                    rg.code as role_group_code,
                    rg.role_codes as role_group_codes
                FROM efiling_workflow_stages ws
                LEFT JOIN efiling_departments d ON ws.department_id = d.id
                LEFT JOIN efiling_roles r ON ws.role_id = r.id
                LEFT JOIN efiling_role_groups rg ON ws.role_group_id = rg.id
                WHERE ws.template_id = $1
                ORDER BY ws.stage_order ASC
            `, [id]);

            template.stages = stagesResult.rows;

            return NextResponse.json(template);

        } else {
            // Fetch all templates
            let query = `
                SELECT 
                    wt.*,
                    ft.name as file_type_name,
                    ft.code as file_type_code,
                    COUNT(ws.id) as stage_count
                FROM efiling_workflow_templates wt
                LEFT JOIN efiling_file_types ft ON wt.file_type_id = ft.id
                LEFT JOIN efiling_workflow_stages ws ON wt.id = ws.template_id
                WHERE 1=1
            `;
            
            const params = [];
            let paramCount = 1;

            if (fileTypeId) {
                query += ` AND wt.file_type_id = $${paramCount}`;
                params.push(fileTypeId);
                paramCount++;
            }

            if (isActive !== null) {
                query += ` AND wt.is_active = $${paramCount}`;
                params.push(isActive === 'true');
                paramCount++;
            }

            query += ` GROUP BY wt.id, ft.name, ft.code ORDER BY wt.name ASC`;

            const result = await client.query(query, params);

            return NextResponse.json({
                success: true,
                templates: result.rows
            });
        }

    } catch (error) {
        console.error('Error fetching workflow templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workflow templates' },
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
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.role || token.user.role !== 1 || token.user.id !== 1) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await request.json();
        const { 
            name, 
            description, 
            fileTypeId, 
            stages, 
            createdBy, 
            ipAddress, 
            userAgent 
        } = body;

        // Input validation
        if (!name || !fileTypeId || !stages || !Array.isArray(stages) || stages.length === 0) {
            return NextResponse.json(
                { error: 'Name, file type ID, and stages array are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Create workflow template
        const templateResult = await client.query(`
            INSERT INTO efiling_workflow_templates (
                name, description, file_type_id, is_active, created_by, created_at
            ) VALUES ($1, $2, $3, true, $4, NOW())
            RETURNING *
        `, [name, description, fileTypeId, createdBy]);

        const template = templateResult.rows[0];

        // Create stages
        const insertedStageIds = [];
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const stageInsert = await client.query(`
                INSERT INTO efiling_workflow_stages (
                    template_id, stage_name, stage_code, stage_order, 
                    description, stage_type, department_id, role_id, sla_hours,
                    requirements, can_attach_files, can_comment, can_escalate,
                    is_active, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, NOW())
                RETURNING id
            `, [
                template.id,
                stage.name,
                stage.code,
                i + 1,
                stage.description || '',
                stage.stageType || 'APPROVAL',
                stage.departmentId,
                stage.roleId,
                stage.slaHours || 24,
                JSON.stringify(stage.requirements || {}),
                stage.canAttachFiles !== false,
                stage.canComment !== false,
                stage.canEscalate !== false
            ]);
            insertedStageIds.push(stageInsert.rows[0].id);
        }

        // Create linear transitions between consecutive stages
        for (let i = 0; i < insertedStageIds.length - 1; i++) {
            const fromId = insertedStageIds[i];
            const toId = insertedStageIds[i + 1];
            const exists = await client.query(`
                SELECT 1 FROM efiling_stage_transitions WHERE from_stage_id = $1 AND to_stage_id = $2 LIMIT 1
            `, [fromId, toId]);
            if (exists.rowCount === 0) {
                await client.query(`
                    INSERT INTO efiling_stage_transitions (
                        from_stage_id, to_stage_id, transition_type, condition_logic, is_active, created_at
                    ) VALUES ($1, $2, 'FORWARD', '{}', true, NOW())
                `, [fromId, toId]);
            }
        }

        // Log the action
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_TEMPLATE,
            entityId: template.id,
            action: EFILING_ACTION_TYPES.WORKFLOW_TEMPLATE_CREATED,
            userId: token?.user?.id || token?.sub || 'system',
            details: {
                templateName: name,
                fileTypeId,
                stageCount: stages.length
            }
        });

        return NextResponse.json({
            success: true,
            template: {
                id: template.id,
                name: template.name,
                description: template.description,
                stages: stages.map((stage, index) => ({
                    ...stage,
                    order: index + 1
                }))
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating workflow template:', error);
        return NextResponse.json(
            { error: 'Failed to create workflow template' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function PUT(request) {
    let client;
    try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.role || token.user.role !== 1 || token.user.id !== 1) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { error: 'Template ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { 
            name, 
            description, 
            file_type_id, 
            stages
        } = body;

        // Input validation
        if (!name || !file_type_id || !stages || !Array.isArray(stages) || stages.length === 0) {
            return NextResponse.json(
                { error: 'Name, file type ID, and stages array are required' },
                { status: 400 }
            );
        }

        client = await connectToDatabase();

        // Start transaction for robust update
        await client.query('BEGIN');

        // Check if template exists
        const existingTemplate = await client.query(`
            SELECT id FROM efiling_workflow_templates WHERE id = $1
        `, [id]);

        if (existingTemplate.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json(
                { error: 'Workflow template not found' },
                { status: 404 }
            );
        }

        // Update workflow template metadata
        await client.query(`
            UPDATE efiling_workflow_templates 
            SET name = $1, description = $2, file_type_id = $3, updated_at = NOW()
            WHERE id = $4
        `, [name, description, file_type_id, id]);

        // Load current stages for this template (id -> exists)
        const currentStagesRes = await client.query('SELECT id FROM efiling_workflow_stages WHERE template_id = $1', [id]);
        const currentStageIdSet = new Set(currentStagesRes.rows.map(r => r.id));

        // Upsert stages in-place without deleting existing ones to avoid FK violations
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            const stageOrder = i + 1;
            if (stage.id && currentStageIdSet.has(stage.id)) {
                // Update existing stage
                await client.query(`
                    UPDATE efiling_workflow_stages
                    SET 
                        stage_name = $1,
                        stage_code = $2,
                        stage_order = $3,
                        description = COALESCE($4, description),
                        stage_type = COALESCE($5, stage_type),
                        department_id = $6,
                        role_id = $7,
                        role_group_id = $8,
                        sla_hours = COALESCE($9, sla_hours),
                        requirements = $10,
                        can_attach_files = COALESCE($11, can_attach_files),
                        can_comment = COALESCE($12, can_comment),
                        can_escalate = COALESCE($13, can_escalate),
                        updated_at = NOW()
                    WHERE id = $14 AND template_id = $15
                `, [
                    stage.name,
                    stage.code,
                    stageOrder,
                    stage.description || '',
                    stage.stageType || 'APPROVAL',
                    stage.departmentId || null,
                    stage.roleId || null,
                    stage.roleGroupId || null,
                    stage.slaHours || 24,
                    JSON.stringify(stage.requirements || {}),
                    stage.canAttachFiles !== false,
                    stage.canComment !== false,
                    stage.canEscalate === true,
                    stage.id,
                    id
                ]);
            } else {
                // Insert new stage
                await client.query(`
                    INSERT INTO efiling_workflow_stages (
                        template_id, stage_name, stage_code, stage_order, 
                        description, stage_type, department_id, role_id, role_group_id, sla_hours,
                        requirements, can_attach_files, can_comment, can_escalate,
                        is_active, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, NOW())
                `, [
                    id,
                    stage.name,
                    stage.code,
                    stageOrder,
                    stage.description || '',
                    stage.stageType || 'APPROVAL',
                    stage.departmentId || null,
                    stage.roleId || null,
                    stage.roleGroupId || null,
                    stage.slaHours || 24,
                    JSON.stringify(stage.requirements || {}),
                    stage.canAttachFiles !== false,
                    stage.canComment !== false,
                    stage.canEscalate === true
                ]);
            }
        }

        // Recompute transitions safely: ensure linear transitions exist; deactivate non-linear ones
        const orderedStagesRes = await client.query(`
            SELECT id FROM efiling_workflow_stages WHERE template_id = $1 ORDER BY stage_order ASC
        `, [id]);
        const orderedIds = orderedStagesRes.rows.map(r => r.id);

        // Build desired consecutive pairs
        const desiredPairs = new Set();
        for (let i = 0; i < orderedIds.length - 1; i++) {
            desiredPairs.add(`${orderedIds[i]}-${orderedIds[i+1]}`);
        }

        // Fetch existing transitions among these stages
        const existingTransitionsRes = await client.query(`
            SELECT id, from_stage_id, to_stage_id, is_active
            FROM efiling_stage_transitions
            WHERE from_stage_id = ANY($1) OR to_stage_id = ANY($1)
        `, [orderedIds]);

        const havePair = new Set(existingTransitionsRes.rows.map(r => `${r.from_stage_id}-${r.to_stage_id}`));

        // Insert missing desired transitions
        for (let i = 0; i < orderedIds.length - 1; i++) {
            const fromId = orderedIds[i];
            const toId = orderedIds[i+1];
            const key = `${fromId}-${toId}`;
            if (!havePair.has(key)) {
                await client.query(`
                    INSERT INTO efiling_stage_transitions (from_stage_id, to_stage_id, transition_type, condition_logic, is_active, created_at)
                    VALUES ($1, $2, 'FORWARD', '{}', true, NOW())
                `, [fromId, toId]);
            } else {
                // Ensure it is active
                await client.query(`
                    UPDATE efiling_stage_transitions SET is_active = true WHERE from_stage_id = $1 AND to_stage_id = $2
                `, [fromId, toId]);
            }
        }

        // Deactivate transitions that are among template stages but not desired linear pairs
        for (const tr of existingTransitionsRes.rows) {
            const key = `${tr.from_stage_id}-${tr.to_stage_id}`;
            if (!desiredPairs.has(key)) {
                await client.query(`
                    UPDATE efiling_stage_transitions SET is_active = false WHERE id = $1
                `, [tr.id]);
            }
        }

        // Commit transaction
        await client.query('COMMIT');

        // Log the action
        await eFileActionLogger.logAction({
            entityType: EFILING_ENTITY_TYPES.EFILING_TEMPLATE,
            entityId: id,
            action: EFILING_ACTION_TYPES.WORKFLOW_TEMPLATE_UPDATED,
            userId: token?.user?.id || token?.sub || 'system',
            details: {
                templateName: name,
                fileTypeId: file_type_id,
                stageCount: stages.length
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Workflow template updated successfully'
        });

    } catch (error) {
        try { if (client) await client.query('ROLLBACK'); } catch (e) {}
        console.error('Error updating workflow template:', error);
        return NextResponse.json(
            { error: 'Failed to update workflow template' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}

export async function DELETE(request) {
    let client;
    try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.role || token.user.role !== 1 || token.user.id !== 1) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        client = await connectToDatabase();

        // Ensure template exists
        const tpl = await client.query('SELECT id, name FROM efiling_workflow_templates WHERE id = $1', [id]);
        if (tpl.rows.length === 0) {
            return NextResponse.json({ error: 'Workflow template not found' }, { status: 404 });
        }

        // Block delete if referenced by workflows
        const inUse = await client.query('SELECT COUNT(*)::int AS cnt FROM efiling_file_workflows WHERE template_id = $1', [id]);
        if (inUse.rows[0].cnt > 0) {
            // Soft disable instead of hard delete to preserve history
            await client.query('UPDATE efiling_workflow_templates SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
            return NextResponse.json({ success: true, message: 'Template has workflows and was disabled instead of deleted' });
        }

        // Delete related rows referencing stages (transitions, actions), then delete template
        await client.query('BEGIN');
        // Collect stage ids
        const stages = await client.query('SELECT id FROM efiling_workflow_stages WHERE template_id = $1', [id]);
        const stageIds = stages.rows.map(r => r.id);
        if (stageIds.length > 0) {
            // efiling_workflow_actions references from_stage_id/to_stage_id (no cascade) → delete first
            // First nullify movements that reference transitions about to be deleted
            const transitionsRes = await client.query(`
                SELECT id FROM efiling_stage_transitions
                WHERE from_stage_id = ANY($1) OR to_stage_id = ANY($1)
            `, [stageIds]);
            const transitionIds = transitionsRes.rows.map(r => r.id);
            if (transitionIds.length > 0) {
                await client.query(`
                    UPDATE efiling_file_movements
                    SET stage_transition_id = NULL
                    WHERE stage_transition_id = ANY($1)
                `, [transitionIds]);
            }
            await client.query(`
                DELETE FROM efiling_workflow_actions
                WHERE from_stage_id = ANY($1) OR to_stage_id = ANY($1)
            `, [stageIds]);
            // efiling_stage_transitions references from_stage_id/to_stage_id (no cascade) → delete
            await client.query(`
                DELETE FROM efiling_stage_transitions
                WHERE from_stage_id = ANY($1) OR to_stage_id = ANY($1)
            `, [stageIds]);
        }
        // Finally delete template (stages will cascade to other stage-linked tables)
        await client.query('DELETE FROM efiling_workflow_templates WHERE id = $1', [id]);
        await client.query('COMMIT');

        // Log
        try {
            await eFileActionLogger.logAction({
                entityType: EFILING_ENTITY_TYPES.EFILING_TEMPLATE,
                entityId: id,
                action: EFILING_ACTION_TYPES.WORKFLOW_TEMPLATE_DELETED,
                userId: token?.sub || 'system',
                details: { templateId: id }
            });
        } catch (e) { /* ignore logging errors */ }

        return NextResponse.json({ success: true, message: 'Workflow template deleted' });
    } catch (error) {
        console.error('Error deleting workflow template:', error);
        return NextResponse.json({ error: 'Failed to delete workflow template' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
