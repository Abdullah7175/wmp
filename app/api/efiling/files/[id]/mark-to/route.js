import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { logAction, ENTITY_TYPES } from '@/lib/actionLogger';
import { getAllowedRecipients, getSLA, validateGeographicMatch } from '@/lib/efilingGeographicRouting';
import { isCEORole } from '@/lib/efilingSLAManager';
import { auth } from '@/auth';
import { 
    isWithinTeamWorkflow, 
    getTeamMembersForMarking, 
    canMarkFile,
    getAssistantsForManager 
} from '@/lib/efilingTeamManager';
import {
    initializeWorkflowState,
    getWorkflowState,
    updateWorkflowState,
    canMarkFileForward,
    markReturnToCreator,
    startTAT
} from '@/lib/efilingWorkflowStateManager';
import { sendWhatsAppMessage } from '@/lib/whatsappService';

export async function POST(request, { params }) {
    let client;
    try {
        // SECURITY: Call auth() FIRST before reading request body to avoid "body already consumed" error
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { id } = await params;
        const body = await request.json();
        const { user_ids, remarks } = body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 });
        }

        client = await connectToDatabase();
        await client.query('BEGIN');

        // Check if SLA deadline column exists
        let hasSlaDeadline = false;
        try {
            const slaDeadlineCheck = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'efiling_files'
                    AND column_name = 'sla_deadline'
                );
            `);
            hasSlaDeadline = slaDeadlineCheck.rows[0]?.exists || false;
        } catch (checkError) {
            console.warn('Could not check for SLA deadline column:', checkError.message);
        }

        // Get file with geographic information
        const fileRes = await client.query(`
            SELECT f.*, 
                   eu_from.id as from_user_efiling_id,
                   eu_from.user_id as from_user_system_id,
                   eu_from.district_id as from_district_id,
                   eu_from.town_id as from_town_id,
                   eu_from.division_id as from_division_id,
                   eu_from.efiling_role_id as from_role_id
                   ${hasSlaDeadline ? ', f.sla_deadline' : ', NULL as sla_deadline'}
            FROM efiling_files f
            LEFT JOIN efiling_users eu_from ON eu_from.id = f.assigned_to
            WHERE f.id = $1
        `, [id]);
        
        if (fileRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const fileRow = fileRes.rows[0];
        const fromUserEfilingId = fileRow.assigned_to || fileRow.created_by;
        
        // Initialize workflow state if not exists
        if (!fileRow.workflow_state_id) {
            await initializeWorkflowState(client, id, fileRow.created_by);
            // Reload file to get workflow_state_id
            const reloadRes = await client.query(`SELECT workflow_state_id FROM efiling_files WHERE id = $1`, [id]);
            fileRow.workflow_state_id = reloadRes.rows[0]?.workflow_state_id;
        }
        
        // Get current user's efiling info
        const currentUserRes = await client.query(`
            SELECT eu.id, eu.efiling_role_id, eu.department_id, eu.division_id, r.code as role_code
            FROM efiling_users eu
            JOIN users u ON eu.user_id = u.id
            LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
            WHERE u.id = $1 AND eu.is_active = true
        `, [session.user.id]);
        
        // If current user's division_id is NULL, try to get it from role locations
        if (currentUserRes.rows.length > 0 && !currentUserRes.rows[0].division_id && currentUserRes.rows[0].efiling_role_id) {
            try {
                const currentUserRoleLocRes = await client.query(`
                    SELECT division_id, district_id, town_id
                    FROM efiling_role_locations
                    WHERE role_id = $1
                    LIMIT 1
                `, [currentUserRes.rows[0].efiling_role_id]);
                
                if (currentUserRoleLocRes.rows.length > 0) {
                    const roleLoc = currentUserRoleLocRes.rows[0];
                    if (roleLoc.division_id) {
                        currentUserRes.rows[0].division_id = roleLoc.division_id;
                    }
                    if (!currentUserRes.rows[0].district_id && roleLoc.district_id) {
                        currentUserRes.rows[0].district_id = roleLoc.district_id;
                    }
                    if (!currentUserRes.rows[0].town_id && roleLoc.town_id) {
                        currentUserRes.rows[0].town_id = roleLoc.town_id;
                    }
                }
            } catch (roleLocError) {
                console.warn('Could not fetch role locations for current user:', roleLocError.message);
            }
        }

        if (currentUserRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Current user not found in e-filing system' }, { status: 403 });
        }

        const currentUser = currentUserRes.rows[0];
        const currentUserRoleCode = (currentUser.role_code || '').toUpperCase();
        const isCEO = isCEORole(currentUserRoleCode);
        const isCOO = currentUserRoleCode === 'COO';
        
        const workflowState = await getWorkflowState(client, id);

        // ========== E-SIGNATURE VALIDATION (Updated for Team Workflow) ==========
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        
        if (!isAdmin) {
            // Check if e-signature is required for this marking
            // Only one user_id for now (sequential workflow)
            const toUserId = user_ids[0];
            
            const signatureCheck = await canMarkFileForward(client, id, currentUser.id, toUserId);
            
            if (signatureCheck.requiresSignature && !signatureCheck.canMark) {
                await client.query('ROLLBACK');
                return NextResponse.json({
                    error: signatureCheck.reason || 'E-signature required before marking forward',
                    code: 'SIGNATURE_REQUIRED'
                }, { status: 403 });
            }
        }
        // ========== END E-SIGNATURE VALIDATION ==========

        // Pre-compute allowed recipients for validation and populate marking dropdowns
        const allowedRecipients = await getAllowedRecipients(client, {
            fromUserEfilingId,
            fileId: id,
            fileDepartmentId: fileRow.department_id,
            fileDistrictId: fileRow.district_id,
            fileTownId: fileRow.town_id,
            fileDivisionId: fileRow.division_id
        });

        // Always add team members (not just when workflow is team internal)
        // Users should be able to mark to team members for internal workflow
        const creatorTeamMembers = await getTeamMembersForMarking(client, fileRow.created_by);
        creatorTeamMembers.forEach(member => {
            if (!allowedRecipients.find(r => r.id === member.id)) {
                allowedRecipients.push({
                    id: member.id,
                    user_name: member.name,
                    name: member.name,
                    role_code: member.role_code,
                    role_name: member.role_name,
                    is_team_member: true,
                    allowed_level_scope: 'team',
                    allowed_reason: 'TEAM_MEMBER'
                });
            }
        });
        
        // Also get current user's team members if they're different from creator
        if (currentUser.id !== fileRow.created_by) {
            const currentUserTeamMembers = await getTeamMembersForMarking(client, currentUser.id);
            currentUserTeamMembers.forEach(member => {
                if (!allowedRecipients.find(r => r.id === member.id)) {
                    allowedRecipients.push({
                        id: member.id,
                        user_name: member.name,
                        name: member.name,
                        role_code: member.role_code,
                        role_name: member.role_name,
                        is_team_member: true,
                        allowed_level_scope: 'team',
                        allowed_reason: 'TEAM_MEMBER'
                    });
                }
            });
        }
        
        // Always add department's Superintendent Engineer (SE) if current user is in a department
        if (currentUser.department_id != null && currentUser.id != null) {
            const departmentId = parseInt(currentUser.department_id, 10);
            const userId = parseInt(currentUser.id, 10);
            if (!isNaN(departmentId) && !isNaN(userId) && departmentId > 0 && userId > 0) {
                const seRes = await client.query(`
                    SELECT 
                        eu.id,
                        u.name AS user_name,
                        eu.efiling_role_id,
                        r.code AS role_code,
                        r.name AS role_name,
                        eu.department_id,
                        dept.name AS department_name,
                        eu.district_id,
                        d.title AS district_name,
                        eu.town_id,
                        t.town AS town_name,
                        eu.division_id,
                        div.name AS division_name
                    FROM efiling_users eu
                    JOIN users u ON eu.user_id = u.id
                    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                    LEFT JOIN efiling_departments dept ON eu.department_id = dept.id
                    LEFT JOIN district d ON eu.district_id = d.id
                    LEFT JOIN town t ON eu.town_id = t.id
                    LEFT JOIN divisions div ON eu.division_id = div.id
                    WHERE eu.department_id = $1
                    AND eu.is_active = true
                    AND (UPPER(r.code) LIKE '%SE%' OR UPPER(r.code) = 'SE' OR UPPER(r.name) LIKE '%SUPERINTENDENT%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [departmentId, userId]);
                
                // Add all SE users in the department
                seRes.rows.forEach(se => {
                if (!allowedRecipients.find(r => r.id === se.id)) {
                    allowedRecipients.push({
                        id: se.id,
                        user_name: se.user_name,
                        name: se.user_name,
                        role_code: se.role_code,
                        role_name: se.role_name,
                        department_id: se.department_id,
                        department_name: se.department_name,
                        district_id: se.district_id,
                        district_name: se.district_name,
                        town_id: se.town_id,
                        town_name: se.town_name,
                        division_id: se.division_id,
                        division_name: se.division_name,
                        allowed_level_scope: 'department',
                        allowed_reason: 'DEPARTMENT_SE',
                        is_department_se: true
                    });
                }
            });
            }
        }
        
        // Also add SE users from the same division (for RE and other roles that may not have department_id)
        // This allows RE to mark to SE even if they're in the same division but different departments
        if (currentUser.division_id != null && currentUser.id != null) {
            const divisionId = parseInt(currentUser.division_id, 10);
            const userId = parseInt(currentUser.id, 10);
            if (!isNaN(divisionId) && !isNaN(userId) && divisionId > 0 && userId > 0) {
                const seDivisionRes = await client.query(`
                    SELECT 
                        eu.id,
                        u.name AS user_name,
                        eu.efiling_role_id,
                        r.code AS role_code,
                        r.name AS role_name,
                        eu.department_id,
                        dept.name AS department_name,
                        eu.district_id,
                        d.title AS district_name,
                        eu.town_id,
                        t.town AS town_name,
                        eu.division_id,
                        div.name AS division_name
                    FROM efiling_users eu
                    JOIN users u ON eu.user_id = u.id
                    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                    LEFT JOIN efiling_departments dept ON eu.department_id = dept.id
                    LEFT JOIN district d ON eu.district_id = d.id
                    LEFT JOIN town t ON eu.town_id = t.id
                    LEFT JOIN divisions div ON eu.division_id = div.id
                    WHERE eu.division_id = $1
                    AND eu.is_active = true
                    AND (UPPER(r.code) LIKE '%SE%' OR UPPER(r.code) = 'SE' OR UPPER(r.name) LIKE '%SUPERINTENDENT%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [divisionId, userId]);
                
                // Add all SE users in the division (if not already added via department)
                seDivisionRes.rows.forEach(se => {
                    if (!allowedRecipients.find(r => r.id === se.id)) {
                        allowedRecipients.push({
                            id: se.id,
                            user_name: se.user_name,
                            name: se.user_name,
                            role_code: se.role_code,
                            role_name: se.role_name,
                            department_id: se.department_id,
                            department_name: se.department_name,
                            district_id: se.district_id,
                            district_name: se.district_name,
                            town_id: se.town_id,
                            town_name: se.town_name,
                            division_id: se.division_id,
                            division_name: se.division_name,
                            allowed_level_scope: 'division',
                            allowed_reason: 'DIVISION_SE',
                            is_division_se: true
                        });
                    }
                });
            }
        }

        const allowedRecipientMap = new Map(allowedRecipients.map((recipient) => [recipient.id, recipient]));

        // Validate that current user can mark file (updated for team workflow)
        if (!isAdmin) {
            const canMark = await canMarkFile(client, id, currentUser.id);
            if (!canMark) {
                await client.query('ROLLBACK');
                return NextResponse.json({ 
                    error: 'You do not have permission to mark this file' 
                }, { status: 403 });
            }
        }

        try {
            // Update file status from DRAFT to IN_PROGRESS if needed
            await client.query(`
                UPDATE efiling_files 
                SET status_id = (
                    SELECT id FROM efiling_file_status WHERE code = 'IN_PROGRESS'
                ), updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND status_id = (
                    SELECT id FROM efiling_file_status WHERE code = 'DRAFT'
                )
                RETURNING id
            `, [id]);

            // Process only first user_id (sequential workflow - one at a time)
            const userId = user_ids[0];
            const targetRecipient = allowedRecipientMap.get(userId);

            if (!targetRecipient) {
                throw new Error('Selected user is not allowed based on SLA matrix/location rules');
            }

            const target = await client.query(`
                SELECT eu.id, eu.department_id, eu.efiling_role_id, 
                       eu.district_id, eu.town_id, eu.division_id,
                       r.code as role_code
                FROM efiling_users eu
                LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                WHERE eu.id = $1 AND eu.is_active = true
            `, [userId]);
            
            if (target.rows.length === 0) {
                throw new Error('Target user not found or inactive');
            }
            
            let targetUser = target.rows[0];
            const toRoleCode = (targetUser.role_code || '').toUpperCase();
            
            // If user's personal division_id is NULL, try to get it from role locations
            if (!targetUser.division_id && targetUser.efiling_role_id) {
                try {
                    const roleLocRes = await client.query(`
                        SELECT division_id, district_id, town_id
                        FROM efiling_role_locations
                        WHERE role_id = $1
                        LIMIT 1
                    `, [targetUser.efiling_role_id]);
                    
                    if (roleLocRes.rows.length > 0) {
                        const roleLoc = roleLocRes.rows[0];
                        // Use role location as fallback if user's personal location is NULL
                        if (!targetUser.division_id && roleLoc.division_id) {
                            targetUser.division_id = roleLoc.division_id;
                        }
                        if (!targetUser.district_id && roleLoc.district_id) {
                            targetUser.district_id = roleLoc.district_id;
                        }
                        if (!targetUser.town_id && roleLoc.town_id) {
                            targetUser.town_id = roleLoc.town_id;
                        }
                    }
                } catch (roleLocError) {
                    console.warn('Could not fetch role locations for target user:', roleLocError.message);
                }
            }

            // Check if movement is within team workflow
            const isTeamInternal = await isWithinTeamWorkflow(client, id, currentUser.id, userId);
            
            // Check if this is a return to creator
            const isReturnToCreator = (userId === fileRow.created_by) && 
                                     workflowState && 
                                     workflowState.current_state === 'EXTERNAL';
            
            // Check if this is moving to external (SE or higher)
            const externalRoles = ['SE', 'CE', 'CFO', 'COO', 'CEO'];
            const isMovingToExternal = externalRoles.includes(toRoleCode) && 
                                       !isTeamInternal &&
                                       !isReturnToCreator;
            
            // Determine new workflow state
            let newState = workflowState?.current_state || 'TEAM_INTERNAL';
            let shouldStartTAT = false;
            
            if (isReturnToCreator) {
                newState = 'RETURNED_TO_CREATOR';
                await markReturnToCreator(client, id, fileRow.created_by);
            } else if (isMovingToExternal) {
                newState = 'EXTERNAL';
                shouldStartTAT = true;
                await startTAT(client, id);
            } else if (isTeamInternal) {
                newState = 'TEAM_INTERNAL';
                // Update workflow state to keep it within team
                await updateWorkflowState(client, id, 'TEAM_INTERNAL', userId, true, false);
            }

            // Validate geographic match (CEO/COO bypass, skip for team internal, skip for organizational scopes)
            if (!isCEO && !isCOO && !isTeamInternal) {
                const expectedScope = targetRecipient.allowed_level_scope || 'district';
                
                // Skip geographic validation for organizational scopes (department, team)
                // These are organizational, not geographic, so geographic matching doesn't apply
                const organizationalScopes = ['department', 'team', 'global'];
                const isOrganizationalScope = organizationalScopes.includes(expectedScope.toLowerCase());
                
                if (!isOrganizationalScope) {
                    // Get file location (use role location as fallback if file division_id is NULL)
                    let fileDivisionId = fileRow.division_id;
                    let fileDistrictId = fileRow.district_id;
                    let fileTownId = fileRow.town_id;
                    
                    // If file has no division_id, try to get it from creator's role location
                    if (!fileDivisionId && fileRow.from_role_id) {
                        try {
                            const fileRoleLocRes = await client.query(`
                                SELECT division_id, district_id, town_id
                                FROM efiling_role_locations
                                WHERE role_id = $1
                                LIMIT 1
                            `, [fileRow.from_role_id]);
                            
                            if (fileRoleLocRes.rows.length > 0) {
                                const fileRoleLoc = fileRoleLocRes.rows[0];
                                if (!fileDivisionId && fileRoleLoc.division_id) {
                                    fileDivisionId = fileRoleLoc.division_id;
                                }
                                if (!fileDistrictId && fileRoleLoc.district_id) {
                                    fileDistrictId = fileRoleLoc.district_id;
                                }
                                if (!fileTownId && fileRoleLoc.town_id) {
                                    fileTownId = fileRoleLoc.town_id;
                                }
                            }
                        } catch (fileRoleLocError) {
                            console.warn('Could not fetch role locations for file creator:', fileRoleLocError.message);
                        }
                    }
                    
                    // For division scope, check if both users' roles have the same division_id in role_locations
                    // This allows marking when both roles are in the same division even if personal division_id is NULL
                    if (expectedScope.toLowerCase() === 'division' && currentUser.efiling_role_id && targetUser.efiling_role_id) {
                        try {
                            const roleDivisionsRes = await client.query(`
                                SELECT 
                                    rl1.division_id as from_role_division,
                                    rl2.division_id as to_role_division
                                FROM efiling_role_locations rl1
                                CROSS JOIN efiling_role_locations rl2
                                WHERE rl1.role_id = $1 AND rl2.role_id = $2
                                AND rl1.division_id IS NOT NULL 
                                AND rl2.division_id IS NOT NULL
                                AND rl1.division_id = rl2.division_id
                                LIMIT 1
                            `, [currentUser.efiling_role_id, targetUser.efiling_role_id]);
                            
                            if (roleDivisionsRes.rows.length > 0) {
                                // Both roles have the same division_id, allow the marking
                                console.log('Allowing marking: Both users\' roles have matching division_id from role_locations');
                            } else {
                                // Roles don't have matching division_ids, check regular geographic match
                                const isValid = validateGeographicMatch(
                                    {
                                        district_id: fileDistrictId,
                                        town_id: fileTownId,
                                        division_id: fileDivisionId
                                    },
                                    {
                                        district_id: targetUser.district_id,
                                        town_id: targetUser.town_id,
                                        division_id: targetUser.division_id
                                    },
                                    expectedScope
                                );

                                if (!isValid) {
                                    throw new Error(
                                        `Geographic mismatch: File location does not match target user location. ` +
                                        `Required scope: ${expectedScope}`
                                    );
                                }
                            }
                        } catch (roleDivError) {
                            console.warn('Error checking role divisions:', roleDivError.message);
                            // Fall through to regular validation
                            const isValid = validateGeographicMatch(
                                {
                                    district_id: fileDistrictId,
                                    town_id: fileTownId,
                                    division_id: fileDivisionId
                                },
                                {
                                    district_id: targetUser.district_id,
                                    town_id: targetUser.town_id,
                                    division_id: targetUser.division_id
                                },
                                expectedScope
                            );

                            if (!isValid) {
                                throw new Error(
                                    `Geographic mismatch: File location does not match target user location. ` +
                                    `Required scope: ${expectedScope}`
                                );
                            }
                        }
                    } else {
                        // Regular validation for non-division scopes
                        const isValid = validateGeographicMatch(
                            {
                                district_id: fileDistrictId,
                                town_id: fileTownId,
                                division_id: fileDivisionId
                            },
                            {
                                district_id: targetUser.district_id,
                                town_id: targetUser.town_id,
                                division_id: targetUser.division_id
                            },
                            expectedScope
                        );

                        if (!isValid) {
                            throw new Error(
                                `Geographic mismatch: File location does not match target user location. ` +
                                `Required scope: ${expectedScope}`
                            );
                        }
                    }
                }
            }

            // Get historical user information for from_user (at time of action)
            const fromUserInfo = await client.query(`
                SELECT u.name, eu.designation, eu.town_id, eu.division_id
                FROM efiling_users eu
                LEFT JOIN users u ON eu.user_id = u.id
                WHERE eu.id = $1
            `, [fromUserEfilingId]);
            const fromUserData = fromUserInfo.rows[0] || {};

            // Get historical user information for to_user (at time of action)
            const toUserInfo = await client.query(`
                SELECT u.name, eu.designation, eu.town_id, eu.division_id
                FROM efiling_users eu
                LEFT JOIN users u ON eu.user_id = u.id
                WHERE eu.id = $1
            `, [userId]);
            const toUserData = toUserInfo.rows[0] || {};

            // Create movement record with team workflow flags and historical user info
            // Ensure all parameters are properly typed to avoid PostgreSQL type inference issues
            const movementRes = await client.query(`
                INSERT INTO efiling_file_movements (
                    file_id, from_user_id, to_user_id, 
                    from_department_id, to_department_id, 
                    action_type, remarks,
                    is_team_internal, is_return_to_creator, tat_started,
                    from_user_name, from_user_designation, from_user_town_id, from_user_division_id,
                    to_user_name, to_user_designation, to_user_town_id, to_user_division_id
                )
                VALUES ($1::INTEGER, $2::INTEGER, $3::INTEGER, $4::INTEGER, $5::INTEGER, $6::VARCHAR, $7::TEXT, $8::BOOLEAN, $9::BOOLEAN, $10::BOOLEAN, $11::VARCHAR, $12::VARCHAR, $13::INTEGER, $14::INTEGER, $15::VARCHAR, $16::VARCHAR, $17::INTEGER, $18::INTEGER)
                RETURNING id
            `, [
                parseInt(id) || null, 
                parseInt(fromUserEfilingId) || null, 
                parseInt(userId) || null, 
                fileRow.department_id ? parseInt(fileRow.department_id) : null,
                targetUser.department_id ? parseInt(targetUser.department_id) : null,
                'MARK_TO', 
                remarks && remarks.trim() ? remarks.trim() : null,
                Boolean(isTeamInternal),
                Boolean(isReturnToCreator),
                Boolean(shouldStartTAT),
                fromUserData.name ? String(fromUserData.name) : null,
                fromUserData.designation ? String(fromUserData.designation) : null,
                fromUserData.town_id ? parseInt(fromUserData.town_id) : null,
                fromUserData.division_id ? parseInt(fromUserData.division_id) : null,
                toUserData.name ? String(toUserData.name) : null,
                toUserData.designation ? String(toUserData.designation) : null,
                toUserData.town_id ? parseInt(toUserData.town_id) : null,
                toUserData.division_id ? parseInt(toUserData.division_id) : null
            ]);
            
            const movements = [movementRes];

            // Update file assignment
            const newAssignee = userId;
            
            // Calculate SLA deadline from SLA matrix (only for external workflow and if SLA deadline column exists)
            let slaDeadline = hasSlaDeadline ? (fileRow.sla_deadline || null) : null;
            
            if (hasSlaDeadline && shouldStartTAT && !isTeamInternal) {
                try {
                    // Get role codes for SLA lookup
                    const lastTargetRes = await client.query(`
                        SELECT eu.efiling_role_id, r.code as role_code
                        FROM efiling_users eu
                        LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                        WHERE eu.id = $1
                    `, [newAssignee]);
                    
                    if (lastTargetRes.rows.length > 0) {
                        const lastTargetRoleCode = lastTargetRes.rows[0].role_code || '';
                        const slaHours = await getSLA(client, currentUserRoleCode, lastTargetRoleCode);
                        
                        const deadline = new Date();
                        deadline.setHours(deadline.getHours() + slaHours);
                        slaDeadline = deadline.toISOString();
                    }
                } catch (slaError) {
                    console.warn('Error computing SLA deadline:', slaError.message);
                    // Continue without SLA deadline if computation fails
                }
            }
            
            // Update file assignment and workflow state
            const updateQuery = hasSlaDeadline
                ? `UPDATE efiling_files
                   SET assigned_to = $1, 
                       updated_at = CURRENT_TIMESTAMP,
                       sla_deadline = CASE 
                           WHEN $2 IS NOT NULL THEN $2 
                           ELSE sla_deadline 
                       END
                   WHERE id = $3`
                : `UPDATE efiling_files
                   SET assigned_to = $1, 
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $2`;
            
            const updateParams = hasSlaDeadline
                ? [newAssignee, shouldStartTAT ? slaDeadline : null, id]
                : [newAssignee, id];
            
            await client.query(updateQuery, updateParams);
            
            // Update workflow state
            await updateWorkflowState(client, id, newState, newAssignee, isTeamInternal, shouldStartTAT);
            
            // Special handling: If marked to SE/CE, also assign to their assistants (for simultaneous visibility)
            if ((toRoleCode === 'SE' || toRoleCode === 'CE') && !isTeamInternal) {
                const assistants = await getAssistantsForManager(client, userId);
                // Note: We don't create separate movements for assistants, but they will see the file
                // The file is assigned to SE/CE, and assistants can see it via their manager relationship
            }

            // Get target user info for notification (including phone number for WhatsApp)
            const lastTarget = await client.query(`
                SELECT eu.id, u.name as user_name, u.contact_number, r.code as role_code
                FROM efiling_users eu
                LEFT JOIN users u ON eu.user_id = u.id
                LEFT JOIN efiling_roles r ON r.id = eu.efiling_role_id
                WHERE eu.id = $1
            `, [newAssignee]);
            
            const assigneeDisplayName = lastTarget.rows[0]?.user_name || 'User';
            const assigneeRole = (lastTarget.rows[0]?.role_code || '').toUpperCase();
            const assigneePhone = lastTarget.rows[0]?.contact_number;

            // Notify new assignee
            try {
                await client.query(`
                    INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                    VALUES ($1, $2, $3, $4, 'normal', true, NOW())
                `, [newAssignee, id, 'file_assigned', `A file has been assigned to you: File ${fileRow.file_number || id}`]);
            } catch (e) {
                console.warn('Notify assignee on mark-to failed', e);
            }
            
            // Send WhatsApp notification to the assigned user
            if (assigneePhone && !isTeamInternal) {
                try {
                    // Get final SLA deadline after update
                    let finalSlaDeadline = slaDeadline;
                    if (hasSlaDeadline) {
                        const finalDeadlineRes = await client.query(`
                            SELECT sla_deadline FROM efiling_files WHERE id = $1
                        `, [id]);
                        finalSlaDeadline = finalDeadlineRes.rows[0]?.sla_deadline || null;
                    }
                    
                    // Calculate TAT time remaining
                    let tatMessage = '';
                    if (hasSlaDeadline && finalSlaDeadline) {
                        const deadline = new Date(finalSlaDeadline);
                        const now = new Date();
                        const timeRemaining = deadline.getTime() - now.getTime();
                        
                        if (timeRemaining > 0) {
                            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                            
                            let timeStr = '';
                            if (days > 0) {
                                timeStr = `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
                            } else if (hours > 0) {
                                timeStr = `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
                            } else {
                                timeStr = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
                            }
                            
                            const deadlineStr = deadline.toLocaleString('en-PK', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            
                            tatMessage = `\n\n⏰ TAT Deadline: ${deadlineStr}\n⏳ Time Remaining: ${timeStr}`;
                        } else {
                            tatMessage = `\n\n⚠️ TAT Deadline has passed. Please complete this file urgently.`;
                        }
                    }
                    
                    // Get file subject for the message
                    const fileSubject = fileRow.subject || 'N/A';
                    const fileNumber = fileRow.file_number || `#${id}`;
                    
                    // Get the person who marked the file
                    const fromUserInfo = await client.query(`
                        SELECT u.name, eu.designation, r.code as role_code
                        FROM efiling_users eu
                        LEFT JOIN users u ON eu.user_id = u.id
                        LEFT JOIN efiling_roles r ON r.id = eu.efiling_role_id
                        WHERE eu.id = $1
                    `, [currentUser.id]);
                    
                    const fromUserName = fromUserInfo.rows[0]?.name || 'User';
                    const fromUserDesignation = fromUserInfo.rows[0]?.designation || '';
                    const fromUserRole = (fromUserInfo.rows[0]?.role_code || '').toUpperCase();
                    const fromUserDisplay = fromUserDesignation ? `${fromUserName} (${fromUserDesignation})` : fromUserName;
                    
                    const whatsappMessage = `📋 *File Assigned to You*\n\n` +
                        `File Number: ${fileNumber}\n` +
                        `Subject: ${fileSubject}\n` +
                        `Marked by: ${fromUserDisplay} (${fromUserRole})${tatMessage}\n\n` +
                        `Please review and take necessary action on this file.\n\n` +
                        `Thank you,\nE-Filing System`;
                    
                    const whatsappResult = await sendWhatsAppMessage(assigneePhone, whatsappMessage);
                    
                    if (whatsappResult.success) {
                        console.log(`WhatsApp notification sent to ${assigneeDisplayName} (${assigneePhone}) for file ${fileNumber}`);
                    } else {
                        console.warn(`Failed to send WhatsApp notification to ${assigneeDisplayName}:`, whatsappResult.error);
                    }
                } catch (whatsappError) {
                    // Don't fail the mark-to operation if WhatsApp fails
                    console.error('Error sending WhatsApp notification on mark-to:', whatsappError);
                }
            }
            
            // Notify SE/CE assistants if file is marked to SE/CE
            if ((toRoleCode === 'SE' || toRoleCode === 'CE') && !isTeamInternal) {
                try {
                    const assistants = await getAssistantsForManager(client, userId);
                    for (const assistant of assistants) {
                        await client.query(`
                            INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                            VALUES ($1, $2, $3, $4, 'normal', false, NOW())
                        `, [assistant.team_member_id, id, 'file_assigned', 
                            `A file has been assigned to your manager (${assigneeDisplayName}): File ${fileRow.file_number || id}`]);
                    }
                } catch (e) {
                    console.warn('Notify assistants on mark-to failed', e);
                }
            }

            // Notify creator that the file has been forwarded
            try {
                const createdBy = fileRow.created_by;
                if (createdBy && createdBy !== newAssignee) {
                await client.query(`
                        INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                        VALUES ($1, $2, $3, $4, 'low', false, NOW())
                    `, [createdBy, id, 'file_forwarded', `Your file has been marked to ${assigneeDisplayName} (${assigneeRole})`]);
                }
            } catch (e) {
                console.warn('Notify creator on mark-to failed', e);
            }

            await client.query('COMMIT');

            await logAction(request, 'MARK_TO', ENTITY_TYPES.EFILING_FILE, {
                entityId: id,
                entityName: `File ${fileRow.file_number || id}`,
                details: { user_ids, remarks, movements_created: movements.length }
            });

            return NextResponse.json({ 
                message: `File marked successfully`,
                movement: movements[0].rows[0],
                workflow_state: newState,
                is_team_internal: isTeamInternal,
                tat_started: shouldStartTAT,
                allowed_recipients: allowedRecipients
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}

export async function GET(request, { params }) {
    let client;
    try {
        // SECURITY: Require authentication
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        client = await connectToDatabase();

        // SECURITY: Check file access
        const { checkFileAccess } = await import('@/lib/authMiddleware');
        const userId = parseInt(session.user.id);
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        
        const hasAccess = await checkFileAccess(client, parseInt(id), userId, isAdmin);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Forbidden - You do not have access to this file' },
                { status: 403 }
            );
        }
        
        // Get file with geographic info
        const fileRes = await client.query(`
            SELECT f.*, eu.id as from_user_efiling_id
            FROM efiling_files f
            LEFT JOIN efiling_users eu ON eu.id = f.assigned_to
            WHERE f.id = $1
        `, [id]);
        
        if (fileRes.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const file = fileRes.rows[0];
        const fromUserEfilingId = file.assigned_to || file.created_by;
        
        // Get current user's efiling info to check department and division
        const currentUserRes = await client.query(`
            SELECT eu.id, eu.department_id, eu.division_id, eu.efiling_role_id, r.code as role_code
            FROM efiling_users eu
            JOIN users u ON eu.user_id = u.id
            LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
            WHERE u.id = $1 AND eu.is_active = true
        `, [session.user.id]);

        if (currentUserRes.rows.length === 0) {
            return NextResponse.json({ error: 'Current user not found in e-filing system' }, { status: 403 });
        }

        const currentUser = currentUserRes.rows[0];
        const currentUserEfilingId = currentUser.id;
        const currentUserDepartmentId = currentUser.department_id;
        const currentUserDivisionId = currentUser.division_id;
        
        // Get allowed recipients using geographic routing
        let allowedRecipients = await getAllowedRecipients(client, {
            fromUserEfilingId: fromUserEfilingId || currentUserEfilingId,
            fileId: id,
            fileDepartmentId: file.department_id,
            fileTypeId: file.file_type_id,
            fileDistrictId: file.district_id,
            fileTownId: file.town_id,
            fileDivisionId: file.division_id
        });
        
        // Always add team members (not just when workflow is team internal)
        // Users should be able to mark to team members for internal workflow
        // Get team members for both creator and current user (if they're different)
        const creatorTeamMembers = await getTeamMembersForMarking(client, file.created_by);
        creatorTeamMembers.forEach(member => {
            if (!allowedRecipients.find(r => r.id === member.id)) {
                allowedRecipients.push({
                    id: member.id,
                    user_name: member.name,
                    name: member.name,
                    role_code: member.role_code,
                    role_name: member.role_name,
                    is_team_member: true,
                    allowed_level_scope: 'team',
                    allowed_reason: 'TEAM_MEMBER'
                });
            }
        });
        
        // Also get current user's team members if they're different from creator
        if (currentUserEfilingId !== file.created_by) {
            const currentUserTeamMembers = await getTeamMembersForMarking(client, currentUserEfilingId);
            currentUserTeamMembers.forEach(member => {
                if (!allowedRecipients.find(r => r.id === member.id)) {
                    allowedRecipients.push({
                        id: member.id,
                        user_name: member.name,
                        name: member.name,
                        role_code: member.role_code,
                        role_name: member.role_name,
                        is_team_member: true,
                        allowed_level_scope: 'team',
                        allowed_reason: 'TEAM_MEMBER'
                    });
                }
            });
        }
        
        // Always add department's Superintendent Engineer (SE) if user is in a department
        if (currentUserDepartmentId != null && currentUserEfilingId != null) {
            const departmentId = parseInt(currentUserDepartmentId, 10);
            const userId = parseInt(currentUserEfilingId, 10);
            if (!isNaN(departmentId) && !isNaN(userId) && departmentId > 0 && userId > 0) {
                const seRes = await client.query(`
                    SELECT 
                        eu.id,
                        u.name AS user_name,
                        eu.efiling_role_id,
                        r.code AS role_code,
                        r.name AS role_name,
                        eu.department_id,
                        dept.name AS department_name,
                        eu.district_id,
                        d.title AS district_name,
                        eu.town_id,
                        t.town AS town_name,
                        eu.division_id,
                        div.name AS division_name
                    FROM efiling_users eu
                    JOIN users u ON eu.user_id = u.id
                    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                    LEFT JOIN efiling_departments dept ON eu.department_id = dept.id
                    LEFT JOIN district d ON eu.district_id = d.id
                    LEFT JOIN town t ON eu.town_id = t.id
                    LEFT JOIN divisions div ON eu.division_id = div.id
                    WHERE eu.department_id = $1
                    AND eu.is_active = true
                    AND (UPPER(r.code) LIKE '%SE%' OR UPPER(r.code) = 'SE' OR UPPER(r.name) LIKE '%SUPERINTENDENT%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [departmentId, userId]);
                
                // Add all SE users in the department (there might be multiple)
                seRes.rows.forEach(se => {
                if (!allowedRecipients.find(r => r.id === se.id)) {
                    allowedRecipients.push({
                        id: se.id,
                        user_name: se.user_name,
                        name: se.user_name,
                        role_code: se.role_code,
                        role_name: se.role_name,
                        department_id: se.department_id,
                        department_name: se.department_name,
                        district_id: se.district_id,
                        district_name: se.district_name,
                        town_id: se.town_id,
                        town_name: se.town_name,
                        division_id: se.division_id,
                        division_name: se.division_name,
                        allowed_level_scope: 'department',
                        allowed_reason: 'DEPARTMENT_SE',
                        is_department_se: true
                    });
                }
            });
            }
        }
        
        // Also add SE users from the same division (for RE and other roles that may not have department_id)
        // This allows RE to mark to SE even if they're in the same division but different departments
        if (currentUserDivisionId != null && currentUserEfilingId != null) {
            const divisionId = parseInt(currentUserDivisionId, 10);
            const userId = parseInt(currentUserEfilingId, 10);
            if (!isNaN(divisionId) && !isNaN(userId) && divisionId > 0 && userId > 0) {
                const seDivisionRes = await client.query(`
                    SELECT 
                        eu.id,
                        u.name AS user_name,
                        eu.efiling_role_id,
                        r.code AS role_code,
                        r.name AS role_name,
                        eu.department_id,
                        dept.name AS department_name,
                        eu.district_id,
                        d.title AS district_name,
                        eu.town_id,
                        t.town AS town_name,
                        eu.division_id,
                        div.name AS division_name
                    FROM efiling_users eu
                    JOIN users u ON eu.user_id = u.id
                    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                    LEFT JOIN efiling_departments dept ON eu.department_id = dept.id
                    LEFT JOIN district d ON eu.district_id = d.id
                    LEFT JOIN town t ON eu.town_id = t.id
                    LEFT JOIN divisions div ON eu.division_id = div.id
                    WHERE eu.division_id = $1
                    AND eu.is_active = true
                    AND (UPPER(r.code) LIKE '%SE%' OR UPPER(r.code) = 'SE' OR UPPER(r.name) LIKE '%SUPERINTENDENT%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [divisionId, userId]);
                
                // Add all SE users in the division (if not already added via department)
                seDivisionRes.rows.forEach(se => {
                    if (!allowedRecipients.find(r => r.id === se.id)) {
                        allowedRecipients.push({
                            id: se.id,
                            user_name: se.user_name,
                            name: se.user_name,
                            role_code: se.role_code,
                            role_name: se.role_name,
                            department_id: se.department_id,
                            department_name: se.department_name,
                            district_id: se.district_id,
                            district_name: se.district_name,
                            town_id: se.town_id,
                            town_name: se.town_name,
                            division_id: se.division_id,
                            division_name: se.division_name,
                            allowed_level_scope: 'division',
                            allowed_reason: 'DIVISION_SE',
                            is_division_se: true
                        });
                    }
                });
            }
        }
        
        // Get workflow state for display purposes
        const workflowState = await getWorkflowState(client, id);
        
        // Also get movement history
        const movementsRes = await client.query(`
            SELECT 
                fm.*,
                u1.name as from_user_name,
                u2.name as to_user_name,
                d1.name as from_department_name,
                d2.name as to_department_name
            FROM efiling_file_movements fm
            LEFT JOIN efiling_users eu1 ON fm.from_user_id = eu1.id
            LEFT JOIN users u1 ON eu1.user_id = u1.id
            LEFT JOIN efiling_users eu2 ON fm.to_user_id = eu2.id
            LEFT JOIN users u2 ON eu2.user_id = u2.id
            LEFT JOIN efiling_departments d1 ON fm.from_department_id = d1.id
            LEFT JOIN efiling_departments d2 ON fm.to_department_id = d2.id
            WHERE fm.file_id = $1
            ORDER BY fm.created_at DESC
        `, [id]);
        
        return NextResponse.json({ 
            file_id: id, 
            allowed_recipients: allowedRecipients,
            movements: movementsRes.rows 
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
