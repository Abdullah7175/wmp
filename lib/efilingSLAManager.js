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
 * Pause SLA timer when file reaches CEO
 * @param {Object} client - Database client
 * @param {number} fileId - File ID
 * @param {number} workflowId - Workflow ID
 * @param {number} userId - User ID pausing the SLA
 * @param {number} stageId - Stage ID where pause occurs
 */
export async function pauseSLA(client, fileId, workflowId, userId, stageId) {
    try {
        // Get current workflow state
        const workflowRes = await client.query(`
            SELECT sla_deadline, sla_accumulated_hours, started_at, sla_paused
            FROM efiling_file_workflows
            WHERE id = $1
        `, [workflowId]);
        
        if (workflowRes.rows.length === 0) {
            console.error('Workflow not found for SLA pause');
            return;
        }
        
        const workflow = workflowRes.rows[0];
        
        // If already paused, don't pause again
        if (workflow.sla_paused) {
            console.log('SLA already paused for workflow:', workflowId);
            return;
        }
        
        const now = new Date();
        const startedAt = new Date(workflow.started_at);
        
        // Calculate hours elapsed since workflow started (or last resume)
        const hoursElapsed = (now - startedAt) / (1000 * 60 * 60);
        const totalAccumulated = (parseFloat(workflow.sla_accumulated_hours) || 0) + hoursElapsed;
        
        console.log('Pausing SLA:', {
            workflowId,
            hoursElapsed,
            previousAccumulated: workflow.sla_accumulated_hours,
            totalAccumulated
        });
        
        // Update workflow to paused state
        await client.query(`
            UPDATE efiling_file_workflows
            SET sla_paused = TRUE,
                sla_paused_at = NOW(),
                sla_accumulated_hours = $1,
                sla_pause_count = COALESCE(sla_pause_count, 0) + 1,
                updated_at = NOW()
            WHERE id = $2
        `, [totalAccumulated, workflowId]);
        
        // Log pause event in history
        await client.query(`
            INSERT INTO efiling_sla_pause_history (
                file_id, workflow_id, paused_at, pause_reason, 
                paused_by_user_id, paused_by_stage_id
            ) VALUES ($1, $2, NOW(), 'CEO_REVIEW', $3, $4)
        `, [fileId, workflowId, userId, stageId]);
        
        console.log('SLA paused successfully for file:', fileId);
        
    } catch (error) {
        console.error('Error pausing SLA:', error);
        throw error;
    }
}

/**
 * Resume SLA timer when CEO forwards file
 * @param {Object} client - Database client
 * @param {number} fileId - File ID
 * @param {number} workflowId - Workflow ID
 * @param {number} nextStageId - Next stage ID
 */
export async function resumeSLA(client, fileId, workflowId, nextStageId) {
    try {
        // Get current pause record
        const pauseRes = await client.query(`
            SELECT id, paused_at, paused_by_user_id
            FROM efiling_sla_pause_history
            WHERE workflow_id = $1 AND resumed_at IS NULL
            ORDER BY paused_at DESC
            LIMIT 1
        `, [workflowId]);
        
        if (pauseRes.rows.length > 0) {
            const pauseRecord = pauseRes.rows[0];
            const now = new Date();
            const pausedAt = new Date(pauseRecord.paused_at);
            const pauseDuration = (now - pausedAt) / (1000 * 60 * 60);
            
            console.log('Resuming SLA:', {
                workflowId,
                pauseDuration,
                pausedAt: pauseRecord.paused_at
            });
            
            // Update pause history with resume time and duration
            await client.query(`
                UPDATE efiling_sla_pause_history
                SET resumed_at = NOW(),
                    duration_hours = $1,
                    updated_at = NOW()
                WHERE id = $2
            `, [pauseDuration, pauseRecord.id]);
        }
        
        // Get next stage SLA hours
        const stageRes = await client.query(`
            SELECT sla_hours, role_id FROM efiling_workflow_stages WHERE id = $1
        `, [nextStageId]);
        
        const slaHours = stageRes.rows[0]?.sla_hours || 24;
        
        // Resume workflow with new deadline
        await client.query(`
            UPDATE efiling_file_workflows
            SET sla_paused = FALSE,
                sla_paused_at = NULL,
                sla_deadline = NOW() + ($1 || ' hours')::interval,
                updated_at = NOW()
            WHERE id = $2
        `, [slaHours, workflowId]);
        
        // Also update file table
        await client.query(`
            UPDATE efiling_files
            SET sla_deadline = NOW() + ($1 || ' hours')::interval,
                updated_at = NOW()
            WHERE id = $2
        `, [slaHours, fileId]);
        
        console.log('SLA resumed successfully for file:', fileId);
        
    } catch (error) {
        console.error('Error resuming SLA:', error);
        throw error;
    }
}

/**
 * Get current SLA status for a file
 * @param {Object} client - Database client
 * @param {number} fileId - File ID
 * @returns {Object} SLA status information
 */
export async function getSLAStatus(client, fileId) {
    try {
        const res = await client.query(`
            SELECT * FROM efiling_file_sla_status WHERE file_id = $1
        `, [fileId]);
        
        return res.rows[0] || null;
    } catch (error) {
        console.error('Error getting SLA status:', error);
        return null;
    }
}

/**
 * Calculate effective SLA time remaining (excluding pause periods)
 * @param {Object} workflow - Workflow object
 * @returns {Object} SLA calculation result
 */
export function calculateEffectiveSLA(workflow) {
    if (!workflow) {
        return {
            status: 'UNKNOWN',
            message: 'No workflow found'
        };
    }
    
    if (workflow.sla_paused) {
        return {
            status: 'PAUSED',
            reason: 'Pending with CEO',
            accumulatedHours: workflow.sla_accumulated_hours || 0,
            pausedAt: workflow.sla_paused_at,
            pauseCount: workflow.sla_pause_count || 0
        };
    }
    
    const now = new Date();
    const deadline = new Date(workflow.sla_deadline);
    const accumulated = parseFloat(workflow.sla_accumulated_hours) || 0;
    
    // Calculate remaining time
    const remainingMs = deadline - now;
    const remainingHours = remainingMs / (1000 * 60 * 60);
    
    return {
        status: remainingHours < 0 ? 'BREACHED' : 'ACTIVE',
        remainingHours: Math.round(remainingHours * 100) / 100,
        accumulatedHours: accumulated,
        deadline: workflow.sla_deadline,
        breached: workflow.sla_breached || remainingHours < 0
    };
}

