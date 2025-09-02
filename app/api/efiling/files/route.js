import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES, EFILING_ENTITY_TYPES } from '@/lib/efilingActionLogger';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const department_id = searchParams.get('department_id');
    const status_id = searchParams.get('status_id');
    const created_by = searchParams.get('created_by');
    const assigned_to = searchParams.get('assigned_to');
    const work_request_id = searchParams.get('work_request_id');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const client = await connectToDatabase();
    
    try {
        // Check if the efiling_files table exists
        try {
            const tableCheck = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'efiling_files'
                );
            `);
            console.log('efiling_files table exists:', tableCheck.rows[0].exists);
            
            if (!tableCheck.rows[0].exists) {
                return NextResponse.json({ error: 'efiling_files table does not exist' }, { status: 500 });
            }
        } catch (tableError) {
            console.error('Error checking table existence:', tableError);
            return NextResponse.json({ error: 'Database schema error' }, { status: 500 });
        }
        
        if (id) {
            try {
                // First, let's try a simple query to see if the file exists
                const simpleQuery = 'SELECT * FROM efiling_files WHERE id = $1';
                console.log('Fetching file with ID:', id);
                const simpleResult = await client.query(simpleQuery, [id]);
                console.log('Simple file query result:', simpleResult.rows.length, 'rows found');
                
                if (simpleResult.rows.length === 0) {
                    return NextResponse.json({ error: 'File not found' }, { status: 404 });
                }
                
                // Now let's try the full query with JOINs
                const fullQuery = `
                    SELECT f.*, 
                           c.name as category_name,
                           d.name as department_name,
                           s.name as status_name, s.code as status_code, s.color as status_color,
                           COALESCE(ab.designation, 'Unassigned') as assigned_to_name
                    FROM efiling_files f
                    LEFT JOIN efiling_file_categories c ON f.category_id = c.id
                    LEFT JOIN efiling_departments d ON f.department_id = d.id
                    LEFT JOIN efiling_file_status s ON f.status_id = s.id
                    LEFT JOIN efiling_users ab ON f.assigned_to = ab.id
                    WHERE f.id = $1
                `;
                
                const fullResult = await client.query(fullQuery, [id]);
                console.log('Full file query result:', fullResult.rows.length, 'rows found');
                
                return NextResponse.json(fullResult.rows[0]);
            } catch (error) {
                console.error('Error fetching single file:', error);
                return NextResponse.json({ 
                    error: 'Database error while fetching file',
                    details: error.message 
                }, { status: 500 });
            }
        } else {
            // First, let's check if there are any files at all
            const countQuery = await client.query('SELECT COUNT(*) as total FROM efiling_files');
            console.log('Total files in database:', countQuery.rows[0].total);
            
            let query = `
                SELECT f.*, 
                       c.name as category_name,
                       d.name as department_name,
                       s.name as status_name, s.code as status_code, s.color as status_color,
                       COALESCE(ab.designation, 'Unassigned') as assigned_to_name
                FROM efiling_files f
                LEFT JOIN efiling_file_categories c ON f.category_id = c.id
                LEFT JOIN efiling_departments d ON f.department_id = d.id
                LEFT JOIN efiling_file_status s ON f.status_id = s.id
                LEFT JOIN efiling_users ab ON f.assigned_to = ab.id
            `;
            const params = [];
            const conditions = [];
            let paramIndex = 1;
            
            if (department_id) {
                conditions.push(`f.department_id = $${paramIndex}`);
                params.push(department_id);
                paramIndex++;
            }
            
            if (status_id) {
                conditions.push(`f.status_id = $${paramIndex}`);
                params.push(status_id);
                paramIndex++;
            }
            
            if (assigned_to) {
                conditions.push(`f.assigned_to = $${paramIndex}`);
                params.push(assigned_to);
                paramIndex++;
            }
            
            if (priority) {
                conditions.push(`f.priority = $${paramIndex}`);
                params.push(priority);
                paramIndex++;
            }
            
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            query += ` ORDER BY f.created_at DESC`;
            
            if (limit > 0) {
                query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
                params.push(limit, offset);
            }
            
            const result = await client.query(query, params);
            console.log('Files query result:', result.rows.length, 'files found');
            return NextResponse.json({
                success: true,
                files: result.rows,
                total: result.rows.length
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}

export async function POST(request) {
    const client = await connectToDatabase();
    
    try {
        const body = await request.json();
        const { 
            subject, 
            category_id, 
            department_id, 
            work_request_id,
            assigned_to,
            remarks 
        } = body;
        
        // Validate required fields
        if (!subject || !category_id || !department_id) {
            return NextResponse.json({ 
                error: 'Subject, category, and department are required' 
            }, { status: 400 });
        }
        
        // For now, we'll use the first available efiling user as created_by
        // In the future, this should get the current user's efiling_users.id from the session
        const userQuery = await client.query(
            'SELECT id FROM efiling_users WHERE is_active = true LIMIT 1'
        );
        const createdBy = userQuery.rows.length > 0 ? userQuery.rows[0].id : null;
        
        if (!createdBy) {
            return NextResponse.json({ 
                error: 'No active e-filing users found. Please create a user first.' 
            }, { status: 500 });
        }
        
        // Generate file number (format: DEPT/YEAR/SEQUENTIAL)
        const year = new Date().getFullYear();
        const deptQuery = await client.query(
            'SELECT code FROM efiling_departments WHERE id = $1',
            [department_id]
        );
        
        if (deptQuery.rows.length === 0) {
            return NextResponse.json({ error: 'Department not found' }, { status: 400 });
        }
        
        const deptCode = deptQuery.rows[0].code;
        
        // Get next sequence number for this department and year
        const seqQuery = await client.query(
            `SELECT COUNT(*) + 1 as next_seq 
             FROM efiling_files 
             WHERE department_id = $1 
             AND EXTRACT(YEAR FROM created_at) = $2`,
            [department_id, year]
        );
        
        const sequence = seqQuery.rows[0].next_seq;
        const fileNumber = `${deptCode}/${year}/${sequence.toString().padStart(4, '0')}`;
        
        // Get default status (Draft)
        const statusQuery = await client.query(
            'SELECT id FROM efiling_file_status WHERE code = $1',
            ['DRAFT']
        );
        
        if (statusQuery.rows.length === 0) {
            return NextResponse.json({ error: 'Default status not found' }, { status: 500 });
        }
        
        const statusId = statusQuery.rows[0].id;
        console.log('Using status ID:', statusId, 'for DRAFT status');
        
        // Get workflow template based on file category
        let workflowTemplateId = null;
        let firstStageId = null;
        
        try {
            // First try to find workflow template by file type (if file_types table exists)
            let workflowQuery;
            try {
                workflowQuery = await client.query(`
                    SELECT wt.id, ws.id as first_stage_id
                    FROM efiling_workflow_templates wt
                    LEFT JOIN efiling_workflow_stages ws ON wt.id = ws.template_id AND ws.stage_order = 1
                    WHERE wt.file_type_id = $1 AND wt.is_active = true
                    LIMIT 1
                `, [category_id]);
            } catch (typeError) {
                // If file_types table doesn't exist, try to find by category_id directly
                workflowQuery = await client.query(`
                    SELECT wt.id, ws.id as first_stage_id
                    FROM efiling_workflow_templates wt
                    LEFT JOIN efiling_workflow_stages ws ON wt.id = ws.template_id AND ws.stage_order = 1
                    WHERE wt.is_active = true
                    LIMIT 1
                `);
            }
            
            if (workflowQuery.rows.length > 0) {
                workflowTemplateId = workflowQuery.rows[0].id;
                firstStageId = workflowQuery.rows[0].first_stage_id;
                console.log('Auto-assigned workflow template ID:', workflowTemplateId, 'with first stage:', firstStageId);
            } else {
                console.log('No workflow template found for category ID:', category_id);
            }
        } catch (workflowError) {
            console.error('Error fetching workflow template:', workflowError);
            // Don't fail file creation if workflow assignment fails
        }
        
        // Create file first (without workflow_id initially)
        const query = `
            INSERT INTO efiling_files (
                file_number, subject, category_id, department_id, status_id,
                priority, confidentiality_level, work_request_id, created_by, assigned_to, remarks
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        
        console.log('Inserting file with values:', {
            fileNumber, subject, category_id, department_id, statusId,
            priority: 'high',
            confidentiality_level: 'normal',
            work_request_id: null,
            created_by: createdBy,
            assigned_to: assigned_to,
            remarks: remarks
        });
        
        const result = await client.query(query, [
            fileNumber, subject, category_id, department_id, statusId,
            'high', // Default priority is always high
            'normal', // Default confidentiality level
            null, // work_request_id is always null for new files
            createdBy,
            assigned_to, remarks
        ]);
        
        console.log('File created successfully:', result.rows[0]);
        
        // Create workflow instance if workflow template is assigned
        if (workflowTemplateId && firstStageId) {
            try {
                // Create workflow instance
                const workflowInstanceQuery = await client.query(`
                    INSERT INTO efiling_file_workflows (
                        file_id, template_id, current_stage_id, workflow_status, 
                        started_at, current_assignee_id, created_by, created_at
                    ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW())
                    RETURNING id
                `, [
                    result.rows[0].id, 
                    workflowTemplateId, 
                    firstStageId, 
                    'IN_PROGRESS', 
                    assigned_to || createdBy,
                    createdBy
                ]);
                
                const workflowInstanceId = workflowInstanceQuery.rows[0].id;
                
                // Create initial stage instance
                await client.query(`
                    INSERT INTO efiling_workflow_stage_instances (
                        workflow_id, stage_id, stage_status, assigned_to, started_at, created_at
                    ) VALUES ($1, $2, $3, $4, NOW(), NOW())
                `, [
                    workflowInstanceId,
                    firstStageId,
                    'IN_PROGRESS',
                    assigned_to || createdBy
                ]);
                
                // Update file with workflow instance ID and current stage
                await client.query(`
                    UPDATE efiling_files 
                    SET workflow_id = $1, current_stage_id = $2, updated_at = NOW()
                    WHERE id = $3
                `, [workflowInstanceId, firstStageId, result.rows[0].id]);
                
                console.log('Workflow instance created:', workflowInstanceId, 'with first stage:', firstStageId);
                
                // Update the result to include workflow information
                result.rows[0].workflow_id = workflowInstanceId;
                result.rows[0].current_stage_id = firstStageId;
                
            } catch (workflowError) {
                console.error('Error creating workflow instance:', workflowError);
                // Don't fail file creation if workflow creation fails
            }
        }
        
        // Log the action
        try {
            await eFileActionLogger.logAction({
                entityId: result.rows[0].id.toString(),
                userId: created_by.toString(),
                action: 'FILE_CREATED',
                entityType: 'efiling_file',
                details: { 
                    file_number: fileNumber, 
                    subject, 
                    category_id, 
                    department_id,
                    description: `File "${fileNumber}" created`
                }
            });
        } catch (logError) {
            console.error('Error logging action:', logError);
            // Don't fail the request if logging fails
        }
        
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}

export async function PUT(request) {
    const client = await connectToDatabase();
    
    try {
        const body = await request.json();
        const { 
            id, subject, category_id, department_id, status_id,
            priority, confidentiality_level, assigned_to, remarks 
        } = body;
        
        if (!id) {
            return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        }
        
        // Check if file exists
        const existing = await client.query(
            'SELECT * FROM efiling_files WHERE id = $1',
            [id]
        );
        
        if (existing.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const query = `
            UPDATE efiling_files 
            SET subject = COALESCE($2, subject),
                category_id = COALESCE($3, category_id),
                department_id = COALESCE($4, department_id),
                status_id = COALESCE($5, status_id),
                priority = COALESCE($6, priority),
                confidentiality_level = COALESCE($7, confidentiality_level),
                assigned_to = COALESCE($8, assigned_to),
                remarks = COALESCE($9, remarks),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await client.query(query, [
            id, subject, category_id, department_id, status_id,
            priority, confidentiality_level, assigned_to, remarks
        ]);
        
        // Log the action
        try {
            await eFileActionLogger.logAction({
                entityId: id.toString(),
                userId: result.rows[0].created_by?.toString() || 'unknown',
                action: 'FILE_UPDATED',
                entityType: 'efiling_file',
                details: { 
                    file_number: result.rows[0].file_number, 
                    changes: body,
                    description: `File "${result.rows[0].file_number}" updated`
                }
            });
        } catch (logError) {
            console.error('Error logging action:', logError);
        }
        
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }
    
    const client = await connectToDatabase();
    
    try {
        // Check if file exists
        const existing = await client.query(
            'SELECT * FROM efiling_files WHERE id = $1',
            [id]
        );
        
        if (existing.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        // Check if file has documents
        const docsCount = await client.query(
            'SELECT COUNT(*) FROM efiling_documents WHERE file_id = $1',
            [id]
        );
        
        if (parseInt(docsCount.rows[0].count) > 0) {
            return NextResponse.json({ 
                error: 'Cannot delete file with attached documents' 
            }, { status: 400 });
        }
        
        await client.query('DELETE FROM efiling_files WHERE id = $1', [id]);
        
        // Log the action
        try {
            await eFileActionLogger.logAction({
                entityId: id.toString(),
                userId: existing.rows[0].created_by?.toString() || 'unknown',
                action: 'FILE_DELETED',
                entityType: 'efiling_file',
                details: { 
                    file_number: existing.rows[0].file_number,
                    description: `File "${existing.rows[0].file_number}" deleted`
                }
            });
        } catch (logError) {
            console.error('Error logging action:', logError);
        }
        
        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
} 