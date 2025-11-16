/**
 * E-Filing SLA (TAT) Management Utility
 * 
 * Handles SLA pause/resume logic for CEO review workflow
 * When file reaches CEO, SLA timer pauses
 * When CEO forwards file, SLA timer resumes
 */

/**
 * Check if a role is CEO
 * @param {string} roleCode - Role code from efiling_roles
 * @returns {boolean}
 */
export function isCEORole(roleCode) {
    if (!roleCode) return false;
    const ceoRoles = ['CEO', 'CEO_GROUP'];
    return ceoRoles.includes(roleCode.toUpperCase());
}

/**
 * Pause SLA timer for a file (workflow-free)
 */
export async function pauseSLA(client, fileId, _workflowId = null, userId = null, _stageId = null, reason = 'MANUAL_PAUSE') {
    try {
        const fileRes = await client.query(`
            SELECT sla_paused, sla_paused_at, sla_deadline
            FROM efiling_files
            WHERE id = $1
        `, [fileId]);

        if (fileRes.rows.length === 0) {
            console.error('File not found for SLA pause');
            return;
        }

        const file = fileRes.rows[0];
        if (file.sla_paused) {
            return;
        }

        await client.query(`
            UPDATE efiling_files
            SET sla_paused = TRUE,
                sla_paused_at = NOW(),
                sla_pause_count = COALESCE(sla_pause_count, 0) + 1,
                updated_at = NOW()
            WHERE id = $1
        `, [fileId]);

        await client.query(`
            INSERT INTO efiling_sla_pause_history (
                file_id, paused_at, pause_reason, paused_by_user_id
            ) VALUES ($1, NOW(), $2, $3)
        `, [fileId, reason, userId]);
    } catch (error) {
        console.error('Error pausing SLA:', error);
        throw error;
    }
}

/**
 * Resume SLA timer for a file (workflow-free)
 */
export async function resumeSLA(client, fileId, _workflowId = null, slaExtensionHours = null) {
    try {
        const fileRes = await client.query(`
            SELECT sla_paused, sla_paused_at, sla_deadline, sla_accumulated_hours
            FROM efiling_files
            WHERE id = $1
        `, [fileId]);

        if (fileRes.rows.length === 0) {
            console.error('File not found for SLA resume');
            return;
        }

        const file = fileRes.rows[0];
        if (!file.sla_paused || !file.sla_paused_at) {
            return;
        }

        const now = new Date();
        const pausedAt = new Date(file.sla_paused_at);
        const pauseDurationHours = (now - pausedAt) / (1000 * 60 * 60);
        const additionalHours = slaExtensionHours ?? pauseDurationHours;

        await client.query(`
            UPDATE efiling_sla_pause_history
            SET resumed_at = NOW(),
                duration_hours = $1,
                updated_at = NOW()
            WHERE id = (
                SELECT id FROM efiling_sla_pause_history
                WHERE file_id = $2 AND resumed_at IS NULL
                ORDER BY paused_at DESC
                LIMIT 1
            )
        `, [pauseDurationHours, fileId]);

        await client.query(`
            UPDATE efiling_files
            SET sla_paused = FALSE,
                sla_paused_at = NULL,
                sla_deadline = CASE WHEN sla_deadline IS NOT NULL THEN sla_deadline + ($2 * INTERVAL '1 hour') ELSE NULL END,
                sla_accumulated_hours = COALESCE(sla_accumulated_hours, 0) + $1,
                updated_at = NOW()
            WHERE id = $3
        `, [pauseDurationHours, additionalHours, fileId]);
    } catch (error) {
        console.error('Error resuming SLA:', error);
        throw error;
    }
}

/**
 * Get current SLA status for a file
 */
export async function getSLAStatus(client, fileId) {
    try {
        const res = await client.query(`
            SELECT sla_deadline, sla_paused, sla_paused_at, sla_accumulated_hours, sla_pause_count
            FROM efiling_files
            WHERE id = $1
        `, [fileId]);

        return res.rows[0] || null;
    } catch (error) {
        console.error('Error getting SLA status:', error);
        return null;
    }
}

/**
 * Calculate effective SLA time remaining based on file-level data
 * Updated to handle team workflow - no TAT for team internal files
 */
export function calculateEffectiveSLA(record, workflowState = null) {
    if (!record) {
        return {
            status: 'UNKNOWN',
            message: 'No SLA data found'
        };
    }
    
    // If file is within team workflow, no TAT applies
    if (workflowState && workflowState.is_within_team && workflowState.current_state === 'TEAM_INTERNAL') {
        return {
            status: 'TEAM_INTERNAL',
            message: 'File is within team workflow - TAT not applicable',
            isTeamInternal: true
        };
    }

    if (record.sla_paused) {
        return {
            status: 'PAUSED',
            reason: 'SLA paused',
            accumulatedHours: record.sla_accumulated_hours || 0,
            pausedAt: record.sla_paused_at,
            pauseCount: record.sla_pause_count || 0
        };
    }

    if (!record.sla_deadline) {
        return {
            status: 'PENDING',
            message: 'No SLA deadline set'
        };
    }

    const now = Date.now();
    const deadline = new Date(record.sla_deadline).getTime();
    const remainingHours = (deadline - now) / (1000 * 60 * 60);
    const accumulated = parseFloat(record.sla_accumulated_hours) || 0;

    return {
        status: remainingHours < 0 ? 'BREACHED' : 'ACTIVE',
        remainingHours: Math.round(remainingHours * 100) / 100,
        accumulatedHours: accumulated,
        deadline: record.sla_deadline,
        breached: remainingHours < 0
    };
}

