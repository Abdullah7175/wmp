# Team-Based Workflow System - Implementation Plan

## 📋 Executive Summary

This document outlines the implementation plan for adding team-based workflow functionality to the e-filing system. The system will support:
- **Team Structure**: EE teams (DAO, AEE, Sub-engineer) and CE teams (AO/Assistant)
- **Internal Team Workflow**: Files circulate within EE's team without TAT
- **External Workflow**: TAT starts when file moves to SE or higher
- **Editing Restrictions**: Files can only be edited by creator when within their team
- **CE Page Addition**: CE and assistants can add pages but not edit existing content

---

## 🎯 Requirements Analysis

### 1. Team Structure
- **Executive Engineer (EE)** → Team: DAO, AEE, Sub-engineer
- **Superintendent Engineer (SE)** → Team: Account Officer (AO) / Assistant
- **Chief Engineer (CE)** → Team: Account Officer (AO) / Assistant
- Team members are assistants under their managers
- **Team members can mark files between themselves** until manager adds e-sign and marks forward

### 2. Workflow Process

#### Phase 1: Internal Team Workflow (No TAT)
```
EE creates file
  ↓
EE marks to Sub-engineer → Sub-engineer adds length calculations & material estimates → Marks back to EE
  ↓
EE marks to AEE → AEE adds their work → Marks back to EE
  ↓
EE marks to DAO → DAO adds financial details → Marks back to EE
  ↓
EE reviews completely → Adds e-signature → Marks to SE
```

#### Phase 2: External Workflow (TAT Starts)
```
EE (with e-sign) marks to SE
  ↓
TAT timer STARTS
  ↓
SE can add pages/notesheet (SE's assistant can also add pages)
  ↓
SE adds e-sign → Marks to Consultant
  ↓
Consultant adds comments & e-sign → Marks to CE
  ↓
CE can add pages/notesheet (CE's assistant can also add pages)
  ↓
CE adds e-sign → Marks forward
  ↓
SE/CE/CFO/COO/CEO can mark back to EE (if mistakes found)
  ↓
EE can edit again (only if marked back)
```

### 3. SE/CE Level Special Rules
- When file marked to SE → Simultaneously visible to SE's Assistant/AO
- When file marked to CE → Simultaneously visible to CE's Assistant/AO
- SE/CE cannot edit existing content
- SE/CE can ADD new pages/notesheet
- SE's/CE's Assistant can also add pages
- Assistant-added pages must be e-signed by SE/CE before marking forward
- Timeline shows page additions

### 4. Editing Restrictions
- **Within Team**: EE and team members can edit (team members can mark between themselves)
- **After EE marks to SE (with e-sign)**: No one can edit (including EE)
- **If Marked Back**: Only EE can edit again
- **SE/CE Level**: Can add pages, cannot edit existing content
- **Team Members**: Can mark files between themselves until EE adds e-sign and marks to SE

---

## 🗄️ Database Schema Changes

### New Tables Required

#### 1. `efiling_user_teams`
```sql
CREATE TABLE public.efiling_user_teams (
    id SERIAL PRIMARY KEY,
    manager_id INTEGER NOT NULL REFERENCES efiling_users(id) ON DELETE CASCADE,
    team_member_id INTEGER NOT NULL REFERENCES efiling_users(id) ON DELETE CASCADE,
    team_role VARCHAR(50) NOT NULL, -- 'DAO', 'AEE', 'SUB_ENGINEER', 'AO', 'ASSISTANT'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_member UNIQUE (manager_id, team_member_id)
);

CREATE INDEX idx_team_manager ON efiling_user_teams(manager_id);
CREATE INDEX idx_team_member ON efiling_user_teams(team_member_id);
CREATE INDEX idx_team_active ON efiling_user_teams(manager_id, is_active) WHERE is_active = true;
```

**Purpose**: Links team members (assistants) to their managers (EE/CE)

#### 2. `efiling_file_workflow_states`
```sql
CREATE TABLE public.efiling_file_workflow_states (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES efiling_files(id) ON DELETE CASCADE,
    current_state VARCHAR(50) NOT NULL, -- 'TEAM_INTERNAL', 'EXTERNAL', 'RETURNED_TO_CREATOR'
    current_assigned_to INTEGER REFERENCES efiling_users(id),
    creator_id INTEGER NOT NULL REFERENCES efiling_users(id),
    is_within_team BOOLEAN DEFAULT true,
    tat_started BOOLEAN DEFAULT false,
    tat_started_at TIMESTAMP NULL,
    last_external_mark_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_file_state UNIQUE (file_id)
);

CREATE INDEX idx_workflow_state_file ON efiling_file_workflow_states(file_id);
CREATE INDEX idx_workflow_state_assigned ON efiling_file_workflow_states(current_assigned_to);
CREATE INDEX idx_workflow_state_creator ON efiling_file_workflow_states(creator_id);
CREATE INDEX idx_workflow_state_type ON efiling_file_workflow_states(current_state);
```

**Purpose**: Tracks file workflow state (internal team vs external)

#### 3. `efiling_file_page_additions`
```sql
CREATE TABLE public.efiling_file_page_additions (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES efiling_files(id) ON DELETE CASCADE,
    page_id INTEGER NOT NULL REFERENCES efiling_document_pages(id) ON DELETE CASCADE,
    added_by INTEGER NOT NULL REFERENCES efiling_users(id),
    added_by_role_code VARCHAR(50),
    addition_type VARCHAR(50) DEFAULT 'CE_PAGE', -- 'CE_PAGE', 'ASSISTANT_PAGE'
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL
);

CREATE INDEX idx_page_additions_file ON efiling_file_page_additions(file_id);
CREATE INDEX idx_page_additions_user ON efiling_file_page_additions(added_by);
CREATE INDEX idx_page_additions_type ON efiling_file_page_additions(addition_type);
```

**Purpose**: Tracks pages added by CE/Assistant (for timeline)

### Modified Tables

#### 1. `efiling_files` - Add Column
```sql
ALTER TABLE efiling_files
ADD COLUMN workflow_state_id INTEGER REFERENCES efiling_file_workflow_states(id);
```

#### 2. `efiling_file_movements` - Add Columns
```sql
ALTER TABLE efiling_file_movements
ADD COLUMN is_team_internal BOOLEAN DEFAULT false,
ADD COLUMN is_return_to_creator BOOLEAN DEFAULT false,
ADD COLUMN tat_started BOOLEAN DEFAULT false;
```

---

## 🔧 Implementation Components

### Phase 1: Database & Core Logic

#### 1.1 Team Management API
**File**: `app/api/efiling/teams/route.js`
- `GET /api/efiling/teams?manager_id=X` - Get team members for a manager
- `POST /api/efiling/teams` - Add team member to manager
- `PUT /api/efiling/teams/[id]` - Update team member
- `DELETE /api/efiling/teams/[id]` - Remove team member

**File**: `lib/efilingTeamManager.js`
- `getTeamMembers(managerId)` - Get all active team members
- `isTeamMember(managerId, userId)` - Check if user is team member
- `getManagerForUser(userId)` - Get manager for a team member
- `isWithinTeamWorkflow(fileId, fromUserId, toUserId)` - Check if movement is within team

#### 1.2 Workflow State Manager
**File**: `lib/efilingWorkflowStateManager.js`
- `initializeWorkflowState(fileId, creatorId)` - Create initial state
- `updateWorkflowState(fileId, newState, assignedTo, isTeamInternal)` - Update state
- `canEditFile(fileId, userId)` - Check if user can edit
- `canAddPages(fileId, userId)` - Check if user can add pages (CE/Assistant)
- `isFileWithTeam(fileId)` - Check if file is within team workflow
- `startTAT(fileId)` - Start TAT timer when moving to external

#### 1.3 Permission Logic Updates
**File**: `app/api/efiling/files/[id]/permissions/route.js` (MODIFY)
- Add `isTeamMember` check
- Add `isWithinTeamWorkflow` check
- Add `canAddPages` for CE/Assistant
- Update `canEdit` logic:
  ```javascript
  canEdit = (isCreator && isWithinTeam) || (isCreator && isReturnedToCreator)
  canAddPages = (isCE && fileAssignedToCE) || (isAssistant && fileAssignedToManager)
  ```

### Phase 2: Mark-To Logic Updates

#### 2.1 Mark-To API Updates
**File**: `app/api/efiling/files/[id]/mark-to/route.js` (MODIFY)

**New Logic Flow**:
```javascript
1. Check if movement is within team (EE → Team Member)
   - If yes: Set is_team_internal = true, tat_started = false
   - Create workflow state: 'TEAM_INTERNAL'
   
2. Check if movement is to external (EE → SE or higher)
   - If yes: Set is_team_internal = false, tat_started = true
   - Create workflow state: 'EXTERNAL'
   - Start TAT timer
   
3. Check if movement is return to creator (SE/CE/CFO/COO/CEO → EE)
   - If yes: Set is_return_to_creator = true
   - Create workflow state: 'RETURNED_TO_CREATOR'
   - Allow EE to edit again
   
4. Special: CE marking
   - When file marked to CE, also assign to CE's Assistant/AO
   - Both CE and Assistant can see file simultaneously
```

#### 2.2 Allowed Recipients Logic
**File**: `lib/efilingGeographicRouting.js` (MODIFY)
- Add function `getTeamMembersForMarking(managerId)` - Include team members in allowed recipients
- Update `getAllowedRecipients()` to include team members when from user is EE/CE

### Phase 3: File Editing Restrictions

#### 3.1 Edit Document API Updates
**File**: `app/api/efiling/files/[id]/document/route.js` (MODIFY)
- Add workflow state check before allowing edits
- Block edits if file is in 'EXTERNAL' state (unless returned to creator)
- Allow edits only if:
  - User is creator AND file is in 'TEAM_INTERNAL' state, OR
  - User is creator AND file is in 'RETURNED_TO_CREATOR' state

#### 3.2 Page Addition API
**File**: `app/api/efiling/files/[id]/pages/route.js` (NEW)
- `POST /api/efiling/files/[id]/pages` - Add new page (CE/Assistant only)
- Validate user is CE or Assistant
- Validate file is assigned to CE
- Create page and log in `efiling_file_page_additions`
- Update timeline

### Phase 4: UI Updates

#### 4.1 Team Management UI (Admin)
**File**: `app/efiling/users/[id]/team/page.js` (NEW)
- Display team members for a user
- Add/Remove team members
- Show team hierarchy

#### 4.2 File Edit Page Updates
**File**: `app/efilinguser/files/[id]/edit-document/page.js` (MODIFY)
- Check workflow state before allowing edits
- Show message if editing is blocked
- Show "Add Page" button for CE/Assistant (if applicable)

#### 4.3 Mark-To Modal Updates
**File**: `app/efilinguser/components/MarkToModal.jsx` (MODIFY)
- Show team members separately in dropdown
- Indicate which recipients are team members
- Show TAT status (will start/continue)

#### 4.4 Timeline Updates
**File**: `app/efilinguser/files/[id]/view-document/page.js` (MODIFY)
- Show team internal movements differently
- Show TAT start point
- Show page additions by CE/Assistant
- Show return-to-creator events

### Phase 5: SLA/TAT Management

#### 5.1 TAT Logic Updates
**File**: `lib/efilingSLAManager.js` (MODIFY)
- Update `calculateSLA()` to skip TAT for team internal movements
- Start TAT only when file moves to SE or higher
- Resume TAT if file returns to external after being returned

---

## 📝 SQL Migration Script

```sql
-- ============================================
-- TEAM-BASED WORKFLOW SYSTEM - MIGRATION SCRIPT
-- ============================================

-- 1. Create efiling_user_teams table
CREATE TABLE IF NOT EXISTS public.efiling_user_teams (
    id SERIAL PRIMARY KEY,
    manager_id INTEGER NOT NULL REFERENCES efiling_users(id) ON DELETE CASCADE,
    team_member_id INTEGER NOT NULL REFERENCES efiling_users(id) ON DELETE CASCADE,
    team_role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_team_member UNIQUE (manager_id, team_member_id),
    CONSTRAINT check_not_self_reference CHECK (manager_id != team_member_id)
);

CREATE INDEX idx_team_manager ON efiling_user_teams(manager_id);
CREATE INDEX idx_team_member ON efiling_user_teams(team_member_id);
CREATE INDEX idx_team_active ON efiling_user_teams(manager_id, is_active) WHERE is_active = true;

COMMENT ON TABLE efiling_user_teams IS 'Links team members (assistants) to their managers (EE/CE)';
COMMENT ON COLUMN efiling_user_teams.team_role IS 'Role in team: DAO, AEE, SUB_ENGINEER, AO, ASSISTANT';

-- 2. Create efiling_file_workflow_states table
CREATE TABLE IF NOT EXISTS public.efiling_file_workflow_states (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES efiling_files(id) ON DELETE CASCADE,
    current_state VARCHAR(50) NOT NULL DEFAULT 'TEAM_INTERNAL',
    current_assigned_to INTEGER REFERENCES efiling_users(id),
    creator_id INTEGER NOT NULL REFERENCES efiling_users(id),
    is_within_team BOOLEAN DEFAULT true,
    tat_started BOOLEAN DEFAULT false,
    tat_started_at TIMESTAMP NULL,
    last_external_mark_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_file_state UNIQUE (file_id),
    CONSTRAINT check_state_values CHECK (current_state IN ('TEAM_INTERNAL', 'EXTERNAL', 'RETURNED_TO_CREATOR'))
);

CREATE INDEX idx_workflow_state_file ON efiling_file_workflow_states(file_id);
CREATE INDEX idx_workflow_state_assigned ON efiling_file_workflow_states(current_assigned_to);
CREATE INDEX idx_workflow_state_creator ON efiling_file_workflow_states(creator_id);
CREATE INDEX idx_workflow_state_type ON efiling_file_workflow_states(current_state);
CREATE INDEX idx_workflow_state_team ON efiling_file_workflow_states(is_within_team) WHERE is_within_team = true;

COMMENT ON TABLE efiling_file_workflow_states IS 'Tracks file workflow state (internal team vs external)';
COMMENT ON COLUMN efiling_file_workflow_states.current_state IS 'TEAM_INTERNAL, EXTERNAL, or RETURNED_TO_CREATOR';
COMMENT ON COLUMN efiling_file_workflow_states.is_within_team IS 'True if file is within creator team workflow';
COMMENT ON COLUMN efiling_file_workflow_states.tat_started IS 'True if TAT timer has started';

-- 3. Create efiling_file_page_additions table
CREATE TABLE IF NOT EXISTS public.efiling_file_page_additions (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES efiling_files(id) ON DELETE CASCADE,
    page_id INTEGER NOT NULL REFERENCES efiling_document_pages(id) ON DELETE CASCADE,
    added_by INTEGER NOT NULL REFERENCES efiling_users(id),
    added_by_role_code VARCHAR(50),
    addition_type VARCHAR(50) DEFAULT 'CE_PAGE',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL
);

CREATE INDEX idx_page_additions_file ON efiling_file_page_additions(file_id);
CREATE INDEX idx_page_additions_user ON efiling_file_page_additions(added_by);
CREATE INDEX idx_page_additions_type ON efiling_file_page_additions(addition_type);

COMMENT ON TABLE efiling_file_page_additions IS 'Tracks pages added by CE/Assistant for timeline';
COMMENT ON COLUMN efiling_file_page_additions.addition_type IS 'SE_PAGE, CE_PAGE, SE_ASSISTANT_PAGE, or CE_ASSISTANT_PAGE';

-- 4. Add workflow_state_id to efiling_files
ALTER TABLE efiling_files
ADD COLUMN IF NOT EXISTS workflow_state_id INTEGER REFERENCES efiling_file_workflow_states(id);

CREATE INDEX idx_efiling_files_workflow_state ON efiling_files(workflow_state_id);

-- 5. Add columns to efiling_file_movements
ALTER TABLE efiling_file_movements
ADD COLUMN IF NOT EXISTS is_team_internal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_return_to_creator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tat_started BOOLEAN DEFAULT false;

CREATE INDEX idx_movements_team_internal ON efiling_file_movements(is_team_internal) WHERE is_team_internal = true;
CREATE INDEX idx_movements_return_to_creator ON efiling_file_movements(is_return_to_creator) WHERE is_return_to_creator = true;
CREATE INDEX idx_movements_tat_started ON efiling_file_movements(tat_started) WHERE tat_started = true;

-- 6. Create trigger function for updating workflow states
CREATE OR REPLACE FUNCTION update_workflow_state_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Update workflow state when file is moved
    UPDATE efiling_file_workflow_states
    SET 
        current_assigned_to = NEW.to_user_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE file_id = NEW.file_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for file movements
DROP TRIGGER IF EXISTS trigger_update_workflow_state ON efiling_file_movements;
CREATE TRIGGER trigger_update_workflow_state
AFTER INSERT ON efiling_file_movements
FOR EACH ROW
EXECUTE FUNCTION update_workflow_state_on_movement();

-- 8. Create function to initialize workflow state for existing files
CREATE OR REPLACE FUNCTION initialize_existing_file_states()
RETURNS void AS $$
DECLARE
    file_record RECORD;
BEGIN
    FOR file_record IN 
        SELECT id, created_by, assigned_to 
        FROM efiling_files 
        WHERE workflow_state_id IS NULL
    LOOP
        INSERT INTO efiling_file_workflow_states (
            file_id, 
            creator_id, 
            current_assigned_to,
            current_state,
            is_within_team,
            tat_started
        ) VALUES (
            file_record.id,
            file_record.created_by,
            COALESCE(file_record.assigned_to, file_record.created_by),
            'TEAM_INTERNAL',
            true,
            false
        )
        ON CONFLICT (file_id) DO NOTHING;
        
        UPDATE efiling_files
        SET workflow_state_id = (
            SELECT id FROM efiling_file_workflow_states WHERE file_id = file_record.id
        )
        WHERE id = file_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run initialization for existing files
SELECT initialize_existing_file_states();

-- 9. Create view for team hierarchy
CREATE OR REPLACE VIEW v_efiling_team_hierarchy AS
SELECT 
    t.id,
    t.manager_id,
    m.name as manager_name,
    m.efiling_role_id as manager_role_id,
    mr.code as manager_role_code,
    t.team_member_id,
    tm.name as team_member_name,
    tm.efiling_role_id as team_member_role_id,
    tmr.code as team_member_role_code,
    t.team_role,
    t.is_active,
    t.created_at,
    t.updated_at
FROM efiling_user_teams t
JOIN efiling_users m ON t.manager_id = m.id
JOIN efiling_users tm ON t.team_member_id = tm.id
LEFT JOIN efiling_roles mr ON m.efiling_role_id = mr.id
LEFT JOIN efiling_roles tmr ON tm.efiling_role_id = tmr.id
WHERE t.is_active = true;

COMMENT ON VIEW v_efiling_team_hierarchy IS 'View showing team hierarchy with manager and team member details';

-- 10. Grant permissions
GRANT ALL ON TABLE efiling_user_teams TO root;
GRANT ALL ON TABLE efiling_file_workflow_states TO root;
GRANT ALL ON TABLE efiling_file_page_additions TO root;
GRANT SELECT ON VIEW v_efiling_team_hierarchy TO root;
```

---

## 🔄 Implementation Phases

### Phase 1: Database Setup (Week 1)
1. ✅ Run SQL migration script
2. ✅ Create team management APIs
3. ✅ Create workflow state manager library
4. ✅ Test database operations

### Phase 2: Core Logic (Week 2)
1. ✅ Update mark-to API with team logic
2. ✅ Update permission checks
3. ✅ Update SLA/TAT logic
4. ✅ Test workflow state transitions

### Phase 3: Editing Restrictions (Week 3)
1. ✅ Update edit document API
2. ✅ Create page addition API
3. ✅ Update permission API
4. ✅ Test editing restrictions

### Phase 4: UI Updates (Week 4)
1. ✅ Team management UI (admin)
2. ✅ Update file edit page
3. ✅ Update mark-to modal
4. ✅ Update timeline display
5. ✅ Test UI workflows

### Phase 5: Testing & Refinement (Week 5)
1. ✅ End-to-end testing
2. ✅ Bug fixes
3. ✅ Performance optimization
4. ✅ Documentation

---

## 🧪 Test Scenarios

### Scenario 1: EE Team Workflow
1. EE creates file → State: TEAM_INTERNAL, TAT: Not Started
2. EE marks to Sub-engineer → State: TEAM_INTERNAL, TAT: Not Started
3. EE marks to DAO → State: TEAM_INTERNAL, TAT: Not Started
4. EE marks to SE → State: EXTERNAL, TAT: Started
5. ✅ Verify: Only EE can edit during team workflow
6. ✅ Verify: TAT starts only when marked to SE

### Scenario 2: Return to Creator
1. File with SE
2. SE marks back to EE → State: RETURNED_TO_CREATOR
3. ✅ Verify: EE can edit again
4. EE marks to SE again → State: EXTERNAL
5. ✅ Verify: EE cannot edit anymore

### Scenario 3: CE Page Addition
1. File marked to CE
2. CE's Assistant can see file
3. CE adds page → Logged in page_additions
4. Assistant adds page → Logged in page_additions
5. ✅ Verify: Timeline shows page additions
6. ✅ Verify: CE/Assistant cannot edit existing content

### Scenario 4: Multiple Team Members
1. EE marks to Sub-engineer → Only Sub-engineer sees file
2. EE marks to DAO → Only DAO sees file
3. ✅ Verify: Only one team member sees file at a time

---

## 📊 Key Functions to Implement

### 1. Team Management
```javascript
// lib/efilingTeamManager.js
- getTeamMembers(managerId)
- addTeamMember(managerId, memberId, role)
- removeTeamMember(managerId, memberId)
- isTeamMember(managerId, userId)
- getManagerForUser(userId)
- isWithinTeamWorkflow(fileId, fromUserId, toUserId)
```

### 2. Workflow State
```javascript
// lib/efilingWorkflowStateManager.js
- initializeWorkflowState(fileId, creatorId)
- updateWorkflowState(fileId, newState, assignedTo, isTeamInternal)
- getWorkflowState(fileId)
- canEditFile(fileId, userId)
- canAddPages(fileId, userId)
- isFileWithTeam(fileId)
- startTAT(fileId)
- markReturnToCreator(fileId)
```

### 3. Permission Checks
```javascript
// Updated in app/api/efiling/files/[id]/permissions/route.js
- Check isTeamMember
- Check workflow state
- Check canEdit based on state
- Check canAddPages for CE/Assistant
```

---

## 🚨 Important Notes

1. **Backward Compatibility**: Existing files will be initialized with 'TEAM_INTERNAL' state
2. **TAT Calculation**: TAT only counts time in 'EXTERNAL' state
3. **CE Simultaneous Access**: When file marked to CE, both CE and Assistant see it (special handling)
4. **Page Addition Tracking**: All page additions by CE/Assistant are logged for timeline
5. **Editing Lock**: Once file moves to SE, editing is locked until returned to creator

---

## 📋 Checklist Before Implementation

- [ ] Review and approve database schema
- [ ] Review and approve API changes
- [ ] Review and approve UI changes
- [ ] Plan rollback strategy
- [ ] Plan data migration for existing files
- [ ] Set up testing environment
- [ ] Create backup of current database

---

## 🎯 Success Criteria

1. ✅ EE can mark files to team members without TAT
2. ✅ TAT starts only when file moves to SE or higher
3. ✅ Only EE can edit file when within team or returned
4. ✅ CE and Assistant can add pages but not edit existing content
5. ✅ Timeline shows all workflow events including page additions
6. ✅ Team management UI allows adding/removing team members
7. ✅ All existing functionality remains intact

---

## 📞 Clarifications (CONFIRMED)

1. ✅ **Team members CAN mark files between themselves** - Any team member of EE can mark file to other team members until EE adds e-sign and marks to SE

2. ✅ **CE Assistant can only add pages** - Only CE can mark forward. Assistant can only add pages, which CE must e-sign before marking forward

3. ✅ **Sequential workflow** - Only one team member at a time (no simultaneous work)

4. ✅ **EE marks to one team member at a time** - Sequential flow: EE → Sub-engineer → EE → AEE → EE → DAO → EE → (EE adds e-sign) → SE

5. ✅ **Team members see only assigned files** - Confirmed

6. ✅ **E-signature requirement in external flow** - Each person must add e-sign before marking forward:
   - EE → SE (EE must sign)
   - SE → Consultant (SE must sign)
   - Consultant → CE (Consultant must sign)
   - CE → Others (CE must sign)

7. ✅ **SE also has assistant** - SE can add pages/notesheet like CE, and SE's assistant can also add pages

---

**END OF PLAN**

