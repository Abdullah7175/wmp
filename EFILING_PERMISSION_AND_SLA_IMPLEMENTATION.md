# E-Filing Permission System & SLA Management Implementation Guide

## Overview
This document outlines the implementation of a comprehensive permission system and SLA (TAT) management for the e-filing module.

## Requirements

### 1. File Edit Permissions
- **Admin (efiling)**: Can edit ANY file
- **File Creator**: Can edit ONLY their own files
- **Marked Users**: CANNOT edit files - can only:
  - Add e-signatures (mandatory)
  - Add comments
  - Add attachments

### 2. E-Signature Requirement
- File creator MUST add e-signature before marking/forwarding the file
- Without e-signature, the "Mark To" button should be disabled
- Validation on API level to prevent bypassing

### 3. SLA (TAT) Timer Management
- **Normal Flow**: SLA timer runs continuously
- **When File Reaches CEO**:
  - SLA timer PAUSES
  - File shows "Pending with CEO" status
  - No time accumulation
- **When CEO Forwards File**:
  - SLA timer RESUMES
  - Timer continues from where it paused
- **Each Time File Goes to CEO**: Timer pauses again

## Database Schema Analysis

Based on provided schema:

```sql
-- Files table has SLA tracking
efiling_files:
  - sla_deadline TIMESTAMP
  - sla_breached BOOLEAN

-- Workflow tracking
efiling_file_workflows:
  - sla_deadline TIMESTAMP
  - sla_breached BOOLEAN
  - current_stage_id INTEGER

-- Stages with SLA hours
efiling_workflow_stages:
  - sla_hours INTEGER (24, 48, 72, 168 hours)
  - role_id INTEGER

-- Need to add SLA pause tracking
```

### Required Schema Addition

```sql
-- Add columns to track SLA pause/resume
ALTER TABLE efiling_file_workflows 
ADD COLUMN sla_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN sla_paused_at TIMESTAMP,
ADD COLUMN sla_accumulated_hours NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN sla_pause_count INTEGER DEFAULT 0;

-- Add SLA pause history table
CREATE TABLE efiling_sla_pause_history (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES efiling_files(id),
    workflow_id INTEGER NOT NULL REFERENCES efiling_file_workflows(id),
    paused_at TIMESTAMP NOT NULL,
    resumed_at TIMESTAMP,
    pause_reason VARCHAR(100) DEFAULT 'CEO_REVIEW',
    paused_by_user_id INTEGER REFERENCES efiling_users(id),
    paused_by_role_id INTEGER REFERENCES efiling_roles(id),
    duration_hours NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sla_pause_history_file ON efiling_sla_pause_history(file_id);
CREATE INDEX idx_sla_pause_history_workflow ON efiling_sla_pause_history(workflow_id);
```

## Implementation Steps

### Step 1: Update File Permissions API

File: `app/api/efiling/files/[id]/permissions/route.js` (NEW)

```javascript
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        
        if (!token?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await connectToDatabase();
        
        // Get user's efiling profile
        const userRes = await client.query(`
            SELECT eu.id, eu.efiling_role_id, r.code as role_code
            FROM efiling_users eu
            LEFT JOIN efiling_roles r ON eu.efiling_role_id = r.id
            WHERE eu.user_id = $1 AND eu.is_active = true
        `, [token.user.id]);
        
        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'User not found in e-filing' }, { status: 403 });
        }
        
        const userEfiling = userRes.rows[0];
        
        // Get file details
        const fileRes = await client.query(`
            SELECT f.*, wf.current_stage_id, ws.role_id as current_stage_role_id,
                   r.code as current_stage_role_code
            FROM efiling_files f
            LEFT JOIN efiling_file_workflows wf ON wf.file_id = f.id
            LEFT JOIN efiling_workflow_stages ws ON ws.id = wf.current_stage_id
            LEFT JOIN efiling_roles r ON r.id = ws.role_id
            WHERE f.id = $1
        `, [id]);
        
        if (fileRes.rows.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const file = fileRes.rows[0];
        
        // Check if user is admin (SYS_ADMIN role)
        const isAdmin = userEfiling.role_code === 'SYS_ADMIN' || [1, 2].includes(token.user.role);
        
        // Check if user is file creator
        const isCreator = file.created_by === userEfiling.id;
        
        // Check if user is currently assigned/marked
        const isAssigned = file.assigned_to === userEfiling.id;
        
        // Check if user has signed the file
        const signatureRes = await client.query(`
            SELECT COUNT(*) as count
            FROM efiling_document_signatures
            WHERE file_id = $1 AND user_id = $2 AND is_active = true
        `, [id, token.user.id]);
        
        const hasSigned = signatureRes.rows[0].count > 0;
        
        // Permission calculations
        const permissions = {
            canEdit: isAdmin || isCreator,
            canView: true, // All assigned users can view
            canAddSignature: true, // All users can add signatures
            canAddComment: true, // All users can comment
            canAddAttachment: true, // All users can add attachments
            canMarkTo: (isCreator && hasSigned) || isAdmin, // Creator must sign first, admins can always mark
            canApprove: isAssigned && hasSigned, // Must be assigned and signed
            canReject: isAssigned && hasSigned,
            isAdmin,
            isCreator,
            isAssigned,
            hasSigned,
            requiresSignature: isCreator && !hasSigned
        };
        
        await client.release();
        
        return NextResponse.json({ permissions });
        
    } catch (error) {
        console.error('Error checking permissions:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
```

### Step 2: Add E-Signature Validation to Mark-To API

Update: `app/api/efiling/files/[id]/mark-to/route.js`

Add validation before marking:

```javascript
// After getting file and before marking
// Check if creator has signed the file
const creatorSignatureCheck = await client.query(`
    SELECT COUNT(*) as count
    FROM efiling_document_signatures
    WHERE file_id = $1 AND user_id = (
        SELECT user_id FROM efiling_users WHERE id = $2
    ) AND is_active = true
`, [id, fileRow.created_by]);

if (creatorSignatureCheck.rows[0].count === 0) {
    await client.query('ROLLBACK');
    return NextResponse.json({
        error: 'File creator must add e-signature before marking to others',
        code: 'SIGNATURE_REQUIRED'
    }, { status: 403 });
}
```

### Step 3: Implement CEO SLA Pause Logic

File: `app/api/efiling/sla/manage/route.js` (NEW)

```javascript
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

/**
 * Pause SLA when file reaches CEO
 */
export async function pauseSLA(client, fileId, workflowId, userId) {
    // Calculate accumulated time so far
    const workflowRes = await client.query(`
        SELECT sla_deadline, sla_accumulated_hours, started_at
        FROM efiling_file_workflows
        WHERE id = $1
    `, [workflowId]);
    
    if (workflowRes.rows.length === 0) return;
    
    const workflow = workflowRes.rows[0];
    const now = new Date();
    const startedAt = new Date(workflow.started_at);
    
    // Calculate hours elapsed since last resume/start
    const hoursElapsed = (now - startedAt) / (1000 * 60 * 60);
    const totalAccumulated = (workflow.sla_accumulated_hours || 0) + hoursElapsed;
    
    // Update workflow to paused state
    await client.query(`
        UPDATE efiling_file_workflows
        SET sla_paused = TRUE,
            sla_paused_at = NOW(),
            sla_accumulated_hours = $1,
            sla_pause_count = sla_pause_count + 1,
            updated_at = NOW()
        WHERE id = $2
    `, [totalAccumulated, workflowId]);
    
    // Log pause event
    await client.query(`
        INSERT INTO efiling_sla_pause_history (
            file_id, workflow_id, paused_at, pause_reason, paused_by_user_id
        ) VALUES ($1, $2, NOW(), 'CEO_REVIEW', $3)
    `, [fileId, workflowId, userId]);
}

/**
 * Resume SLA when CEO forwards file
 */
export async function resumeSLA(client, fileId, workflowId, nextStageId) {
    // Get current pause record
    const pauseRes = await client.query(`
        SELECT id, paused_at
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
        
        // Update pause history with resume time
        await client.query(`
            UPDATE efiling_sla_pause_history
            SET resumed_at = NOW(),
                duration_hours = $1
            WHERE id = $2
        `, [pauseDuration, pauseRecord.id]);
    }
    
    // Get next stage SLA hours
    const stageRes = await client.query(`
        SELECT sla_hours FROM efiling_workflow_stages WHERE id = $1
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
}

/**
 * Check if target role is CEO
 */
export function isCEORole(roleCode) {
    return roleCode === 'CEO' || roleCode === 'CEO_GROUP';
}

export { pauseSLA, resumeSLA, isCEORole };
```

### Step 4: Update Mark-To API with SLA Pause/Resume

Update `app/api/efiling/files/[id]/mark-to/route.js`:

```javascript
// Import SLA management functions
import { pauseSLA, resumeSLA, isCEORole } from '../../sla/manage/route';

// After determining target user role and before updating workflow:

// Check if we're moving TO CEO role
const targetRoleCode = t.role_code || '';
if (isCEORole(targetRoleCode)) {
    // Pause SLA
    await pauseSLA(client, id, workflowRes.rows[0].id, fromUser.id);
}

// Check if we're moving FROM CEO role
const currentRoleCode = actor.role_code || '';
if (isCEORole(currentRoleCode)) {
    // Resume SLA
    const nextStageRes = await client.query(`
        SELECT to_stage_id 
        FROM efiling_stage_transitions 
        WHERE from_stage_id = (
            SELECT current_stage_id FROM efiling_file_workflows WHERE file_id = $1
        ) AND is_active = true
        LIMIT 1
    `, [id]);
    
    if (nextStageRes.rows.length > 0) {
        await resumeSLA(client, id, workflowRes.rows[0].id, nextStageRes.rows[0].to_stage_id);
    }
}
```

### Step 5: Frontend Permission Checks

Update `app/efilinguser/files/[id]/edit-document/page.js`:

```javascript
// Add permission check on component mount
useEffect(() => {
    if (params.id && session?.user?.id) {
        fetchPermissions();
    }
}, [params.id, session?.user?.id]);

const fetchPermissions = async () => {
    try {
        const res = await fetch(`/api/efiling/files/${params.id}/permissions`);
        if (res.ok) {
            const { permissions } = await res.json();
            setCanEditDocument(permissions.canEdit);
            setHasUserSigned(permissions.hasSigned);
            
            // If user is not creator and not admin, redirect to view
            if (!permissions.canEdit && !permissions.is Admin) {
                router.replace(`/efilinguser/files/${params.id}/view-document`);
            }
        }
    } catch (error) {
        console.error('Error fetching permissions:', error);
        setCanEditDocument(false);
    }
};
```

Update `app/efilinguser/files/[id]/page.js`:

```javascript
// Add e-signature check before showing Mark To button
const [hasCreatorSigned, setHasCreatorSigned] = useState(false);

useEffect(() => {
    if (file && session?.user?.id) {
        checkCreatorSignature();
    }
}, [file, session?.user?.id]);

const checkCreatorSignature = async () => {
    try {
        const res = await fetch(`/api/efiling/files/${params.id}/permissions`);
        if (res.ok) {
            const { permissions } = await res.json();
            setHasCreatorSigned(permissions.hasSigned);
        }
    } catch (error) {
        console.error('Error checking signature:', error);
    }
};

// Update Mark/Forward button to be disabled without signature
<Button 
    variant="outline" 
    className="w-full justify-start" 
    onClick={openMarkModal}
    disabled={!hasCreatorSigned}
    title={!hasCreatorSigned ? "You must add e-signature before marking this file" : "Mark / Forward File"}
>
    <Forward className="w-4 h-4 mr-2" />
    Mark / Forward File
    {!hasCreatorSigned && <Shield className="w-4 h-4 ml-2 text-red-500" />}
</Button>
```

## CEO Role Identification

Based on the provided data:

```
CEO Role:
- role_id: 24
- code: 'CEO'
- name: 'CEO'
- department_id: 29 (CEO_O)

Workflow stages with CEO:
- Stage: COO marks to CEO (stage_order: 6, 11)
- Stage: CEO marks to CE (stage_order: 7, 12)
```

## Implementation Files

### Files to Create:
1. `app/api/efiling/files/[id]/permissions/route.js` - Permission check API
2. `app/api/efiling/sla/manage/route.js` - SLA pause/resume logic
3. `database/migrations/add_sla_pause_tracking.sql` - Database migration

### Files to Modify:
1. `app/api/efiling/files/[id]/mark-to/route.js` - Add signature validation & SLA pause/resume
2. `app/api/efiling/files/[id]/assign/route.js` - Add signature validation & SLA pause/resume
3. `app/efilinguser/files/[id]/edit-document/page.js` - Add permission checks
4. `app/efilinguser/files/[id]/page.js` - Add signature requirement UI
5. `app/efiling/files/[id]/edit-document/page.js` - Add permission checks for admin

## Testing Scenarios

### Scenario 1: File Creator Without Signature
1. User creates file
2. User tries to mark file → Should fail with error
3. User adds e-signature
4. User marks file → Should succeed

### Scenario 2: Marked User Permissions
1. User A marks file to User B
2. User B logs in
3. User B can:
   - View file ✓
   - Add e-signature ✓
   - Add comment ✓
   - Add attachment ✓
4. User B cannot:
   - Edit file content ✗
   - Change file metadata ✗

### Scenario 3: CEO SLA Pause
1. File is with COO (SLA timer running)
2. COO marks to CEO
3. SLA timer pauses
4. File stays with CEO for 5 days (no time counted)
5. CEO forwards to CE
6. SLA timer resumes
7. Total elapsed time excludes CEO review period

### Scenario 4: Admin Override
1. Admin logs in to efiling
2. Admin can edit ANY file
3. Admin can mark files without signing (optional - can be made mandatory)

## SLA Calculation Logic

```javascript
function calculateEffectiveSLA(workflow) {
    if (workflow.sla_paused) {
        // Currently paused - return paused time
        return {
            status: 'PAUSED',
            reason: 'Pending with CEO',
            accumulatedHours: workflow.sla_accumulated_hours,
            pausedAt: workflow.sla_paused_at
        };
    }
    
    const now = new Date();
    const deadline = new Date(workflow.sla_deadline);
    const accumulated = workflow.sla_accumulated_hours || 0;
    
    // Calculate remaining time
    const remainingMs = deadline - now;
    const remainingHours = remainingMs / (1000 * 60 * 60);
    
    return {
        status: remainingHours < 0 ? 'BREACHED' : 'ACTIVE',
        remainingHours,
        accumulatedHours: accumulated,
        deadline: workflow.sla_deadline,
        breached: workflow.sla_breached
    };
}
```

## UI Indicators

### SLA Display Component

```javascript
function SLAIndicator({ file, workflow }) {
    if (workflow?.sla_paused) {
        return (
            <Badge className="bg-blue-100 text-blue-800">
                <Pause className="w-3 h-3 mr-1" />
                SLA Paused (CEO Review)
            </Badge>
        );
    }
    
    if (file?.sla_breached) {
        return (
            <Badge className="bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                SLA Breached
            </Badge>
        );
    }
    
    // Show remaining time
    const remaining = calculateTimeRemaining(workflow?.sla_deadline);
    return (
        <Badge className="bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            {remaining}
        </Badge>
    );
}
```

## Next Steps

1. Run database migration to add SLA pause tracking columns
2. Create permission API endpoint
3. Update mark-to and assign APIs with signature validation
4. Implement SLA pause/resume in mark-to logic
5. Update frontend to check permissions
6. Add UI indicators for SLA status
7. Test all scenarios

## Deployment Commands

```bash
# 1. Run database migration
psql -U your_user -d your_db -f database/migrations/add_sla_pause_tracking.sql

# 2. Deploy code
cd /opt/wmp/wmp
git pull origin main
pm2 restart wmp

# 3. Verify
pm2 logs wmp --lines 100
```

## Summary

This implementation provides:
- ✅ Strict edit permissions (admin + creator only)
- ✅ Mandatory e-signature before marking
- ✅ Limited permissions for marked users
- ✅ CEO SLA pause/resume functionality
- ✅ Complete audit trail
- ✅ Permission API for frontend validation

