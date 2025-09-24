import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger, EFILING_ACTION_TYPES, EFILING_ENTITY_TYPES } from '@/lib/efilingActionLogger';
import { getToken } from 'next-auth/jwt';

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
    
    // Add authentication check for general access
    try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Allow access for admin/manager roles (1,2) or efiling users
        if (![1,2].includes(token.user.role)) {
            // Check if this is an efiling user
            const client = await connectToDatabase();
            try {
                const efilingUserCheck = await client.query(
                    'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true', 
                    [token.user.id]
                );
                if (efilingUserCheck.rows.length === 0) {
                    await client.release();
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
                await client.release();
            } catch (dbError) {
                console.error('Database error checking efiling user:', dbError);
                return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }
        }
    } catch (authError) {
        console.error('Authentication error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
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

                // Access control: only creator or current assignee may view
                try {
                    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
                    if (!token?.user?.id) {
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                    }
                    const userId = token.user.id;
                    const efUserRes = await client.query('SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true', [userId]);
                    const efUserId = efUserRes.rows[0]?.id;
                    if (!efUserId) {
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                    }
                    const aclRes = await client.query(`
                        SELECT 1
                        FROM efiling_files f
                        LEFT JOIN efiling_file_workflows wf ON wf.file_id = f.id
                        WHERE f.id = $1 AND (f.created_by = $2 OR f.assigned_to = $2 OR wf.current_assignee_id = $2)
                    `, [id, efUserId]);
                    if (aclRes.rows.length === 0) {
                        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                    }
                } catch (aclErr) {
                    console.error('ACL check error:', aclErr);
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                
                // Now let's try the full query with JOINs
                const fullQuery = `
                    SELECT f.*, 
                           c.name as category_name,
                           d.name as department_name,
                           s.name as status_name, s.code as status_code, s.color as status_color,
                           COALESCE(ab.designation, 'Unassigned') as assigned_to_name,
                           cr_users.name as created_by_name,
                           cr_users.name as creator_user_name
                    FROM efiling_files f
                    LEFT JOIN efiling_file_categories c ON f.category_id = c.id
                    LEFT JOIN efiling_departments d ON f.department_id = d.id
                    LEFT JOIN efiling_file_status s ON f.status_id = s.id
                    LEFT JOIN efiling_users ab ON f.assigned_to = ab.id
                    LEFT JOIN efiling_users cr ON f.created_by = cr.id
                    LEFT JOIN users cr_users ON cr.user_id = cr_users.id
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
                       COALESCE(ab.designation, 'Unassigned') as assigned_to_name,
                       r.name as assigned_to_role_name,
                       cr_users.name as creator_user_name,
                       curr_users.name as current_assignee_user_name,
                       ls.last_signed_by_name,
                       ls.last_signed_at,
                       wf.sla_deadline as sla_deadline,
                       (wf.sla_deadline IS NOT NULL AND wf.sla_deadline < NOW() AND wf.workflow_status = 'IN_PROGRESS') as is_sla_breached,
                       ROUND(EXTRACT(EPOCH FROM (wf.sla_deadline - NOW()))/60.0) as minutes_remaining,
                       ws.stage_name as current_stage_name,
                       ws.sla_hours as current_stage_sla_hours
                FROM efiling_files f
                LEFT JOIN efiling_file_categories c ON f.category_id = c.id
                LEFT JOIN efiling_departments d ON f.department_id = d.id
                LEFT JOIN efiling_file_status s ON f.status_id = s.id
                LEFT JOIN efiling_users ab ON f.assigned_to = ab.id
                LEFT JOIN efiling_roles r ON ab.efiling_role_id = r.id
                LEFT JOIN efiling_users cr ON f.created_by = cr.id
                LEFT JOIN users cr_users ON cr.user_id = cr_users.id
                LEFT JOIN efiling_file_workflows wf ON wf.file_id = f.id
                LEFT JOIN efiling_workflow_stages ws ON ws.id = wf.current_stage_id
                LEFT JOIN efiling_users curr ON wf.current_assignee_id = curr.id
                LEFT JOIN users curr_users ON curr.user_id = curr_users.id
                LEFT JOIN (
                    SELECT DISTINCT ON (file_id) 
                        file_id, user_name as last_signed_by_name, "timestamp" as last_signed_at
                    FROM efiling_document_signatures
                    ORDER BY file_id, "timestamp" DESC
                ) ls ON ls.file_id = f.id
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
            
            if (created_by) {
                conditions.push(`f.created_by = $${paramIndex}`);
                params.push(created_by);
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
            
            // Add user-based filtering for efiling users
            const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
            if (token?.user?.id && ![1,2].includes(token.user.role)) {
                // For efiling users, only show files they created or are assigned to
                const efilingUserRes = await client.query(
                    'SELECT id FROM efiling_users WHERE user_id = $1 AND is_active = true', 
                    [token.user.id]
                );
                if (efilingUserRes.rows.length > 0) {
                    const efilingUserId = efilingUserRes.rows[0].id;
                    conditions.push(`(f.created_by = $${paramIndex} OR f.assigned_to = $${paramIndex} OR wf.current_assignee_id = $${paramIndex})`);
                    params.push(efilingUserId);
                    paramIndex++;
                }
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
            remarks,
            file_type_id
        } = body;
        
        // Validate required fields
        if (!subject || !category_id || !department_id) {
            return NextResponse.json({ 
                error: 'Subject, category, and department are required' 
            }, { status: 400 });
        }
        
        // Get current user from session token
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const currentUserId = token.user.id;
        
        // Get user's efiling_users.id and department restrictions
        const userQuery = await client.query(`
            SELECT eu.id as efiling_user_id, eu.department_id, eu.efiling_role_id, d.name as department_name
            FROM efiling_users eu 
            JOIN users u ON eu.user_id = u.id 
            JOIN efiling_departments d ON eu.department_id = d.id
            WHERE u.id = $1 AND eu.is_active = true
        `, [currentUserId]);
        
        if (userQuery.rows.length === 0) {
            return NextResponse.json({ 
                error: 'User not found or not active in e-filing system' 
            }, { status: 403 });
        }
        
        const userData = userQuery.rows[0];
        const createdBy = userData.efiling_user_id;
        const userDept = userData.department_id;
        
        // Resolve user's role code (for role-code-based checks)
        let userRoleCode = null;
        try {
            const roleRes = await client.query(
                'SELECT code FROM efiling_roles WHERE id = $1',
                [userData.efiling_role_id]
            );
            userRoleCode = roleRes.rows[0]?.code || null;
        } catch (e) {
            // ignore, will fail later if needed
        }
        
        // If a file_type_id is provided, fetch its metadata first to drive validation
        let fileTypeMeta = null;
        if (file_type_id) {
            const ftRes = await client.query(
                'SELECT id, code, can_create_roles, department_id as ft_department_id, category_id as ft_category_id, is_active FROM efiling_file_types WHERE id = $1',
                [file_type_id]
            );
            if (ftRes.rows.length === 0 || ftRes.rows[0].is_active === false) {
                return NextResponse.json({ error: 'Invalid or inactive file type' }, { status: 400 });
            }
            fileTypeMeta = ftRes.rows[0];
        }
        
        // Department ownership check: prefer the file type's department when provided
        const effectiveDeptId = fileTypeMeta?.ft_department_id ?? parseInt(department_id);
        if (effectiveDeptId !== userDept) {
            return NextResponse.json({ 
                error: `You can only create files for your department. Required: ${effectiveDeptId}, Yours: ${userDept}` 
            }, { status: 403 });
        }
        
        if (!createdBy) {
            return NextResponse.json({ 
                error: 'No active e-filing users found. Please create a user first.' 
            }, { status: 500 });
        }
        
        // If a file_type_id is provided, enforce creator permissions using role codes
        if (file_type_id && fileTypeMeta) {
            try {
                const canCreateRaw = fileTypeMeta.can_create_roles;
                let allowedList = [];
                if (Array.isArray(canCreateRaw)) {
                    allowedList = canCreateRaw;
                } else if (typeof canCreateRaw === 'string') {
                    const trimmed = canCreateRaw.trim();
                    if (trimmed.startsWith('[')) {
                        try { allowedList = JSON.parse(trimmed); } catch { allowedList = []; }
                    } else {
                        allowedList = trimmed.split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
                const roleMatches = (roleCode, pattern) => {
                    if (!roleCode || !pattern) return false;
                    const rc = roleCode.toUpperCase();
                    const p = String(pattern).toUpperCase();
                    if (p.endsWith('*')) return rc.startsWith(p.slice(0, -1));
                    if (p.length <= 4) return rc.includes(p);
                    return rc === p;
                };
                const isAllowed = allowedList.some(p => roleMatches(userRoleCode, p));
                if (!isAllowed) {
                    return NextResponse.json({ 
                        error: `Your role (${userRoleCode || 'UNKNOWN'}) is not permitted to create this file type` 
                    }, { status: 403 });
                }
            } catch (permErr) {
                console.error('Error checking file type creator permissions:', permErr);
                return NextResponse.json({ error: 'Permission check failed' }, { status: 500 });
            }
        }
        
        // Generate file number (format: DEPT/YEAR/SEQUENTIAL)
        const year = new Date().getFullYear();
        const deptToUse = effectiveDeptId;
        const deptQuery = await client.query(
            'SELECT code FROM efiling_departments WHERE id = $1',
            [deptToUse]
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
            [deptToUse, year]
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
        
        // Prefer workflow by file type if provided
        let workflowTemplateId = null;
        let firstStageId = null;
        
        try {
            let workflowQuery;
            if (file_type_id) {
                workflowQuery = await client.query(`
                    SELECT wt.id, ws.id as first_stage_id
                    FROM efiling_workflow_templates wt
                    LEFT JOIN efiling_workflow_stages ws ON wt.id = ws.template_id AND ws.stage_order = 1
                    WHERE wt.file_type_id = $1 AND wt.is_active = true
                    LIMIT 1
                `, [file_type_id]);
            } else {
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
                console.log('No workflow template found for selection');
            }
        } catch (workflowError) {
            console.error('Error fetching workflow template:', workflowError);
            // Do not fail file creation if workflow assignment fails
        }
        
        // Create file first (without workflow_id initially)
        const query = `
            INSERT INTO efiling_files (
                file_number, subject, category_id, department_id, status_id,
                priority, confidentiality_level, work_request_id, created_by, assigned_to, remarks, file_type_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        
        const categoryToUse = fileTypeMeta?.ft_category_id ?? category_id;
        
        console.log('Inserting file with values:', {
            fileNumber, subject, category_id: categoryToUse, department_id: deptToUse, statusId,
            priority: 'high', confidentiality_level: 'normal', work_request_id: work_request_id || null,
            created_by: createdBy, assigned_to: assigned_to || null, remarks, file_type_id
        });
        
        const result = await client.query(query, [
            fileNumber, subject, categoryToUse, deptToUse, statusId,
            'high', 'normal', work_request_id || null, createdBy, assigned_to || null, remarks, file_type_id || null
        ]);
        
        console.log('File created successfully:', result.rows[0]);
        
        // Create notification if file is assigned to someone
        if (assigned_to && assigned_to !== createdBy) {
            try {
                await client.query(`
                    INSERT INTO efiling_notifications (
                        user_id, file_id, type, message, is_read, created_at
                    ) VALUES ($1, $2, $3, $4, $5, NOW())
                `, [
                    assigned_to,
                    result.rows[0].id,
                    'FILE_ASSIGNED',
                    `A new file "${subject}" has been assigned to you.`,
                    false
                ]);
                console.log('Notification created for assigned user:', assigned_to);
            } catch (notificationError) {
                console.error('Error creating notification:', notificationError);
            }
        }
        
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
                
                // Compute SLA deadline from stage.sla_hours (fallback 24)
                let slaHours = 24;
                try {
                    const slaRes = await client.query('SELECT sla_hours FROM efiling_workflow_stages WHERE id = $1', [firstStageId]);
                    if (slaRes.rows[0]?.sla_hours != null) slaHours = parseInt(slaRes.rows[0].sla_hours) || 24;
                } catch {}
                await client.query(`
                    UPDATE efiling_file_workflows
                    SET sla_deadline = NOW() + ($1 || ' hours')::interval, updated_at = NOW()
                    WHERE id = $2
                `, [slaHours.toString(), workflowInstanceId]);
                await client.query(`
                    UPDATE efiling_files
                    SET workflow_id = $1, current_stage_id = $2, sla_deadline = NOW() + ($3 || ' hours')::interval, updated_at = NOW()
                    WHERE id = $4
                `, [workflowInstanceId, firstStageId, slaHours.toString(), result.rows[0].id]);
                
                console.log('Workflow instance created:', workflowInstanceId, 'with first stage:', firstStageId, 'SLA hours:', slaHours);
                
                // Update the result to include workflow information
                result.rows[0].workflow_id = workflowInstanceId;
                result.rows[0].current_stage_id = firstStageId;
                result.rows[0].sla_deadline = null; // client will refetch on list
                
            } catch (workflowError) {
                console.error('Error creating workflow instance:', workflowError);
                // Don't fail file creation if workflow creation fails
            }
        }
        
        // Log the action
        try {
            await eFileActionLogger.logAction({
                entityId: result.rows[0].id.toString(),
                userId: createdBy.toString(),
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
        
        // Create notification if file is assigned to someone new
        if (assigned_to && assigned_to !== existing.rows[0].assigned_to && assigned_to !== existing.rows[0].created_by) {
            try {
                await client.query(`
                    INSERT INTO efiling_notifications (
                        user_id, file_id, type, message, is_read, created_at
                    ) VALUES ($1, $2, $3, $4, $5, NOW())
                `, [
                    assigned_to,
                    id,
                    'FILE_ASSIGNED',
                    `File "${result.rows[0].subject || existing.rows[0].subject}" has been assigned to you.`,
                    false
                ]);
                console.log('Notification created for newly assigned user:', assigned_to);
            } catch (notificationError) {
                console.error('Error creating notification:', notificationError);
            }
        }
        
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