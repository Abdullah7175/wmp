import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ENTITY_TYPES, EFILING_ACTION_TYPES } from '@/lib/efilingActionLogger';

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
                    r.name as role_name
                FROM efiling_workflow_stages ws
                LEFT JOIN efiling_departments d ON ws.department_id = d.id
                LEFT JOIN efiling_roles r ON ws.role_id = r.id
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
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            await client.query(`
                INSERT INTO efiling_workflow_stages (
                    template_id, stage_name, stage_code, stage_order, 
                    description, stage_type, department_id, role_id, sla_hours,
                    requirements, can_attach_files, can_comment, can_escalate,
                    is_active, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, NOW())
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
        }

        // Log the action
        await eFileActionLogger.logAction(request, EFILING_ACTION_TYPES.WORKFLOW_TEMPLATE_CREATED, EFILING_ENTITY_TYPES.EFILING_TEMPLATE, {
            entityId: template.id,
            entityName: name,
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

        // Check if template exists
        const existingTemplate = await client.query(`
            SELECT id FROM efiling_workflow_templates WHERE id = $1
        `, [id]);

        if (existingTemplate.rows.length === 0) {
            return NextResponse.json(
                { error: 'Workflow template not found' },
                { status: 404 }
            );
        }

        // Update workflow template
        await client.query(`
            UPDATE efiling_workflow_templates 
            SET name = $1, description = $2, file_type_id = $3, updated_at = NOW()
            WHERE id = $4
        `, [name, description, file_type_id, id]);

        // Delete existing stages
        await client.query(`
            DELETE FROM efiling_workflow_stages WHERE template_id = $1
        `, [id]);

        // Create new stages
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i];
            await client.query(`
                INSERT INTO efiling_workflow_stages (
                    template_id, stage_name, stage_code, stage_order, 
                    description, stage_type, department_id, role_id, sla_hours,
                    requirements, can_attach_files, can_comment, can_escalate,
                    is_active, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, NOW())
            `, [
                id,
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
        }

        // Log the action
        await eFileActionLogger.logAction(request, EFILING_ACTION_TYPES.WORKFLOW_TEMPLATE_UPDATED, EFILING_ENTITY_TYPES.EFILING_TEMPLATE, {
            entityId: id,
            entityName: name,
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
