import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { eFileActionLogger } from '@/lib/efilingActionLogger';

export async function GET(request, { params }) {
    let client;
    try {
        const { id: fileId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const includeInternal = searchParams.get('includeInternal') === 'true';

        if (!fileId) {
            return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        }

        client = await connectToDatabase();

        // Get file basic information
        const fileQuery = await client.query(`
            SELECT 
                f.*,
                d.name as department_name,
                c.name as category_name,
                s.name as status_name,
                s.code as status_code,
                s.color as status_color,
                ft.name as file_type_name,
                wf.workflow_status,
                wf.started_at as workflow_started,
                wf.completed_at as workflow_completed,
                wf.sla_deadline,
                wf.sla_breached
            FROM efiling_files f
            LEFT JOIN efiling_departments d ON f.department_id = d.id
            LEFT JOIN efiling_file_categories c ON f.category_id = c.id
            LEFT JOIN efiling_file_status s ON f.status_id = s.id
            LEFT JOIN efiling_file_types ft ON f.file_type_id = ft.id
            LEFT JOIN efiling_file_workflows wf ON f.workflow_id = wf.id
            WHERE f.id = $1
        `, [fileId]);

        if (fileQuery.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const file = fileQuery.rows[0];

        // Get file movements/history
        const movementsQuery = await client.query(`
            SELECT 
                fm.*,
                fu1.name as from_user_name,
                fu1.designation as from_user_designation,
                fu2.name as to_user_name,
                fu2.designation as to_user_designation,
                fd1.name as from_department_name,
                fd2.name as to_department_name
            FROM efiling_file_movements fm
            LEFT JOIN efiling_users fu1 ON fm.from_user_id = fu1.id
            LEFT JOIN users u1 ON fu1.user_id = u1.id
            LEFT JOIN efiling_users fu2 ON fm.to_user_id = fu2.id
            LEFT JOIN users u2 ON fu2.user_id = u2.id
            LEFT JOIN efiling_departments fd1 ON fm.from_department_id = fd1.id
            LEFT JOIN efiling_departments fd2 ON fm.to_department_id = fd2.id
            WHERE fm.file_id = $1
            ORDER BY fm.created_at ASC
        `, [fileId]);

        // Get workflow stage instances
        const stageInstancesQuery = await client.query(`
            SELECT 
                si.*,
                ws.stage_name,
                ws.stage_code,
                ws.stage_order,
                ws.stage_type,
                ws.sla_hours,
                ws.requirements,
                ws.can_attach_files,
                ws.can_comment,
                ws.can_escalate,
                u.name as assigned_user_name,
                u.designation as assigned_user_designation,
                d.name as department_name,
                r.name as role_name
            FROM efiling_workflow_stage_instances si
            LEFT JOIN efiling_workflow_stages ws ON si.stage_id = ws.id
            LEFT JOIN efiling_users u ON si.assigned_to = u.id
            LEFT JOIN users usr ON u.user_id = usr.id
            LEFT JOIN efiling_departments d ON u.department_id = d.id
            LEFT JOIN efiling_roles r ON u.efiling_role_id = r.id
            WHERE si.workflow_id = $1
            ORDER BY ws.stage_order ASC, si.created_at ASC
        `, [file.workflow_id || 0]);

        // Get workflow actions
        const workflowActionsQuery = await client.query(`
            SELECT 
                wa.*,
                u.name as performed_by_name,
                u.designation as performed_by_designation,
                ws1.stage_name as from_stage_name,
                ws2.stage_name as to_stage_name
            FROM efiling_workflow_actions wa
            LEFT JOIN efiling_users u ON wa.performed_by = u.id
            LEFT JOIN users usr ON u.user_id = usr.id
            LEFT JOIN efiling_workflow_stages ws1 ON wa.from_stage_id = ws1.id
            LEFT JOIN efiling_workflow_stages ws2 ON wa.to_stage_id = ws2.id
            WHERE wa.workflow_id = $1
            ORDER BY wa.performed_at ASC
        `, [file.workflow_id || 0]);

        // Get file comments
        const commentsQuery = await client.query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.designation as user_designation,
                d.name as department_name
            FROM efiling_comments c
            LEFT JOIN efiling_users u ON c.user_id = u.id
            LEFT JOIN users usr ON u.user_id = usr.id
            LEFT JOIN efiling_departments d ON u.department_id = d.id
            WHERE c.file_id = $1
            ${!includeInternal ? 'AND c.is_internal = false' : ''}
            ORDER BY c.created_at ASC
        `, [fileId]);

        // Get document signatures
        const signaturesQuery = await client.query(`
            SELECT 
                s.*,
                u.name as user_name,
                u.designation as user_designation
            FROM efiling_document_signatures s
            LEFT JOIN efiling_users u ON s.user_id = u.id
            LEFT JOIN users usr ON u.user_id = usr.id
            WHERE s.file_id = $1
            ORDER BY s.timestamp ASC
        `, [fileId]);

        // Get file attachments
        const attachmentsQuery = await client.query(`
            SELECT 
                a.*,
                u.name as uploaded_by_name,
                u.designation as uploaded_by_designation
            FROM efiling_file_attachments a
            LEFT JOIN efiling_users u ON a.uploaded_by = u.id
            LEFT JOIN users usr ON u.user_id = usr.id
            WHERE a.file_id = $1 AND a.is_active = true
            ORDER BY a.uploaded_at ASC
        `, [fileId]);

        // Get user actions log
        const userActionsQuery = await client.query(`
            SELECT 
                ua.*,
                u.name as user_name,
                u.designation as user_designation
            FROM efiling_user_actions ua
            LEFT JOIN efiling_users u ON ua.user_id::INTEGER = u.id
            LEFT JOIN users usr ON u.user_id = usr.id
            WHERE ua.file_id = $1
            ORDER BY ua.timestamp ASC
        `, [fileId]);

        // Build comprehensive history tree
        const history = {
            file: {
                id: file.id,
                file_number: file.file_number,
                subject: file.subject,
                department: file.department_name,
                category: file.category_name,
                status: file.status_name,
                status_code: file.status_code,
                priority: file.priority,
                confidentiality: file.confidentiality_level,
                created_at: file.created_at,
                updated_at: file.updated_at,
                workflow_status: file.workflow_status,
                workflow_started: file.workflow_started,
                workflow_completed: file.workflow_completed,
                sla_deadline: file.sla_deadline,
                sla_breached: file.sla_breached
            },
            timeline: []
        };

        // Add file creation event
        history.timeline.push({
            id: `file_created_${file.id}`,
            type: 'file_created',
            timestamp: file.created_at,
            user: 'System',
            action: 'File Created',
            description: `File "${file.file_number}" was created`,
            details: {
                subject: file.subject,
                department: file.department_name,
                category: file.category_name
            }
        });

        // Add file movements
        movementsQuery.rows.forEach((movement, index) => {
            history.timeline.push({
                id: `movement_${movement.id}`,
                type: 'file_movement',
                timestamp: movement.created_at,
                user: movement.from_user_name || 'System',
                action: movement.action_type,
                description: `${movement.action_type} from ${movement.from_user_name || 'System'} to ${movement.to_user_name || 'System'}`,
                details: {
                    from_user: movement.from_user_name,
                    from_department: movement.from_department_name,
                    to_user: movement.to_user_name,
                    to_department: movement.to_department_name,
                    remarks: movement.remarks
                }
            });
        });

        // Add workflow stage instances
        stageInstancesQuery.rows.forEach((stage, index) => {
            history.timeline.push({
                id: `stage_${stage.id}`,
                type: 'workflow_stage',
                timestamp: stage.started_at || stage.created_at,
                user: stage.assigned_user_name || 'System',
                action: `Stage: ${stage.stage_name}`,
                description: `File moved to stage "${stage.stage_name}"`,
                details: {
                    stage_name: stage.stage_name,
                    stage_code: stage.stage_code,
                    stage_order: stage.stage_order,
                    stage_type: stage.stage_type,
                    assigned_to: stage.assigned_user_name,
                    department: stage.department_name,
                    role: stage.role_name,
                    status: stage.stage_status,
                    started_at: stage.started_at,
                    completed_at: stage.completed_at,
                    sla_deadline: stage.sla_deadline,
                    sla_breached: stage.sla_breached
                }
            });

            // Add stage completion if completed
            if (stage.completed_at) {
                history.timeline.push({
                    id: `stage_completed_${stage.id}`,
                    type: 'stage_completed',
                    timestamp: stage.completed_at,
                    user: stage.assigned_user_name || 'System',
                    action: `Stage Completed: ${stage.stage_name}`,
                    description: `Stage "${stage.stage_name}" was completed`,
                    details: {
                        stage_name: stage.stage_name,
                        completed_by: stage.assigned_user_name,
                        completion_time: stage.completed_at
                    }
                });
            }
        });

        // Add workflow actions
        workflowActionsQuery.rows.forEach((action, index) => {
            history.timeline.push({
                id: `workflow_action_${action.id}`,
                type: 'workflow_action',
                timestamp: action.performed_at,
                user: action.performed_by_name || 'System',
                action: action.action_type,
                description: `${action.action_type} performed`,
                details: {
                    action_type: action.action_type,
                    from_stage: action.from_stage_name,
                    to_stage: action.to_stage_name,
                    time_taken_hours: action.time_taken_hours,
                    sla_breached: action.sla_breached,
                    action_data: action.action_data
                }
            });
        });

        // Add comments
        commentsQuery.rows.forEach((comment, index) => {
            history.timeline.push({
                id: `comment_${comment.id}`,
                type: 'comment',
                timestamp: comment.created_at,
                user: comment.user_name || 'System',
                action: 'Comment Added',
                description: comment.comment,
                details: {
                    is_internal: comment.is_internal,
                    user_designation: comment.user_designation,
                    department: comment.department_name
                }
            });
        });

        // Add signatures
        signaturesQuery.rows.forEach((signature, index) => {
            history.timeline.push({
                id: `signature_${signature.id}`,
                type: 'signature',
                timestamp: signature.timestamp,
                user: signature.user_name || 'System',
                action: 'Document Signed',
                description: `Document signed using ${signature.type}`,
                details: {
                    signature_type: signature.type,
                    signature_content: signature.content,
                    position: signature.position,
                    font: signature.font
                }
            });
        });

        // Add attachments
        attachmentsQuery.rows.forEach((attachment, index) => {
            history.timeline.push({
                id: `attachment_${attachment.id}`,
                type: 'attachment',
                timestamp: attachment.uploaded_at,
                user: attachment.uploaded_by_name || 'System',
                action: 'Attachment Uploaded',
                description: `File "${attachment.file_name}" attached`,
                details: {
                    file_name: attachment.file_name,
                    file_size: attachment.file_size,
                    file_type: attachment.file_type
                }
            });
        });

        // Add user actions
        userActionsQuery.rows.forEach((action, index) => {
            history.timeline.push({
                id: `user_action_${action.id}`,
                type: 'user_action',
                timestamp: action.timestamp,
                user: action.user_name || 'System',
                action: action.action_type,
                description: action.description || action.action_type,
                details: {
                    action_type: action.action_type,
                    user_designation: action.user_designation
                }
            });
        });

        // Sort timeline by timestamp
        history.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Log the history access
        if (userId) {
            await eFileActionLogger.logAction({
                entityType: 'FILE',
                entityId: fileId,
                action: 'VIEW_HISTORY',
                userId: userId,
                details: { history_length: history.timeline.length }
            });
        }

        return NextResponse.json({
            success: true,
            history: history
        });

    } catch (error) {
        console.error('Error fetching file history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file history' },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.release();
        }
    }
}
