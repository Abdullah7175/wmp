import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/auth';
import { canEditFile, canAddPages, getWorkflowState } from '@/lib/efilingWorkflowStateManager';
import { isTeamMember, canMarkFile } from '@/lib/efilingTeamManager';

/**
 * GET /api/efiling/files/[id]/permissions
 * Returns permission set for current user on specified file
 * 
 * Permissions:
 * - canEdit: Admin or file creator only
 * - canView: All assigned users
 * - canAddSignature: All users
 * - canAddComment: All users  
 * - canAddAttachment: All users
 * - canMarkTo: Creator (with signature) or admin
 * - canApprove/Reject: Assigned user (with signature)
 */
export async function GET(request, { params }) {
    let client;
    
    try {
        const { id } = await params;
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        client = await connectToDatabase();
        
        // Get user's efiling profile
        const userRes = await client.query(`
            SELECT eu.id, eu.user_id, eu.efiling_role_id, eu.department_id, r.code as role_code, r.name as role_name, dept.name as department_name
            FROM efiling_users eu
            LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
            LEFT JOIN efiling_departments dept ON eu.department_id = dept.id
            WHERE eu.user_id = $1 AND eu.is_active = true
        `, [session.user.id]);
        
        if (userRes.rows.length === 0) {
            // Not an efiling user - check if admin
            const isSystemAdmin = [1, 2].includes(parseInt(session.user.role));
            if (!isSystemAdmin) {
                return NextResponse.json({ error: 'User not found in e-filing system' }, { status: 403 });
            }
            
            // Admin has full permissions
            return NextResponse.json({ 
                permissions: {
                    canEdit: true,
                    canView: true,
                    canAddSignature: true,
                    canAddComment: true,
                    canAddAttachment: true,
                    canMarkTo: true,
                    canApprove: true,
                    canReject: true,
                    canForward: true,
                    isAdmin: true,
                    isCreator: false,
                    isAssigned: false,
                    hasSigned: false,
                    requiresSignature: false
                }
            });
        }
        
        const userEfiling = userRes.rows[0];
        
        // Get file details with geographic routing context
        const fileRes = await client.query(`
            SELECT f.*, 
                   assigned.efiling_role_id AS assigned_role_id,
                   assigned_roles.code AS assigned_role_code
            FROM efiling_files f
            LEFT JOIN efiling_users assigned ON f.assigned_to = assigned.id
            LEFT JOIN efiling_roles assigned_roles ON assigned.efiling_role_id = assigned_roles.id
            WHERE f.id = $1
        `, [id]);
        
        if (fileRes.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const file = fileRes.rows[0];
        
        // Check if user is system admin
        const isSystemAdmin = userEfiling.role_code === 'SYS_ADMIN' || [1, 2].includes(parseInt(session.user.role));
        
        // Check if user is file creator
        const isCreator = file.created_by === userEfiling.id;
        
        // Check if user is currently assigned
        const isAssigned = file.assigned_to === userEfiling.id;
        
        // Check if file has been marked to this user
        const markedToRes = await client.query(`
            SELECT COUNT(*) as count
            FROM efiling_file_movements
            WHERE file_id = $1 AND to_user_id = $2
        `, [id, userEfiling.id]);
        
        const isMarkedTo = markedToRes.rows[0].count > 0;
        
        // Check if user has signed the file
        const signatureRes = await client.query(`
            SELECT COUNT(*) as count, MAX(timestamp) as last_signed_at
            FROM efiling_document_signatures
            WHERE file_id = $1 AND user_id = $2 AND is_active = true
        `, [id, session.user.id]);
        
        const hasSigned = signatureRes.rows[0].count > 0;
        const lastSignedAt = signatureRes.rows[0].last_signed_at;
        
        // Get file creator's signature status
        const creatorSignatureRes = await client.query(`
            SELECT COUNT(*) as count
            FROM efiling_document_signatures eds
            JOIN efiling_users eu ON eds.user_id = eu.user_id
            WHERE eds.file_id = $1 AND eu.id = $2 AND eds.is_active = true
        `, [id, file.created_by]);
        
        const creatorHasSigned = creatorSignatureRes.rows[0].count > 0;
        
        // Get workflow state for team workflow checks
        const workflowState = await getWorkflowState(client, id);
        const isWithinTeam = workflowState ? workflowState.is_within_team : false;
        const currentState = workflowState ? workflowState.current_state : 'TEAM_INTERNAL';
        
        // Check if user is team member
        const isTeamMemberOfCreator = isCreator ? false : await isTeamMember(client, file.created_by, userEfiling.id);
        
        // Check if user is higher authority (SE, CE, DCE, CEO, COO, IAO-II, ADLFA, BUDGET, BILLING, etc.)
        const userRoleCode = (userEfiling.role_code || '').toUpperCase();
        // Get user's department for department-based checks
        const userDepartment = userEfiling.department_name ? userEfiling.department_name.toUpperCase() : '';
        const isBudgetBilling = userRoleCode.includes('BUDGET') || 
                               userRoleCode.includes('BILLING') ||
                               userDepartment === 'BUDGET' ||
                               userDepartment === 'BILLING' ||
                               userDepartment.includes('BUDGET') ||
                               userDepartment.includes('BILLING');
        
        // Check for exact matches or role codes that start with SE, CE, CEO, COO (with optional underscore/suffix)
        // This matches: SE, SE_, SE_WE&M, CE, CE_, CE_WAT, CEO, CEO_, COO, COO_, ADLFA, DCE, IAO-II
        const isHigherAuthority = userRoleCode === 'SE' || 
                                 userRoleCode === 'CE' || 
                                 userRoleCode === 'DCE' ||
                                 userRoleCode === 'CEO' || 
                                 userRoleCode === 'COO' || 
                                 userRoleCode === 'ADLFA' ||
                                 userRoleCode === 'IAO-II' ||
                                 userRoleCode.includes('IAO-II') ||
                                 isBudgetBilling ||
                                 userRoleCode.startsWith('SE_') || 
                                 userRoleCode.startsWith('CE_') ||
                                 userRoleCode.startsWith('DCE_') ||
                                 userRoleCode.startsWith('CEO_') || 
                                 userRoleCode.startsWith('COO_');
        
        console.log('[Permissions] User role check:', {
            roleCode: userEfiling.role_code,
            userRoleCode,
            isHigherAuthority
        });
        
        // Check if file was marked back to creator by higher authority (SE, CE, CEO, COO)
        let wasMarkedBackByHigherAuthority = false;
        if (isCreator && currentState === 'RETURNED_TO_CREATOR') {
            const latestMovementRes = await client.query(`
                SELECT 
                    m.is_return_to_creator,
                    m.from_user_id,
                    r.code as from_role_code
                FROM efiling_file_movements m
                LEFT JOIN efiling_users eu_from ON m.from_user_id = eu_from.id
                LEFT JOIN efiling_roles r ON eu_from.efiling_role_id = r.id
                WHERE m.file_id = $1
                ORDER BY m.created_at DESC
                LIMIT 1
            `, [id]);
            
            const latestMovement = latestMovementRes.rows[0];
            if (latestMovement && latestMovement.is_return_to_creator === true) {
                const fromRoleCode = (latestMovement.from_role_code || '').toUpperCase();
                wasMarkedBackByHigherAuthority = ['SE', 'CE', 'CEO', 'COO'].includes(fromRoleCode);
            }
        }
        
        // Check editing permissions (updated for team workflow)
        // If file was marked back by higher authority, creator can only add pages, not edit existing ones
        // Higher authority users (SE, CE, CEO, COO) also cannot edit existing pages - they can only add new pages
        const canEdit = isSystemAdmin || (await canEditFile(client, id, userEfiling.id) && !wasMarkedBackByHigherAuthority && !isHigherAuthority);
        
        // Check if user can add pages (SE/CE and assistants, or creator if file was marked back, or any higher authority)
        const canAddPage = await canAddPages(client, id, userEfiling.id) || (isCreator && wasMarkedBackByHigherAuthority) || (isHigherAuthority && isAssigned);
        
        // Check if user can mark file (updated for team workflow)
        const canMark = isSystemAdmin || await canMarkFile(client, id, userEfiling.id);
        
        // Check if e-signature is required for marking
        // Team members can mark between themselves without e-sign until EE marks to SE
        const requiresSignatureForMarking = !isWithinTeam && !isTeamMemberOfCreator;
        
        // Permission calculations based on requirements
        const permissions = {
            // EDIT: Only admin or file creator (when within team or returned)
            canEdit: canEdit,
            
            // VIEW: All users who have access
            canView: true,
            
            // SIGNATURE: All users can add signatures
            canAddSignature: true,
            
            // COMMENT: All users can add comments
            canAddComment: true,
            
            // ATTACHMENT: All users can add attachments
            canAddAttachment: true,
            
            // ADD PAGE: SE/CE and their assistants can add pages
            canAddPage: canAddPage,
            
            // MARK TO: Updated for team workflow
            canMarkTo: canMark && (!requiresSignatureForMarking || hasSigned),
            
            // APPROVE: Assigned user (must have signed)
            canApprove: isAssigned && hasSigned,
            
            // REJECT: Assigned user (must have signed)
            canReject: isAssigned && hasSigned,
            
            // FORWARD: Assigned user (must have signed) OR admin
            canForward: (isAssigned && hasSigned) || isSystemAdmin,
            
            // Status flags
            isAdmin: isSystemAdmin,
            isCreator,
            isAssigned,
            isMarkedTo,
            isTeamMember: isTeamMemberOfCreator,
            hasSigned,
            creatorHasSigned,
            lastSignedAt,
            
            // Workflow state
            workflow_state: currentState,
            is_within_team: isWithinTeam,
            wasMarkedBackByHigherAuthority,
            isHigherAuthority,
            
            // Requirements
            requiresSignature: requiresSignatureForMarking && !hasSigned,
            requiresCreatorSignature: !creatorHasSigned && currentState !== 'TEAM_INTERNAL',
            
            // Detailed access
            access: {
                file,
                userRole: userEfiling.role_code,
                assignedRole: file.assigned_role_code
            }
        };
        
        return NextResponse.json({ permissions });
        
    } catch (error) {
        console.error('Error checking permissions:', error);
        return NextResponse.json({ 
            error: 'Server error', 
            details: error.message 
        }, { status: 500 });
    } finally {
        if (client && client.release) {
            await client.release();
        }
    }
}

