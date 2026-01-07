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

// Role categorization functions for mark-to visibility rules (shared by POST and GET routes)
const isGlobalRole = (roleCode) => {
    if (!roleCode) return false;
    const code = roleCode.toUpperCase();
    // Global roles: SE, CE, DCE, CEO, CFO, COO, CIA, CCO, DMD, Director, Committee/MD/BILLING/BUDGET/IAO-II
    // Check DCE first to avoid conflicts with CE check
    if (code === 'DIRECTOR_MEDICAL_SERVICES' || code.startsWith('DIRECTOR_MEDICAL_SERVICES_') || (code.includes('DIRECTOR_MEDICAL_SERVICES') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'MEDICAL_SCRUTINY_COMMITTEE' || code.startsWith('MEDICAL_SCRUTINY_COMMITTEE_') || (code.includes('MEDICAL_SCRUTINY_COMMITTEE') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'CHIEF_INTERNAL_AUDITOR' || code.startsWith('CHIEF_INTERNAL_AUDITOR_') || (code.includes('CHIEF_INTERNAL_AUDITOR') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code == 'CONSULTANT' || code.startsWith('CONSULTANT_') || (code.includes('CONSULTANT') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code == 'DIRECTOR' || code.startsWith('DIRECTOR_') || (code.includes('DIRECTOR') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'CON' || code.startsWith('CON_') || (code.includes('CON') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'COMMITTEE' || code.startsWith('COMMITTEE_') || (code.includes('COMMITTEE') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'COMMITE' || code.startsWith('COMMITE_') || (code.includes('COMMITE') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'MD' || code.startsWith('MD_') || (code.includes('MD') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'MANAGING_DIRECTOR' || code.startsWith('MANAGING_DIRECTOR_') || (code.includes('MANAGING_DIRECTOR') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'BILLING' || code.startsWith('BILLING_') || (code.includes('BILLING') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'BUDGET' || code.startsWith('BUDGET_') || (code.includes('BUDGET') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'IAO-II' || code.startsWith('IAO-II_') || (code.includes('IAO-II') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'DCE' || code.startsWith('DCE_') || (code.includes('DCE') && !code.includes('ADLFA'))) {
        return true;
    }
    // Check SE
    if (code === 'SE' || code.startsWith('SE_') || code.includes('SE')) {
        return true;
    }
    // Check CE (but not AEE and not DCE)
    if ((code === 'CE' || code.startsWith('CE_') || code.includes('CE')) && !code.includes('AEE') && !code.includes('DCE')) {
        return true;
    }
    // Other global roles
    return code === 'CEO' || code.includes('CEO') ||
           code === 'CFO' || code.includes('CFO') ||
           code === 'COO' || code.includes('COO') ||
           code === 'CIA' || code.includes('CIA') || code.includes('CHIEF_INTERNAL_AUDITOR') ||
           code === 'CCO' || code.includes('CCO') ||
           code === 'DMD' || code.includes('DMD') || code.includes('DEPUTY_MANAGING_DIRECTOR') ||
           (code.includes('DIRECTOR') && !code.includes('ASSISTANT')) ||
           code.includes('COMMITTEE') ||
           code.includes('COMMITE') ||
           code === 'MD' || code.includes('MANAGING_DIRECTOR') ||
           code.includes('BILLING') ||
           code.includes('BUDGET') ||
           code.includes('IAO-II');
};

const isMidLevelRole = (roleCode) => {
    if (!roleCode) return false;
    const code = roleCode.toUpperCase();
    // Mid-level roles: XEN, RE, Admin officer, EE
    return code.includes('XEN') || 
           (code.includes('RE') && !code.includes('AEE')) || 
           (code.includes('EXECUTIVE_ENGINEER') && !code.includes('ASSISTANT')) ||
           (code.includes('EE') && !code.includes('AEE')) ||
           code.includes('ADMIN_OFFICER') || code.includes('ADMIN OFFICER') ||
           code.includes('ADMINISTRATIVE_OFFICER') || code.includes('ADMINISTRATIVE OFFICER');
};

const isLowerLevelRole = (roleCode) => {
    if (!roleCode) return false;
    const code = roleCode.toUpperCase();
    // Lower-level roles: AEE, AOO, DAO, Sub-engineer
    return (code.includes('AEE') && !code.includes('SE') && !code.includes('CE')) ||
           code === 'AOO' || code.includes('AOO') ||
           code === 'DAO' || code.includes('DAO') ||
           code.includes('SUB-ENGINEER') || code.includes('SUBENGINEER') || code.includes('SUB_ENGINEER') ||
           code.includes('SUB-ENGR') || code.includes('SUBENGR');
};

const isDepartmentManagerRole = (roleCode) => {
    if (!roleCode) return false;
    const code = roleCode.toUpperCase();
    // Department manager roles that lower-level users can see: XEN, EE, RE, Admin officer
    return code.includes('XEN') || 
           (code.includes('RE') && !code.includes('AEE')) || 
           (code.includes('EXECUTIVE_ENGINEER') && !code.includes('ASSISTANT')) ||
           (code.includes('EE') && !code.includes('AEE')) ||
           code.includes('ADMIN_OFFICER') || code.includes('ADMIN OFFICER') ||
           code.includes('ADMINISTRATIVE_OFFICER') || code.includes('ADMINISTRATIVE OFFICER');
};

/**
 * Check if a role can bypass geographic validation when marking files
 * These roles can mark files to anyone regardless of geographic restrictions
 * @param {string} roleCode - Role code from efiling_roles
 * @returns {boolean}
 */
const canBypassGeographicValidation = (roleCode) => {
    if (!roleCode) return false;
    const code = roleCode.toUpperCase();
    
    // Check specific roles that can bypass geographic validation
    // SE, DCE, CE, CEO, CFO, COO, CCO, CIA, ADLFA, BUDGET, BILLING, DIRECTOR, etc.
    
    // Check SE (Superintendent Engineer)
    if (code === 'SE' || code.startsWith('SE_') || code.includes('SE')) {
        return true;
    }
    
    // Check DCE (Deputy Chief Engineer) - check before CE to avoid conflicts
    if (code === 'DCE' || code.startsWith('DCE_') || (code.includes('DCE') && !code.includes('ADLFA'))) {
        return true;
    }
    
    // Check CE (Chief Engineer) - but not AEE and not DCE
    if ((code === 'CE' || code.startsWith('CE_') || code.includes('CE')) && !code.includes('AEE') && !code.includes('DCE')) {
        return true;
    }
    
    // Check CEO, CFO, COO, CCO, CIA
    if (code === 'CEO' || code.includes('CEO')) {
        return true;
    }
    if (code === 'CFO' || code.includes('CFO')) {
        return true;
    }
    if (code === 'COO' || code.includes('COO')) {
        return true;
    }
    if (code === 'CCO' || code.includes('CCO')) {
        return true;
    }
    if (code === 'CIA' || code.includes('CIA') || code.includes('CHIEF_INTERNAL_AUDITOR')) {
        return true;
    }
    
    // Check ADLFA
    if (code.includes('ADLFA')) {
        return true;
    }
    
    // Check CON/CONSULTANT - Consultants can mark to anyone
    if (code === 'CON' || code.startsWith('CON_') || (code.includes('CON') && !code.includes('ADLFA'))) {
        return true;
    }
    if (code === 'CONSULTANT' || code.startsWith('CONSULTANT_') || (code.includes('CONSULTANT') && !code.includes('ADLFA'))) {
        return true;
    }
    
    // Check BUDGET
    if (code === 'BUDGET' || code.startsWith('BUDGET_') || code.includes('BUDGET')) {
        return true;
    }
    
    // Check BILLING
    if (code === 'BILLING' || code.startsWith('BILLING_') || code.includes('BILLING')) {
        return true;
    }
    
    // Check DIRECTOR (but not ADLFA or ASSISTANT)
    if ((code === 'DIRECTOR' || code.startsWith('DIRECTOR_') || code.includes('DIRECTOR')) && 
        !code.includes('ADLFA') && !code.includes('ASSISTANT')) {
        return true;
    }
    
    return false;
};

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

        // Validate and parse file ID
        const fileId = parseInt(String(id), 10);
        if (isNaN(fileId) || fileId <= 0) {
            return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
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
        `, [fileId]);
        
        if (fileRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const fileRow = fileRes.rows[0];
        
        // Helper function to safely parse integers (define early for use throughout)
        // Handles BigInt, strings, numbers, and null/undefined
        const safeParseInt = (value) => {
            if (value === null || value === undefined || value === '') return null;
            // Handle BigInt (PostgreSQL returns bigint as BigInt objects)
            if (typeof value === 'bigint') {
                return Number(value);
            }
            // Handle number type
            if (typeof value === 'number') {
                return isNaN(value) ? null : Math.floor(value);
            }
            // Handle objects that might have a valueOf or toString method
            if (typeof value === 'object' && value !== null) {
                // Try to convert object to number
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    return Math.floor(numValue);
                }
                // If object has a valueOf method, try that
                if (typeof value.valueOf === 'function') {
                    const val = value.valueOf();
                    if (typeof val === 'number' && !isNaN(val)) {
                        return Math.floor(val);
                    }
                }
                return null;
            }
            // Handle string type
            const parsed = parseInt(String(value), 10);
            return isNaN(parsed) ? null : parsed;
        };
        
        // Get fromUserEfilingId - prefer assigned_to, fallback to created_by
        // Use nullish coalescing to handle 0 values correctly
        const fromUserEfilingIdRaw = fileRow.assigned_to ?? fileRow.created_by;
        const fromUserEfilingId = safeParseInt(fromUserEfilingIdRaw);
        
        // Debug log to check fileRow values
        console.log('File row data:', {
            file_id: fileId,
            assigned_to: fileRow.assigned_to,
            created_by: fileRow.created_by,
            fromUserEfilingIdRaw: fromUserEfilingIdRaw,
            fromUserEfilingId: fromUserEfilingId,
            assigned_to_type: typeof fileRow.assigned_to,
            created_by_type: typeof fileRow.created_by
        });
        
        if (!fromUserEfilingId) {
            await client.query('ROLLBACK');
            return NextResponse.json({ 
                error: 'File must be assigned to a user or have a creator to mark forward' 
            }, { status: 400 });
        }
        
        // Initialize workflow state if not exists
        if (!fileRow.workflow_state_id) {
            await initializeWorkflowState(client, fileId, fileRow.created_by);
            // Reload file to get workflow_state_id
            const reloadRes = await client.query(`SELECT workflow_state_id FROM efiling_files WHERE id = $1`, [fileId]);
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
        const currentUserEfilingId = currentUser.id;
        const currentUserRoleCode = (currentUser.role_code || '').toUpperCase();
        const isCEO = isCEORole(currentUserRoleCode);
        const isCOO = currentUserRoleCode === 'COO';
        const isSE = currentUserRoleCode === 'SE' || currentUserRoleCode.startsWith('SE_');
        const canBypassGeo = canBypassGeographicValidation(currentUserRoleCode);
        
        const workflowState = await getWorkflowState(client, fileId);

        // Pre-compute allowed recipients for validation and populate marking dropdowns
        let allowedRecipients = await getAllowedRecipients(client, {
            fromUserEfilingId,
            fileId: fileId,
            fileDepartmentId: fileRow.department_id,
            fileDistrictId: fileRow.district_id,
            fileTownId: fileRow.town_id,
            fileDivisionId: fileRow.division_id
        });

        // Always add team members (not just when workflow is team internal)
        // Users should be able to mark to team members for internal workflow
        // Filter out the current user (fromUserEfilingId) - users can't mark to themselves
        const creatorTeamMembers = await getTeamMembersForMarking(client, fileRow.created_by);
        creatorTeamMembers.forEach(member => {
            // Exclude current user from recipients
            if (member.id !== fromUserEfilingId && !allowedRecipients.find(r => r.id === member.id)) {
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
        
        // Always get current user's team members (for internal team workflow)
        // This allows assigned users (like SE) to mark files to their own team members
        const currentUserTeamMembers = await getTeamMembersForMarking(client, currentUser.id);
        currentUserTeamMembers.forEach(member => {
            // Exclude current user from recipients
            if (member.id !== fromUserEfilingId && !allowedRecipients.find(r => r.id === member.id)) {
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
        
        // Add CE (Chief Engineer) users for SE users from the same department
        if (isSE && currentUser.department_id != null && currentUser.id != null) {
            const departmentId = parseInt(currentUser.department_id, 10);
            const userId = parseInt(currentUser.id, 10);
            if (!isNaN(departmentId) && !isNaN(userId) && departmentId > 0 && userId > 0) {
                const ceRes = await client.query(`
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
                    AND (UPPER(r.code) LIKE '%CE%' OR UPPER(r.code) = 'CE' OR UPPER(r.name) LIKE '%CHIEF%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [departmentId, userId]);
                
                // Add all CE users in the department
                ceRes.rows.forEach(ce => {
                    if (!allowedRecipients.find(r => r.id === ce.id)) {
                        allowedRecipients.push({
                            id: ce.id,
                            user_name: ce.user_name,
                            name: ce.user_name,
                            role_code: ce.role_code,
                            role_name: ce.role_name,
                            department_id: ce.department_id,
                            department_name: ce.department_name,
                            district_id: ce.district_id,
                            district_name: ce.district_name,
                            town_id: ce.town_id,
                            town_name: ce.town_name,
                            division_id: ce.division_id,
                            division_name: ce.division_name,
                            allowed_level_scope: 'department',
                            allowed_reason: 'DEPARTMENT_CE',
                            is_department_ce: true
                        });
                    }
                });
            }
        }
        
        // Add CE users from the same division for SE users
        if (isSE && currentUser.division_id != null && currentUser.id != null) {
            const divisionId = parseInt(currentUser.division_id, 10);
            const userId = parseInt(currentUser.id, 10);
            if (!isNaN(divisionId) && !isNaN(userId) && divisionId > 0 && userId > 0) {
                const ceDivisionRes = await client.query(`
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
                    AND (UPPER(r.code) LIKE '%CE%' OR UPPER(r.code) = 'CE' OR UPPER(r.name) LIKE '%CHIEF%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [divisionId, userId]);
                
                // Add all CE users in the division (if not already added via department)
                ceDivisionRes.rows.forEach(ce => {
                    if (!allowedRecipients.find(r => r.id === ce.id)) {
                        allowedRecipients.push({
                            id: ce.id,
                            user_name: ce.user_name,
                            name: ce.user_name,
                            role_code: ce.role_code,
                            role_name: ce.role_name,
                            department_id: ce.department_id,
                            department_name: ce.department_name,
                            district_id: ce.district_id,
                            district_name: ce.district_name,
                            town_id: ce.town_id,
                            town_name: ce.town_name,
                            division_id: ce.division_id,
                            division_name: ce.division_name,
                            allowed_level_scope: 'division',
                            allowed_reason: 'DIVISION_CE',
                            is_division_ce: true
                        });
                    }
                });
            }
        }

        // ========== ROLE-BASED VISIBILITY FILTERING (POST) ==========
        // Apply filtering based on current user's role level (same as GET route)
        const currentUserRoleCodeUpperPOST = (currentUser.role_code || '').toUpperCase();
        const currentUserIsGlobalPOST = isGlobalRole(currentUserRoleCodeUpperPOST);
        const currentUserIsMidLevelPOST = isMidLevelRole(currentUserRoleCodeUpperPOST);
        const currentUserIsLowerLevelPOST = isLowerLevelRole(currentUserRoleCodeUpperPOST);
        
        console.log('[MARK-TO POST] Role check:', {
            roleCode: currentUser.role_code,
            roleCodeUpper: currentUserRoleCodeUpperPOST,
            isGlobal: currentUserIsGlobalPOST,
            isMidLevel: currentUserIsMidLevelPOST,
            isLowerLevel: currentUserIsLowerLevelPOST,
            recipientsBeforeFilter: allowedRecipients.length
        });
        
        if (currentUserIsGlobalPOST) {
            // Global roles (SE, CE, DCE, CEO, CFO, COO, CIA, CCO, DMD, Director, Committee/MD/BILLING/BUDGET/IAO-II)
            // Fetch ALL active e-filing users (bypass geographic routing restrictions)
            const allUsersRes = await client.query(`
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
                WHERE eu.is_active = true
                AND eu.id != $1
                ORDER BY u.name ASC
            `, [currentUser.id]);
            
            // Replace allowedRecipients with all users (merge with existing to preserve metadata)
            const allUsersMap = new Map(allUsersRes.rows.map(u => [u.id, u]));
            allowedRecipients.forEach(existing => {
                if (!allUsersMap.has(existing.id)) {
                    allUsersMap.set(existing.id, {
                        id: existing.id,
                        user_name: existing.user_name || existing.name,
                        name: existing.user_name || existing.name,
                        role_code: existing.role_code,
                        role_name: existing.role_name,
                        department_id: existing.department_id,
                        department_name: existing.department_name,
                        district_id: existing.district_id,
                        district_name: existing.district_name,
                        town_id: existing.town_id,
                        town_name: existing.town_name,
                        division_id: existing.division_id,
                        division_name: existing.division_name,
                        ...existing
                    });
                }
            });
            allowedRecipients = Array.from(allUsersMap.values());
            console.log('[MARK-TO POST] Global role - showing all users:', allowedRecipients.length);
        } else if (currentUserIsLowerLevelPOST && currentUser.department_id != null) {
            // Lower-level roles: Can only see department managers
            allowedRecipients = allowedRecipients.filter(recipient => {
                const recipientRoleCode = (recipient.role_code || '').toUpperCase();
                const recipientDepartmentId = recipient.department_id;
                return recipientDepartmentId === currentUser.department_id && 
                       isDepartmentManagerRole(recipientRoleCode);
            });
        } else if (currentUserIsMidLevelPOST && currentUser.department_id != null) {
            // Mid-level roles: Can see all users in their department
            allowedRecipients = allowedRecipients.filter(recipient => {
                const recipientDepartmentId = recipient.department_id;
                return recipientDepartmentId === currentUser.department_id;
            });
        }
        // ========== END ROLE-BASED VISIBILITY FILTERING (POST) ==========
        
        const allowedRecipientMap = new Map(allowedRecipients.map((recipient) => [recipient.id, recipient]));

        // ========== E-SIGNATURE VALIDATION (Updated for Team Workflow) ==========
        // Validate all user_ids AFTER filtering - ensure they're in the allowed recipients list
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        const validatedUserIds = [];
        
        for (const userIdRaw of user_ids) {
            const toUserId = safeParseInt(userIdRaw);
            if (!toUserId) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: `Invalid target user ID: ${userIdRaw}` }, { status: 400 });
            }
            
            // Check if user is in allowed recipients (after role-based filtering)
            const targetRecipient = allowedRecipientMap.get(toUserId);
            if (!targetRecipient) {
                await client.query('ROLLBACK');
                return NextResponse.json({ 
                    error: `User ID ${toUserId} is not allowed based on your role and department restrictions. Please select users from the allowed list.` 
                }, { status: 403 });
            }
            
            // Check e-signature requirement (for non-admin)
            if (!isAdmin) {
                const signatureCheck = await canMarkFileForward(client, fileId, currentUser.id, toUserId);
                if (signatureCheck.requiresSignature && !signatureCheck.canMark) {
                    await client.query('ROLLBACK');
                    return NextResponse.json({
                        error: signatureCheck.reason || 'E-signature required before marking forward',
                        code: 'SIGNATURE_REQUIRED'
                    }, { status: 403 });
                }
            }
            
            validatedUserIds.push(toUserId);
        }
        
        if (validatedUserIds.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'No valid user IDs provided' }, { status: 400 });
        }
        // ========== END E-SIGNATURE VALIDATION ==========

        // Validate that current user can mark file (updated for team workflow)
        // For higher authority users who have both signature and comment (or pages), allow marking even if not strictly assigned
        if (!isAdmin) {
            let canMark = await canMarkFile(client, fileId, currentUser.id);
            
            // If canMarkFile returned false, check if user is higher authority with both signature and comment (or pages)
            if (!canMark) {
                // Check if user is higher authority
                const currentUserRoleCodeUpper = (currentUser.role_code || '').toUpperCase();
                const isHigherAuthorityPOST = currentUserRoleCodeUpper === 'SE' || 
                                             currentUserRoleCodeUpper === 'CE' || 
                                             currentUserRoleCodeUpper === 'CEO' || 
                                             currentUserRoleCodeUpper === 'COO' || 
                                             currentUserRoleCodeUpper === 'ADLFA' ||
                                             currentUserRoleCodeUpper.startsWith('SE_') || 
                                             currentUserRoleCodeUpper.startsWith('CE_') || 
                                             currentUserRoleCodeUpper.startsWith('CEO_') || 
                                             currentUserRoleCodeUpper.startsWith('COO_');
                
                if (isHigherAuthorityPOST && currentUserEfilingId != null) {
                    // Check if user has signature
                    const signatureRes = await client.query(`
                        SELECT COUNT(*) as count
                        FROM efiling_document_signatures
                        WHERE file_id = $1 AND user_id = $2 AND is_active = true
                    `, [fileId, session.user.id]);
                    
                    const hasSigned = parseInt(signatureRes.rows[0].count) > 0;
                    
                    // Check if user has comment
                    const commentRes = await client.query(`
                        SELECT COUNT(*) as count
                        FROM efiling_document_comments
                        WHERE file_id = $1 AND user_id = $2 AND is_active = true
                    `, [fileId, session.user.id]);
                    
                    const hasCommented = parseInt(commentRes.rows[0].count) > 0;
                    
                    // Check if user has added pages (notesheet)
                    const pagesRes = await client.query(`
                        SELECT COUNT(*) as count
                        FROM efiling_document_pages
                        WHERE file_id = $1 AND created_by = $2
                    `, [fileId, currentUserEfilingId]);
                    
                    const hasAddedPages = parseInt(pagesRes.rows[0].count) > 0;
                    
                    // If user has both signature AND (comment OR pages), allow marking
                    if (hasSigned && (hasCommented || hasAddedPages)) {
                        canMark = true;
                        console.log('[MARK-TO POST] Allowing marking for higher authority user with both signature and (comment OR pages)');
                    }
                }
            }
            
            if (!canMark) {
                await client.query('ROLLBACK');
                return NextResponse.json({ 
                    error: 'You do not have permission to mark this file' 
                }, { status: 403 });
            }
        }

        try {
            // safeParseInt is already defined above - it handles BigInt, objects, strings, and numbers

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
            `, [fileId]);

            // ========== PROCESS MULTIPLE USER MARKING ==========
            // Process all validated user_ids - create movements for all selected users
            // Rules:
            // - Global roles (SE, CE, DCE, CEO, CFO, COO, CIA, CCO, DMD, Director, Committee/MD/BILLING/BUDGET/IAO-II):
            //   Can mark to multiple users from all available users
            // - Mid-level roles (XEN, RE, EE, Admin officer):
            //   Can mark to multiple users from their department only
            // - Lower-level roles (AEE, AOO, DAO, Sub-engineer):
            //   Can mark to multiple department managers (XEN, EE, RE, Admin officer) from their department only
            // File will be assigned to the LAST user in the list, but movements are created for all
            const processedMovements = [];
            let lastProcessedUserId = null;
            let lastTargetUser = null;
            let shouldStartTAT = false;
            let newState = workflowState?.current_state || 'TEAM_INTERNAL';
            
            for (const userId of validatedUserIds) {
                const targetRecipient = allowedRecipientMap.get(userId);
                if (!targetRecipient) {
                    throw new Error(`User ID ${userId} is not allowed based on SLA matrix/location rules`);
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
                
                // ========== HIGHER AUTHORITY RULES VALIDATION ==========
                // Helper function to get role hierarchy level (lower number = lower level)
                const getRoleLevel = (roleCode) => {
                    if (!roleCode) return 999;
                    const code = roleCode.toUpperCase();
                    if (code.includes('RE') || code.includes('RESIDENT_ENGINEER') || code.includes('XEN') || code.includes('EXECUTIVE_ENGINEER') || code.includes('EE')) {
                        return 1; // RE/XEN/EE = level 1
                    }
                    if (code.includes('SE') || code.includes('SUPERINTENDENT_ENGINEER')) {
                        return 2; // SE = level 2
                    }
                    if (code.includes('CE') || code.includes('CHIEF_ENGINEER')) {
                        return 3; // CE = level 3
                    }
                    if (code === 'COO') {
                        return 4; // COO = level 4
                    }
                    if (code === 'CEO' || code.includes('CEO')) {
                        return 5; // CEO = level 5
                    }
                    if (code === 'CFO' || code.includes('CFO')) {
                        return 6; // CFO = level 6
                    }
                    return 999; // Unknown = high level
                };
                
                // currentUserRoleCode is already declared in outer scope, reuse it
                const isHigherAuthority = ['SE', 'CE', 'CEO', 'COO', 'ADLFA'].includes(currentUserRoleCode) || 
                                         currentUserRoleCode.includes('SE_') || currentUserRoleCode.includes('CE_') || 
                                         currentUserRoleCode.includes('CEO_') || currentUserRoleCode.includes('COO_');
                
                // Check if this is marking back to creator
                const isReturningToCreator = (userId === fileRow.created_by);
                
                // Check if this is marking to higher level (comparing role hierarchy)
                const currentUserLevel = getRoleLevel(currentUserRoleCode);
                const targetUserLevel = getRoleLevel(toRoleCode);
                const isMarkingToHigherLevel = targetUserLevel > currentUserLevel;
                
                // Rule 1: If higher authority (SE/CE/CEO/COO) is marking back to creator, require comment
                if (isHigherAuthority && isReturningToCreator && !isAdmin) {
                const commentRes = await client.query(`
                    SELECT COUNT(*) as count
                    FROM efiling_document_comments
                    WHERE file_id = $1 AND user_id = $2 AND is_active = true
                `, [fileId, session.user.id]);
                
                const hasCommented = parseInt(commentRes.rows[0].count) > 0;
                
                if (!hasCommented) {
                    await client.query('ROLLBACK');
                    return NextResponse.json({
                        error: 'Comment required before marking back to creator. Please add a comment explaining the issue, then mark the file back.',
                        code: 'COMMENT_REQUIRED_FOR_MARK_BACK'
                    }, { status: 403 });
                }
            }
            
            // Rule 2: If higher authority (SE/CE/CEO/COO) is marking to higher level, require BOTH e-signature AND comment
            // If only comment is present (no e-sign), they can only mark to RE/XEN (creator)
            // If both e-sign AND comment are present, they can mark to higher levels
            if (isHigherAuthority && isMarkingToHigherLevel && !isAdmin) {
                // Check for e-signature
                const signatureRes = await client.query(`
                    SELECT COUNT(*) as count
                    FROM efiling_document_signatures
                    WHERE file_id = $1 AND user_id = $2 AND is_active = true
                `, [fileId, session.user.id]);
                
                const hasSigned = parseInt(signatureRes.rows[0].count) > 0;
                
                // Check for comment
                const commentRes = await client.query(`
                    SELECT COUNT(*) as count
                    FROM efiling_document_comments
                    WHERE file_id = $1 AND user_id = $2 AND is_active = true
                `, [fileId, session.user.id]);
                
                const hasCommented = parseInt(commentRes.rows[0].count) > 0;
                
                // Check if user has added pages (notesheet) - this also qualifies for marking to higher level
                const pagesRes = await client.query(`
                    SELECT COUNT(*) as count
                    FROM efiling_document_pages
                    WHERE file_id = $1 AND created_by = $2
                `, [fileId, currentUserEfilingId]);
                
                const hasAddedPages = parseInt(pagesRes.rows[0].count) > 0;
                
                // To mark to higher level, user must have:
                // - E-signature AND comment, OR
                // - E-signature AND added pages (notesheet), OR
                // - All three (signature, comment, pages)
                const canMarkToHigherLevel = hasSigned && (hasCommented || hasAddedPages);
                
                if (!canMarkToHigherLevel) {
                    await client.query('ROLLBACK');
                    if (!hasSigned && !hasCommented) {
                        return NextResponse.json({
                            error: 'E-signature and comment required before marking to higher level. Please add both your e-signature and a comment, then mark the file forward.',
                            code: 'SIGNATURE_AND_COMMENT_REQUIRED_FOR_HIGHER_LEVEL'
                        }, { status: 403 });
                    } else if (!hasSigned) {
                        return NextResponse.json({
                            error: 'E-signature required before marking to higher level. You have added a comment, but you also need to add your e-signature to mark to higher levels. With only a comment, you can only mark back to the creator (RE/XEN).',
                            code: 'SIGNATURE_REQUIRED_FOR_HIGHER_LEVEL'
                        }, { status: 403 });
                    } else {
                        return NextResponse.json({
                            error: 'Comment required before marking to higher level. You have added an e-signature, but you also need to add a comment (or add a notesheet page) to mark to higher levels. With only an e-signature, you can only mark back to the creator (RE/XEN).',
                            code: 'COMMENT_REQUIRED_FOR_HIGHER_LEVEL'
                        }, { status: 403 });
                    }
                }
                }
                // ========== END HIGHER AUTHORITY RULES VALIDATION ==========
                
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

                    // Check if this is moving to external (SE or higher) - this takes priority
                    // External flow: RE/XEN can mark to SE (Superintendent Engineer) - TAT starts
                    const externalRoles = ['SE', 'CE', 'CFO', 'COO', 'CEO'];
                    const isMovingToExternal = externalRoles.includes(toRoleCode);
                
                // Check if movement is within team workflow (only if not external)
                // Internal flow: Team members - No TAT
                const isTeamInternalForUser = !isMovingToExternal && await isWithinTeamWorkflow(client, fileId, currentUser.id, userId);
            
                // Check if this is a return to creator
                const isReturnToCreator = (userId === fileRow.created_by) && 
                                         workflowState && 
                                         workflowState.current_state === 'EXTERNAL';
            
                // Track workflow state for this user (we'll use the last user's state)
                let userNewState = workflowState?.current_state || 'TEAM_INTERNAL';
                let userShouldStartTAT = false;
                
                if (isReturnToCreator) {
                    userNewState = 'RETURNED_TO_CREATOR';
                    // Only mark return once
                    if (processedMovements.length === 0) {
                        await markReturnToCreator(client, fileId, fileRow.created_by);
                    }
                } else if (isMovingToExternal) {
                    // External flow: Marking to SE or higher - TAT starts
                    userNewState = 'EXTERNAL';
                    userShouldStartTAT = true;
                    // Only start TAT once
                    if (processedMovements.length === 0) {
                        await startTAT(client, fileId);
                    }
                } else if (isTeamInternalForUser) {
                    // Internal flow: Team members - No TAT
                    userNewState = 'TEAM_INTERNAL';
                    userShouldStartTAT = false;
                }
                
                // Update for tracking (use last user's state)
                newState = userNewState;
                shouldStartTAT = userShouldStartTAT || shouldStartTAT; // If any user triggers TAT, set it

                // Validate geographic match (bypass for certain roles, skip for team internal, skip for organizational scopes)
                if (!canBypassGeo && !isTeamInternalForUser) {
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

                // Get fromUser object from database - match assign route pattern exactly
                console.log('[MARK-TO] Processing user:', userId, 'Getting fromUser from database, fromUserEfilingId:', fromUserEfilingId);
                const fromUserRes = await client.query(`
                    SELECT eu.id, eu.department_id, eu.efiling_role_id, eu.district_id, eu.town_id, eu.division_id,
                           r.code as role_code
                    FROM efiling_users eu
                    LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
                    WHERE eu.id = $1 AND eu.is_active = true
                `, [fromUserEfilingId]);
                
                if (fromUserRes.rows.length === 0) {
                    console.error('[MARK-TO] From user not found:', fromUserEfilingId);
                    throw new Error('From user not found or inactive');
                }
                const fromUser = fromUserRes.rows[0];

                // Prepare INSERT parameters - match assign route pattern EXACTLY
                const insertParams = [
                    fileId,  // file_id - already validated as integer
                    fromUser.id,  // from_user_id - use directly from query result
                    targetUser.id,  // to_user_id - use directly from query result  
                    fromUser.department_id,  // from_department_id - use directly from query result (can be null)
                    targetUser.department_id,  // to_department_id - use directly from query result (can be null)
                    'MARK_TO',  // action_type
                    remarks || null  // remarks
                ];

                // Insert movement - EXACT same pattern as assign route
                console.log('[MARK-TO] Creating movement for user:', userId);
                const movementRes = await client.query(`
                    INSERT INTO efiling_file_movements (
                        file_id, from_user_id, to_user_id,
                        from_department_id, to_department_id,
                        action_type, remarks, created_at
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    RETURNING id
                `, insertParams);
                
                const movementId = movementRes.rows[0].id;
                console.log('[MARK-TO] INSERT successful! Movement ID:', movementId);
                processedMovements.push(movementRes.rows[0]);
                
                // Track last processed user for file assignment
                lastProcessedUserId = userId;
                lastTargetUser = targetUser;
            } // End loop for all user_ids
            
            if (!lastTargetUser || processedMovements.length === 0) {
                throw new Error('No movements were created');
            }
            
            // Update file assignment to the last user
            const newAssignee = lastTargetUser.id;
            const toRoleCode = (lastTargetUser.role_code || '').toUpperCase();
            console.log('[MARK-TO] Step 8: Updating file assignment, newAssignee:', newAssignee, '(last of', processedMovements.length, 'users)');
            
            // Determine if final assignment is team internal (based on last user)
            const externalRoles = ['SE', 'CE', 'CFO', 'COO', 'CEO','DCE','DIRECTOR_MEDICAL_SERVICES','MEDICAL_SCRUTINY_COMMITTEE','CHIEF_INTERNAL_AUDITOR','CONSULTANT','DIRECTOR','CON','COMMITTEE','COMMITE','MD','MANAGING_DIRECTOR','BILLING','BUDGET','IAO-II'];
            const lastUserRoleCode = (lastTargetUser.role_code || '').toUpperCase();
            const isMovingToExternalFinal = externalRoles.includes(lastUserRoleCode);
            const isTeamInternalFinal = !isMovingToExternalFinal && await isWithinTeamWorkflow(client, fileId, currentUser.id, lastProcessedUserId);
            
            // Calculate SLA deadline from SLA matrix (only for external workflow and if SLA deadline column exists)
            let slaDeadline = hasSlaDeadline ? (fileRow.sla_deadline || null) : null;
            
            if (hasSlaDeadline && shouldStartTAT && !isTeamInternalFinal) {
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
                        
                        // Get target user's department and determine level scope from file location
                        const targetUserDeptRes = await client.query(`
                            SELECT eu.department_id, eu.division_id, eu.district_id
                            FROM efiling_users eu
                            WHERE eu.id = $1
                        `, [newAssignee]);
                        
                        const targetUserDept = targetUserDeptRes.rows[0]?.department_id || fileRow.department_id;
                        // Determine level scope: if both have division_id, use 'division', else 'district'
                        const levelScope = (fileRow.division_id && targetUserDeptRes.rows[0]?.division_id) ? 'division' : 'district';
                        
                        const slaHours = await getSLA(client, currentUserRoleCode, lastTargetRoleCode, targetUserDept, levelScope);
                        
                        console.log('[MARK-TO] SLA calculation:', {
                            fromRole: currentUserRoleCode,
                            toRole: lastTargetRoleCode,
                            departmentId: targetUserDept,
                            levelScope: levelScope,
                            slaHours: slaHours
                        });
                        
                        const deadline = new Date();
                        deadline.setHours(deadline.getHours() + slaHours);
                        slaDeadline = deadline.toISOString();
                        
                        console.log('[MARK-TO] SLA deadline set:', {
                            slaHours,
                            deadline: slaDeadline,
                            deadlineLocal: new Date(slaDeadline).toLocaleString()
                        });
                        
                        // Log TAT deadline set event
                        try {
                            await client.query(`
                                INSERT INTO efiling_tat_logs 
                                (file_id, user_id, event_type, sla_deadline, time_remaining_hours, message, notification_sent, notification_method, created_at)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                            `, [
                                fileId,
                                newAssignee,
                                'DEADLINE_SET',
                                slaDeadline,
                                slaHours,
                                `TAT deadline set: ${slaHours} hours from now`,
                                false,
                                null
                            ]);
                        } catch (logError) {
                            console.warn('[MARK-TO] Error logging TAT deadline set:', logError.message);
                        }
                    }
                } catch (slaError) {
                    console.warn('[MARK-TO] Error computing SLA deadline:', slaError.message);
                    // Continue without SLA deadline if computation fails
                }
            }
            
            // Update file assignment - match assign route pattern (no casts needed)
            console.log('[MARK-TO] Step 9: Executing UPDATE on efiling_files...');
            const updateQuery = hasSlaDeadline && slaDeadline
                ? `UPDATE efiling_files
                   SET assigned_to = $1, updated_at = NOW(), sla_deadline = $2
                   WHERE id = $3`
                : `UPDATE efiling_files
                   SET assigned_to = $1, updated_at = NOW()
                   WHERE id = $2`;
            
            const updateParams = hasSlaDeadline && slaDeadline
                ? [newAssignee, slaDeadline, fileId]
                : [newAssignee, fileId];
            
            console.log('[MARK-TO] Step 10: UPDATE parameters:', {
                param_count: updateParams.length,
                param_types: updateParams.map(p => typeof p),
                param_values: updateParams
            });
            
            await client.query(updateQuery, updateParams);
            console.log('[MARK-TO] Step 11: UPDATE successful!');
            
            // Update workflow state
            await updateWorkflowState(client, fileId, newState, newAssignee, isTeamInternalFinal, shouldStartTAT);
            
            // Special handling: If marked to SE/CE, also assign to their assistants (for simultaneous visibility)
            if ((lastUserRoleCode === 'SE' || lastUserRoleCode === 'CE') && !isTeamInternalFinal) {
                const assistants = await getAssistantsForManager(client, lastProcessedUserId);
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

            // Step 12: Create in-app notification for all assigned users
            console.log('[MARK-TO] Step 12: Creating in-app notifications for', validatedUserIds.length, 'users...');
            for (const userId of validatedUserIds) {
                try {
                    await client.query(`
                        INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                        VALUES ($1, $2, $3, $4, 'normal', true, NOW())
                    `, [userId, fileId, 'file_assigned', `A file has been assigned to you: File ${fileRow.file_number || fileId}`]);
                } catch (e) {
                    console.warn('[MARK-TO] Failed to create in-app notification for user:', userId, e);
                }
            }
            console.log('[MARK-TO] Step 12: In-app notifications created');
            
            // Step 13: Send WhatsApp notification to the assigned user (for all workflows - internal and external)
            if (assigneePhone) {
                console.log('[MARK-TO] Step 13: Starting WhatsApp notification process...');
                console.log('[MARK-TO] Step 13a: Phone number:', assigneePhone, 'Is team internal:', isTeamInternalFinal);
                
                try {
                    // Step 13b: Get file details
                    const fileNumber = fileRow.file_number || `File #${fileId}`;
                    const fileSubject = fileRow.subject || 'N/A';
                    console.log('[MARK-TO] Step 13b: File details:', { fileNumber, fileSubject });
                    
                    // Step 13c: Get from user info (person who marked the file)
                    console.log('[MARK-TO] Step 13c: Getting from user info, currentUser.id:', currentUser.id);
                    const fromUserInfoRes = await client.query(`
                        SELECT u.name, eu.designation, r.code as role_code
                        FROM efiling_users eu
                        LEFT JOIN users u ON eu.user_id = u.id
                        LEFT JOIN efiling_roles r ON r.id = eu.efiling_role_id
                        WHERE eu.id = $1
                    `, [currentUser.id]);
                    
                    const fromUserData = fromUserInfoRes.rows[0] || {};
                    const fromUserName = fromUserData.name || 'User';
                    const fromUserDesignation = fromUserData.designation || '';
                    const fromUserRole = (fromUserData.role_code || '').toUpperCase();
                    const fromUserDisplay = fromUserDesignation ? `${fromUserName} (${fromUserDesignation})` : fromUserName;
                    console.log('[MARK-TO] Step 13c: From user:', { fromUserName, fromUserDesignation, fromUserRole, fromUserDisplay });
                    
                    // Step 13d: Get SLA deadline info if available
                    let tatMessage = '';
                    if (hasSlaDeadline) {
                        const finalDeadlineRes = await client.query(`
                            SELECT sla_deadline FROM efiling_files WHERE id = $1
                        `, [fileId]);
                        const finalSlaDeadline = finalDeadlineRes.rows[0]?.sla_deadline || slaDeadline;
                        console.log('[MARK-TO] Step 13d: SLA deadline:', finalSlaDeadline);
                        
                        if (finalSlaDeadline) {
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
                    }
                    
                    // Step 13e: Build WhatsApp message
                    const whatsappMessage = `📋 *File Assigned to You*\n\n` +
                        `File Number: ${fileNumber}\n` +
                        `Subject: ${fileSubject}\n` +
                        `Marked by: ${fromUserDisplay} (${fromUserRole})${tatMessage}\n\n` +
                        `Please review and take necessary action on this file.\n\n` +
                        `Thank you,\nE-Filing System`;
                    
                    console.log('[MARK-TO] Step 13e: WhatsApp message prepared, length:', whatsappMessage.length);
                    
                    // Step 13f: Send WhatsApp message
                    console.log('[MARK-TO] Step 13f: Sending WhatsApp message to:', assigneePhone);
                    const whatsappResult = await sendWhatsAppMessage(assigneePhone, whatsappMessage);
                    
                    // Step 13g: Log result
                    if (whatsappResult.success) {
                        console.log('[MARK-TO] Step 13g: ✅ WhatsApp notification sent successfully to', assigneeDisplayName, `(${assigneePhone}) for file ${fileNumber}`);
                    } else {
                        console.warn('[MARK-TO] Step 13g: ❌ Failed to send WhatsApp notification to', assigneeDisplayName, ':', whatsappResult.error);
                    }
                } catch (whatsappError) {
                    // Don't fail the mark-to operation if WhatsApp fails
                    console.error('[MARK-TO] Step 13: ❌ Error sending WhatsApp notification:', whatsappError.message);
                    console.error('[MARK-TO] Step 13: Error stack:', whatsappError.stack);
                }
            } else {
                console.log('[MARK-TO] Step 13: Skipping WhatsApp notification - No phone number available for user:', assigneeDisplayName);
            }
            
            // Notify SE/CE assistants if file is marked to SE/CE
            if ((toRoleCode === 'SE' || toRoleCode === 'CE') && !isTeamInternalFinal) {
                try {
                    const assistants = await getAssistantsForManager(client, lastProcessedUserId);
                    for (const assistant of assistants) {
                        await client.query(`
                            INSERT INTO efiling_notifications (user_id, file_id, type, message, priority, action_required, created_at)
                            VALUES ($1, $2, $3, $4, 'normal', false, NOW())
                        `, [assistant.team_member_id, fileId, 'file_assigned', 
                            `A file has been assigned to your manager (${assigneeDisplayName}): File ${fileRow.file_number || fileId}`]);
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
                    `, [createdBy, fileId, 'file_forwarded', `Your file has been marked to ${assigneeDisplayName} (${assigneeRole})`]);
                }
            } catch (e) {
                console.warn('Notify creator on mark-to failed', e);
            }

            await client.query('COMMIT');

            await logAction(request, 'MARK_TO', ENTITY_TYPES.EFILING_FILE, {
                entityId: fileId,
                entityName: `File ${fileRow.file_number || fileId}`,
                details: { user_ids, remarks, movements_created: processedMovements.length, assigned_to: newAssignee }
            });

            return NextResponse.json({ 
                message: `File marked successfully to ${processedMovements.length} user(s)`,
                movements: processedMovements,
                workflow_state: newState,
                is_team_internal: isTeamInternalFinal,
                tat_started: shouldStartTAT,
                assigned_to: newAssignee,
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

        // Validate and parse file ID
        const fileId = parseInt(String(id), 10);
        if (isNaN(fileId) || fileId <= 0) {
            return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
        }

        // SECURITY: Check file access
        const { checkFileAccess } = await import('@/lib/authMiddleware');
        const userId = parseInt(session.user.id);
        const isAdmin = [1, 2].includes(parseInt(session.user.role));
        
        const hasAccess = await checkFileAccess(client, fileId, userId, isAdmin);
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
        `, [fileId]);
        
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
        const currentUserRoleCodeUpper = (currentUser.role_code || '').toUpperCase();
        const isSE = currentUserRoleCodeUpper === 'SE' || currentUserRoleCodeUpper.startsWith('SE_');
        
        // Helper function to get role hierarchy level (lower number = lower level)
        const getRoleLevel = (roleCode) => {
            if (!roleCode) return 999;
            const code = roleCode.toUpperCase();
            if (code.includes('RE') || code.includes('RESIDENT_ENGINEER') || code.includes('XEN') || code.includes('EXECUTIVE_ENGINEER') || code.includes('EE')) {
                return 1; // RE/XEN/EE = level 1
            }
            if (code.includes('SE') || code.includes('SUPERINTENDENT_ENGINEER')) {
                return 2; // SE = level 2
            }
            if (code.includes('CE') || code.includes('CHIEF_ENGINEER')) {
                return 3; // CE = level 3
            }
            if (code === 'COO') {
                return 4; // COO = level 4
            }
            if (code === 'CEO' || code.includes('CEO')) {
                return 5; // CEO = level 5
            }
            if (code === 'CFO' || code.includes('CFO')) {
                return 6; // CFO = level 6
            }
            return 999; // Unknown = high level
        };
        
        // Get allowed recipients using geographic routing
        let allowedRecipients = await getAllowedRecipients(client, {
            fromUserEfilingId: fromUserEfilingId || currentUserEfilingId,
            fileId: fileId,
            fileDepartmentId: file.department_id,
            fileTypeId: file.file_type_id,
            fileDistrictId: file.district_id,
            fileTownId: file.town_id,
            fileDivisionId: file.division_id
        });
        
        // Always add team members (not just when workflow is team internal)
        // Users should be able to mark to team members for internal workflow
        // Filter out the current user - users can't mark to themselves
        const effectiveFromUserId = fromUserEfilingId || currentUserEfilingId;
        const creatorTeamMembers = await getTeamMembersForMarking(client, file.created_by);
        creatorTeamMembers.forEach(member => {
            // Exclude current user from recipients
            if (member.id !== effectiveFromUserId && !allowedRecipients.find(r => r.id === member.id)) {
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
        
        // Always get current user's team members (for internal team workflow)
        // This allows assigned users (like SE) to mark files to their own team members
        const currentUserTeamMembers = await getTeamMembersForMarking(client, currentUserEfilingId);
        currentUserTeamMembers.forEach(member => {
            // Exclude current user from recipients
            if (member.id !== effectiveFromUserId && !allowedRecipients.find(r => r.id === member.id)) {
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
        
        // Add CE (Chief Engineer) users for SE users from the same department
        if (isSE && currentUserDepartmentId != null && currentUserEfilingId != null) {
            const departmentId = parseInt(currentUserDepartmentId, 10);
            const userId = parseInt(currentUserEfilingId, 10);
            if (!isNaN(departmentId) && !isNaN(userId) && departmentId > 0 && userId > 0) {
                const ceRes = await client.query(`
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
                    AND (UPPER(r.code) LIKE '%CE%' OR UPPER(r.code) = 'CE' OR UPPER(r.name) LIKE '%CHIEF%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [departmentId, userId]);
                
                // Add all CE users in the department
                ceRes.rows.forEach(ce => {
                    if (!allowedRecipients.find(r => r.id === ce.id)) {
                        allowedRecipients.push({
                            id: ce.id,
                            user_name: ce.user_name,
                            name: ce.user_name,
                            role_code: ce.role_code,
                            role_name: ce.role_name,
                            department_id: ce.department_id,
                            department_name: ce.department_name,
                            district_id: ce.district_id,
                            district_name: ce.district_name,
                            town_id: ce.town_id,
                            town_name: ce.town_name,
                            division_id: ce.division_id,
                            division_name: ce.division_name,
                            allowed_level_scope: 'department',
                            allowed_reason: 'DEPARTMENT_CE',
                            is_department_ce: true
                        });
                    }
                });
            }
        }
        
        // Add CE users from the same division for SE users
        if (isSE && currentUserDivisionId != null && currentUserEfilingId != null) {
            const divisionId = parseInt(currentUserDivisionId, 10);
            const userId = parseInt(currentUserEfilingId, 10);
            if (!isNaN(divisionId) && !isNaN(userId) && divisionId > 0 && userId > 0) {
                const ceDivisionRes = await client.query(`
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
                    AND (UPPER(r.code) LIKE '%CE%' OR UPPER(r.code) = 'CE' OR UPPER(r.name) LIKE '%CHIEF%ENGINEER%')
                    AND eu.id != $2
                    ORDER BY u.name ASC
                `, [divisionId, userId]);
                
                // Add all CE users in the division (if not already added via department)
                ceDivisionRes.rows.forEach(ce => {
                    if (!allowedRecipients.find(r => r.id === ce.id)) {
                        allowedRecipients.push({
                            id: ce.id,
                            user_name: ce.user_name,
                            name: ce.user_name,
                            role_code: ce.role_code,
                            role_name: ce.role_name,
                            department_id: ce.department_id,
                            department_name: ce.department_name,
                            district_id: ce.district_id,
                            district_name: ce.district_name,
                            town_id: ce.town_id,
                            town_name: ce.town_name,
                            division_id: ce.division_id,
                            division_name: ce.division_name,
                            allowed_level_scope: 'division',
                            allowed_reason: 'DIVISION_CE',
                            is_division_ce: true
                        });
                    }
                });
            }
        }
        
        // ========== ROLE-BASED VISIBILITY FILTERING ==========
        // Apply filtering based on current user's role level
        const currentUserIsGlobal = isGlobalRole(currentUserRoleCodeUpper);
        const currentUserIsMidLevel = isMidLevelRole(currentUserRoleCodeUpper);
        const currentUserIsLowerLevel = isLowerLevelRole(currentUserRoleCodeUpper);
        
        console.log('[MARK-TO GET] Role check:', {
            roleCode: currentUser.role_code,
            roleCodeUpper: currentUserRoleCodeUpper,
            isGlobal: currentUserIsGlobal,
            isMidLevel: currentUserIsMidLevel,
            isLowerLevel: currentUserIsLowerLevel,
            recipientsBeforeFilter: allowedRecipients.length
        });
        
        if (currentUserIsGlobal) {
            // Global roles (SE, CE, DCE, CEO, CFO, COO, CIA, CCO, DMD, Director, Committee/MD/BILLING/BUDGET/IAO-II)
            // Fetch ALL active e-filing users (bypass geographic routing restrictions)
            const allUsersRes = await client.query(`
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
                WHERE eu.is_active = true
                AND eu.id != $1
                ORDER BY u.name ASC
            `, [currentUserEfilingId]);
            
            // Replace allowedRecipients with all users (merge with existing to preserve metadata)
            const allUsersMap = new Map(allUsersRes.rows.map(u => [u.id, u]));
            allowedRecipients.forEach(existing => {
                if (!allUsersMap.has(existing.id)) {
                    allUsersMap.set(existing.id, {
                        id: existing.id,
                        user_name: existing.user_name || existing.name,
                        name: existing.user_name || existing.name,
                        role_code: existing.role_code,
                        role_name: existing.role_name,
                        department_id: existing.department_id,
                        department_name: existing.department_name,
                        district_id: existing.district_id,
                        district_name: existing.district_name,
                        town_id: existing.town_id,
                        town_name: existing.town_name,
                        division_id: existing.division_id,
                        division_name: existing.division_name,
                        ...existing
                    });
                }
            });
            allowedRecipients = Array.from(allUsersMap.values());
            console.log('[MARK-TO GET] Global role - showing all users:', allowedRecipients.length);
        } else if (currentUserIsLowerLevel && currentUserDepartmentId != null) {
            // Lower-level roles (AEE, AOO, DAO, Sub-engineer): Can only see department managers
            // Filter to only show XEN, EE, RE, Admin officer from same department
            allowedRecipients = allowedRecipients.filter(recipient => {
                const recipientRoleCode = (recipient.role_code || '').toUpperCase();
                const recipientDepartmentId = recipient.department_id;
                // Must be in same department AND be a department manager role
                return recipientDepartmentId === currentUserDepartmentId && 
                       isDepartmentManagerRole(recipientRoleCode);
            });
        } else if (currentUserIsMidLevel && currentUserDepartmentId != null) {
            // Mid-level roles (XEN, RE, EE, Admin officer): Can see all users in their department
            // BUT also keep team members and SE (external flow) regardless of department
            allowedRecipients = allowedRecipients.filter(recipient => {
                const recipientDepartmentId = recipient.department_id;
                const recipientRoleCode = (recipient.role_code || '').toUpperCase();
                
                // Always keep team members (they're marked with is_team_member flag)
                if (recipient.is_team_member) {
                    return true;
                }
                
                // Always keep SE (external flow - will be filtered by e-signature later if needed)
                const isSE = recipientRoleCode === 'SE' || 
                            recipientRoleCode.startsWith('SE_') || 
                            recipientRoleCode.includes('SUPERINTENDENT_ENGINEER') ||
                            recipientRoleCode.includes('SUPERINTENDENT ENGINEER');
                if (isSE) {
                    return true;
                }
                
                // For other users, filter by department
                return recipientDepartmentId === currentUserDepartmentId;
            });
        }
        // ========== END ROLE-BASED VISIBILITY FILTERING ==========
        
        // ========== CREATOR (RE/XEN) MARKING RESTRICTION - Filter Recipients ==========
        // Rule: Once RE/XEN marks file to higher level, they cannot mark again until file is returned to them
        const isCreator = currentUserEfilingId === file.created_by;
        const currentUserLevel = getRoleLevel(currentUserRoleCodeUpper);
        const isCreatorRole = currentUserLevel === 1; // RE/XEN/EE = level 1
        
        if (isCreator && isCreatorRole) {
            // Check if file has been marked to higher level (SE or above) by checking movements
            const higherLevelMovementRes = await client.query(`
                SELECT m.id, m.to_user_id, r.code as to_role_code, m.created_at
                FROM efiling_file_movements m
                JOIN efiling_users eu_to ON m.to_user_id = eu_to.id
                LEFT JOIN efiling_roles r ON eu_to.efiling_role_id = r.id
                WHERE m.file_id = $1
                AND m.from_user_id = $2
                AND (
                    r.code LIKE 'SE%' OR r.code LIKE 'CE%' OR r.code = 'CEO' OR r.code = 'COO' OR r.code = 'CFO'
                    OR r.code LIKE '%SE%' OR r.code LIKE '%CE%' OR r.code LIKE '%CEO%' OR r.code LIKE '%COO%'
                    OR UPPER(r.code) LIKE '%SUPERINTENDENT%' OR UPPER(r.code) LIKE '%CHIEF%'
                )
                ORDER BY m.created_at DESC
                LIMIT 1
            `, [fileId, currentUserEfilingId]);
            
            if (higherLevelMovementRes.rows.length > 0) {
                // Creator has already marked to higher level
                // Check if file is currently assigned back to creator (returned)
                const workflowState = await getWorkflowState(client, fileId);
                const isFileReturnedToCreator = (file.assigned_to === file.created_by) &&
                                                 workflowState &&
                                                 workflowState.current_state === 'RETURNED_TO_CREATOR';
                
                if (!isFileReturnedToCreator) {
                    // Filter out all recipients - creator cannot mark to anyone
                    allowedRecipients = [];
                }
            }
        }
        // ========== END CREATOR MARKING RESTRICTION ==========
        
        // Filter allowed recipients for higher authority users based on signature and comment requirements
        // If higher authority has only comment (no signature), they can only mark to RE/XEN (creator)
        // If they have both signature AND comment (or added pages), they can mark to higher levels
        const isHigherAuthorityGET = currentUserRoleCodeUpper === 'SE' || 
                                     currentUserRoleCodeUpper === 'CE' || 
                                     currentUserRoleCodeUpper === 'CEO' || 
                                     currentUserRoleCodeUpper === 'COO' || 
                                     currentUserRoleCodeUpper === 'ADLFA' ||
                                     currentUserRoleCodeUpper.startsWith('SE_') || 
                                     currentUserRoleCodeUpper.startsWith('CE_') || 
                                     currentUserRoleCodeUpper.startsWith('CEO_') || 
                                     currentUserRoleCodeUpper.startsWith('COO_');
        
        let hasSigned = false;
        let hasCommented = false;
        let hasAddedPages = false;
        let canMarkToHigherLevel = false;
        
        if (isHigherAuthorityGET && !isAdmin && currentUserEfilingId != null) {
            // Check if user has signature
            const signatureRes = await client.query(`
                SELECT COUNT(*) as count
                FROM efiling_document_signatures
                WHERE file_id = $1 AND user_id = $2 AND is_active = true
            `, [fileId, session.user.id]);
            
            hasSigned = parseInt(signatureRes.rows[0].count) > 0;
            
            // Check if user has comment
            const commentRes = await client.query(`
                SELECT COUNT(*) as count
                FROM efiling_document_comments
                WHERE file_id = $1 AND user_id = $2 AND is_active = true
            `, [fileId, session.user.id]);
            
            hasCommented = parseInt(commentRes.rows[0].count) > 0;
            
            // Check if user has added pages (notesheet)
            const pagesRes = await client.query(`
                SELECT COUNT(*) as count
                FROM efiling_document_pages
                WHERE file_id = $1 AND created_by = $2
            `, [fileId, currentUserEfilingId]);
            
            hasAddedPages = parseInt(pagesRes.rows[0].count) > 0;
            
            // Debug logging
            console.log('[MARK-TO GET] Higher authority filtering check:', {
                hasSigned,
                hasCommented,
                hasAddedPages,
                canMarkToHigherLevel: hasSigned && (hasCommented || hasAddedPages),
                recipientCountBeforeFilter: allowedRecipients.length
            });
            
            // If user has both signature AND (comment OR pages), they can see all recipients (no filtering needed)
            // Otherwise, if user only has comment OR only has signature (but not both), filter to only show creator
            canMarkToHigherLevel = hasSigned && (hasCommented || hasAddedPages);
            
            if (!canMarkToHigherLevel) {
                // User doesn't have both signature AND (comment OR pages), so filter to only show creator (RE/XEN)
                const recipientsBeforeFilter = allowedRecipients.length;
                allowedRecipients = allowedRecipients.filter(recipient => {
                    // Keep only the creator (RE/XEN)
                    return recipient.id === file.created_by;
                });
                console.log('[MARK-TO GET] Filtered recipients:', {
                    before: recipientsBeforeFilter,
                    after: allowedRecipients.length,
                    reason: 'User needs both signature AND (comment OR pages) to mark to higher levels'
                });
            } else {
                console.log('[MARK-TO GET] No filtering applied - user has both signature AND (comment OR pages)');
            }
        }
        
        // ========== E-SIGNATURE FILTERING FOR EXTERNAL FLOW ==========
        // Filter out SE if RE/XEN hasn't e-signed
        // Filter out Director Medical Services if Admin Officer hasn't e-signed
        if (!isAdmin && currentUserEfilingId != null) {
            // Check if current user is RE/XEN
            const isREorXEN = currentUserRoleCodeUpper === 'RE' || 
                             currentUserRoleCodeUpper.startsWith('RE_') || 
                             currentUserRoleCodeUpper === 'XEN' || 
                             currentUserRoleCodeUpper.startsWith('XEN_') ||
                             currentUserRoleCodeUpper.includes('RESIDENT_ENGINEER') ||
                             currentUserRoleCodeUpper.includes('EXECUTIVE_ENGINEER');
            
            // Check if current user is Admin Officer
            const isAdminOfficer = currentUserRoleCodeUpper.includes('ADMINISTRATIVE_OFFICER') || 
                                  currentUserRoleCodeUpper.includes('ADMINISTRATIVE OFFICER') ||
                                  currentUserRoleCodeUpper === 'ADMIN_OFFICER' ||
                                  currentUserRoleCodeUpper.startsWith('ADMIN_OFFICER_');
            
            if (isREorXEN || isAdminOfficer) {
                // Check if user has e-signed
                const signatureRes = await client.query(`
                    SELECT COUNT(*) as count
                    FROM efiling_document_signatures
                    WHERE file_id = $1 AND user_id = $2 AND is_active = true
                `, [fileId, session.user.id]);
                
                const hasSigned = parseInt(signatureRes.rows[0].count) > 0;
                
                if (!hasSigned) {
                    // User hasn't e-signed - filter out external flow recipients
                    // BUT keep team members (they don't require e-signature)
                    const recipientsBeforeFilter = allowedRecipients.length;
                    
                    allowedRecipients = allowedRecipients.filter(recipient => {
                        // Always keep team members - they don't require e-signature
                        if (recipient.is_team_member) {
                            return true;
                        }
                        
                        const recipientRoleCode = (recipient.role_code || '').toUpperCase();
                        
                        // For RE/XEN: Remove SE (external flow)
                        if (isREorXEN) {
                            const isSE = recipientRoleCode === 'SE' || 
                                        recipientRoleCode.startsWith('SE_') || 
                                        recipientRoleCode.includes('SUPERINTENDENT_ENGINEER') ||
                                        recipientRoleCode.includes('SUPERINTENDENT ENGINEER');
                            
                            if (isSE) {
                                return false; // Remove SE - requires e-signature
                            }
                        }
                        
                        // For Admin Officer: Remove Director Medical Services (external flow)
                        if (isAdminOfficer) {
                            const isDirectorMedicalServices = recipientRoleCode === 'DIRECTOR_MEDICAL_SERVICES' || 
                                                            recipientRoleCode.startsWith('DIRECTOR_MEDICAL_SERVICES_') ||
                                                            recipientRoleCode.includes('DIRECTOR_MEDICAL_SERVICES');
                            
                            if (isDirectorMedicalServices) {
                                return false; // Remove Director Medical Services - requires e-signature
                            }
                        }
                        
                        // Keep all other allowed recipients (department users, etc.)
                        return true;
                    });
                    
                    console.log('[MARK-TO GET] Filtered external flow recipients (e-signature required):', {
                        before: recipientsBeforeFilter,
                        after: allowedRecipients.length,
                        reason: isREorXEN ? 'RE/XEN must e-sign before marking to SE' : 'Admin Officer must e-sign before marking to Director Medical Services'
                    });
                } else {
                    console.log('[MARK-TO GET] User has e-signed - external flow recipients allowed');
                }
            }
        }
        // ========== END E-SIGNATURE FILTERING FOR EXTERNAL FLOW ==========
        
        // Filter out current user from allowed recipients - users can't mark to themselves
        allowedRecipients = allowedRecipients.filter(r => r.id !== currentUserEfilingId);
        
        // Check if user can mark this file
        // For higher authority users who have both signature and comment (or pages), allow marking even if not strictly assigned
        let canMark = false;
        if (isAdmin) {
            canMark = true;
        } else {
            canMark = await canMarkFile(client, fileId, currentUserEfilingId);
            
            // If canMarkFile returned false, but user is higher authority with both signature and comment (or pages), allow marking
            if (!canMark && isHigherAuthorityGET && currentUserEfilingId != null && canMarkToHigherLevel) {
                canMark = true;
                console.log('[MARK-TO GET] Allowing marking for higher authority user with both signature and (comment OR pages)');
            }
        }
        
        // Check if file is already assigned to someone else
        const isAssignedToSomeoneElse = file.assigned_to !== null && file.assigned_to !== currentUserEfilingId && file.assigned_to !== file.created_by;
        const assignedToName = file.assigned_to ? (
            await client.query(`
                SELECT u.name 
                FROM efiling_users eu
                JOIN users u ON eu.user_id = u.id
                WHERE eu.id = $1
            `, [file.assigned_to])
        ).rows[0]?.name : null;
        
        // Get workflow state for display purposes
        const workflowState = await getWorkflowState(client, fileId);
        
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
        `, [fileId]);
        
        return NextResponse.json({ 
            file_id: fileId, 
            allowed_recipients: allowedRecipients,
            movements: movementsRes.rows,
            can_mark: canMark,
            is_assigned_to_someone_else: isAssignedToSomeoneElse,
            assigned_to_name: assignedToName,
            assigned_to_id: file.assigned_to
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        if (client) await client.release();
    }
}
