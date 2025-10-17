# E-Filing Permission & SLA System - Deployment Guide

## 🎯 What Was Implemented

### 1. File Edit Permissions ✅
- **Admin (efiling)**: Can edit ANY file
- **File Creator**: Can edit ONLY their own files  
- **Marked Users**: CANNOT edit - can only add e-sign, comments, attachments

### 2. Mandatory E-Signature ✅
- File creator MUST add e-signature before marking/forwarding
- API validates signature existence before allowing mark-to
- Returns error code `SIGNATURE_REQUIRED` if not signed

### 3. CEO SLA Pause/Resume ✅
- **When file reaches CEO**: SLA timer PAUSES
- **When CEO forwards file**: SLA timer RESUMES
- **Each time to CEO**: Timer pauses again
- Complete audit trail in `efiling_sla_pause_history`

## 📁 Files Created

### Database
1. **`database/migrations/add_sla_pause_tracking.sql`**
   - Adds SLA pause tracking columns
   - Creates `efiling_sla_pause_history` table
   - Creates `efiling_file_sla_status` view

### Backend APIs
2. **`app/api/efiling/files/[id]/permissions/route.js`**
   - Permission check API
   - Returns comprehensive permission set for current user
   - Checks creator, admin, assigned status

3. **`lib/efilingSLAManager.js`**
   - SLA pause/resume utility functions
   - `pauseSLA()` - Pause timer when reaching CEO
   - `resumeSLA()` - Resume timer when leaving CEO
   - `isCEORole()` - Check if role is CEO
   - `calculateEffectiveSLA()` - Calculate SLA status

### Modified Files
4. **`app/api/efiling/files/[id]/mark-to/route.js`**
   - Added e-signature validation
   - Added SLA pause/resume logic
   - Prevents marking without signature

## 🚀 Deployment Steps

### Step 1: Database Migration

```bash
# Connect to your PostgreSQL database
psql -U root -d your_database_name

# Run the migration script
\i /opt/wmp/wmp/database/migrations/add_sla_pause_tracking.sql

# Verify tables were created
\d efiling_sla_pause_history
\d+ efiling_file_workflows

# Verify view was created
\d efiling_file_sla_status

# Check columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'efiling_file_workflows' 
AND column_name IN ('sla_paused', 'sla_paused_at', 'sla_accumulated_hours', 'sla_pause_count');
```

### Step 2: Deploy Code

```bash
# Navigate to project
cd /opt/wmp/wmp

# Pull latest changes
git pull origin main

# Install any new dependencies (if any)
npm install

# Restart PM2
pm2 restart wmp

# Monitor logs
pm2 logs wmp --lines 50
```

### Step 3: Verify Deployment

```bash
# Check if app is running
pm2 status

# Test permission API
curl -X GET http://202.61.47.29:3000/api/efiling/files/1/permissions \
  -H "Cookie: your-session-cookie"

# Should return:
# {"permissions": {"canEdit": true/false, "canMarkTo": true/false, ...}}
```

## 🧪 Testing Scenarios

### Test 1: File Creator Without Signature

**Steps:**
1. Login as file creator (efilinguser)
2. Create a new file
3. Try to click "Mark To" → Should be disabled with tooltip
4. Try API call without signature → Should return 403 error
5. Add e-signature
6. "Mark To" button should become enabled
7. Mark file to another user → Should succeed

**Expected Results:**
- ❌ Cannot mark file without signature
- ✅ Can mark file after signing
- ✅ Error message: "File creator must add e-signature before marking to others"

### Test 2: Marked User Permissions

**Steps:**
1. User A (creator) marks file to User B
2. Login as User B
3. Try to edit file → Should redirect to view-only
4. Add e-signature → ✅ Should work
5. Add comment → ✅ Should work
6. Add attachment → ✅ Should work
7. Try to modify document content → ❌ Should fail

**Expected Results:**
- ✅ User B can view file
- ✅ User B can add e-signature, comment, attachment
- ❌ User B cannot edit file content
- ❌ Edit button not visible for User B

### Test 3: CEO SLA Pause

**Steps:**
1. Create file in COO role
2. Check SLA status → Should show "ACTIVE" with deadline
3. Mark file to CEO
4. Check SLA status → Should show "PAUSED"
5. Wait 2 hours
6. Login as CEO, forward file to CE
7. Check SLA status → Should show "ACTIVE" with new deadline
8. Verify pause duration was recorded

**SQL to Check:**
```sql
-- Check SLA status
SELECT * FROM efiling_file_sla_status WHERE file_id = <file_id>;

-- Check pause history
SELECT * FROM efiling_sla_pause_history WHERE file_id = <file_id>;

-- Verify accumulated hours don't include CEO pause time
SELECT 
    file_id, 
    sla_paused, 
    sla_accumulated_hours, 
    sla_pause_count,
    sla_deadline
FROM efiling_file_workflows 
WHERE file_id = <file_id>;
```

**Expected Results:**
- ✅ SLA pauses when file reaches CEO
- ✅ SLA resumes when CEO forwards
- ✅ Pause duration excluded from total time
- ✅ Multiple pauses tracked (if file returns to CEO)

### Test 4: Admin Override

**Steps:**
1. Login as admin (efiling)
2. Open any file created by another user
3. Edit button should be visible
4. Edit file content → ✅ Should work
5. Mark file without signing → ✅ Should work (admin bypass)

**Expected Results:**
- ✅ Admin can edit any file
- ✅ Admin can mark without signing (optional requirement)

## 📊 Database Schema Changes

### New Columns in `efiling_file_workflows`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| sla_paused | BOOLEAN | FALSE | TRUE when SLA is paused |
| sla_paused_at | TIMESTAMP | NULL | When SLA was paused |
| sla_accumulated_hours | NUMERIC(10,2) | 0.00 | Hours accumulated before pause |
| sla_pause_count | INTEGER | 0 | Number of times paused |

### New Table: `efiling_sla_pause_history`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| file_id | INTEGER | Reference to efiling_files |
| workflow_id | INTEGER | Reference to efiling_file_workflows |
| paused_at | TIMESTAMP | When paused |
| resumed_at | TIMESTAMP | When resumed (NULL if active) |
| pause_reason | VARCHAR(100) | Reason (CEO_REVIEW) |
| paused_by_user_id | INTEGER | User who caused pause |
| paused_by_stage_id | INTEGER | Stage where pause occurred |
| duration_hours | NUMERIC(10,2) | Pause duration (calculated on resume) |

### New View: `efiling_file_sla_status`

Provides real-time SLA status for all files:
- `sla_status`: PAUSED, BREACHED, ACTIVE, COMPLETED
- `hours_remaining`: Calculated remaining time
- `current_stage_role_code`: Current role handling file

## 🔍 API Endpoints

### GET `/api/efiling/files/[id]/permissions`

**Response:**
```json
{
  "permissions": {
    "canEdit": true,
    "canView": true,
    "canAddSignature": true,
    "canAddComment": true,
    "canAddAttachment": true,
    "canMarkTo": false,
    "canApprove": false,
    "canReject": false,
    "canForward": false,
    "isAdmin": false,
    "isCreator": true,
    "isAssigned": true,
    "isMarkedTo": false,
    "hasSigned": false,
    "creatorHasSigned": false,
    "requiresSignature": true,
    "requiresCreatorSignature": true
  }
}
```

### POST `/api/efiling/files/[id]/mark-to`

**Before (No validation):**
- Any user could mark file
- No signature requirement

**After (With validation):**
- Checks if creator has signed
- Returns 403 if no signature
- Pauses/resumes SLA based on CEO role
- Error code: `SIGNATURE_REQUIRED`

## 📈 Monitoring & Verification

### Check SLA Pause Events

```sql
-- Recent SLA pause events
SELECT 
    sph.file_id,
    f.file_number,
    sph.paused_at,
    sph.resumed_at,
    sph.duration_hours,
    sph.pause_reason,
    u.name as paused_by_user_name
FROM efiling_sla_pause_history sph
JOIN efiling_files f ON sph.file_id = f.id
LEFT JOIN efiling_users eu ON sph.paused_by_user_id = eu.id
LEFT JOIN users u ON eu.user_id = u.id
ORDER BY sph.paused_at DESC
LIMIT 20;
```

### Check Files with Paused SLA

```sql
-- Files currently with paused SLA
SELECT 
    f.id,
    f.file_number,
    wf.sla_paused,
    wf.sla_paused_at,
    wf.sla_accumulated_hours,
    wf.sla_pause_count,
    r.code as current_role
FROM efiling_files f
JOIN efiling_file_workflows wf ON wf.file_id = f.id
JOIN efiling_workflow_stages ws ON ws.id = wf.current_stage_id
JOIN efiling_roles r ON r.id = ws.role_id
WHERE wf.sla_paused = TRUE;
```

### Check Permission Violations

```sql
-- Files marked without creator signature (should be empty after fix)
SELECT 
    f.id,
    f.file_number,
    f.created_by,
    COUNT(DISTINCT fm.id) as mark_count,
    COUNT(DISTINCT eds.id) as signature_count
FROM efiling_files f
LEFT JOIN efiling_file_movements fm ON fm.file_id = f.id
LEFT JOIN efiling_document_signatures eds ON eds.file_id = f.id
JOIN efiling_users eu ON eu.id = f.created_by
WHERE eds.user_id = eu.user_id
GROUP BY f.id, f.file_number, f.created_by
HAVING COUNT(DISTINCT fm.id) > 0 AND COUNT(DISTINCT eds.id) = 0;
```

## ⚠️ Important Notes

### 1. Existing Files
- Existing files in system may not have signatures
- Migration adds columns with safe defaults
- Consider running data validation script

### 2. Admin Bypass
- Admins (role 1, 2) can mark files without signing
- This is intentional for administrative overrides
- Can be changed if admins should also sign

### 3. CEO Role Detection
- Currently checks for role code 'CEO' or 'CEO_GROUP'
- Based on your data, CEO role_id = 24, code = 'CEO'
- Automatic pause/resume on role detection

### 4. SLA Calculation
- Accumulated hours = time spent before pauses
- Pause duration = time spent with CEO (excluded from SLA)
- Total effective time = accumulated + current (if not paused)

## 🐛 Troubleshooting

### Issue: Mark-to fails with "SIGNATURE_REQUIRED"
**Cause**: Creator hasn't signed file  
**Solution**: Add e-signature before marking

### Issue: SLA not pausing at CEO
**Cause**: Role code mismatch or workflow_id missing  
**Solution**: Check efiling_roles table for CEO code, verify workflow exists

### Issue: Permission API returns 403
**Cause**: User not in efiling_users table  
**Solution**: Ensure user has efiling profile created

### Issue: Migration fails
**Cause**: Columns may already exist  
**Solution**: Migration uses `IF NOT EXISTS` - safe to rerun

## 📝 Configuration

### CEO Roles (in `lib/efilingSLAManager.js`)

```javascript
export function isCEORole(roleCode) {
    const ceoRoles = ['CEO', 'CEO_GROUP'];
    return ceoRoles.includes(roleCode.toUpperCase());
}
```

To add more CEO roles, update this array.

### SLA Hours by Role

Currently in mark-to route:
```javascript
if (roleCode === 'SE') addHours = 0;
else if (roleCode === 'CONSULTANT') addHours = 48;
else if (roleCode === 'IAO_II') addHours = 24;
else if (roleCode === 'PROCUREMENT_COMMITTEE') addHours = 7 * 24;
```

This should be moved to workflow_stages.sla_hours (already exists in DB).

## ✅ Verification Checklist

After deployment, verify:

- [ ] Database migration completed without errors
- [ ] New columns exist in efiling_file_workflows
- [ ] efiling_sla_pause_history table created
- [ ] efiling_file_sla_status view created
- [ ] Permission API returns correct permissions
- [ ] Mark-to validates signatures
- [ ] SLA pauses when file goes to CEO
- [ ] SLA resumes when CEO forwards
- [ ] Marked users cannot edit files
- [ ] Admins can edit all files
- [ ] Creators can edit their own files

## 🔄 Rollback Plan

If issues occur:

```sql
-- Rollback migration (if needed)
ALTER TABLE efiling_file_workflows 
DROP COLUMN IF EXISTS sla_paused,
DROP COLUMN IF EXISTS sla_paused_at,
DROP COLUMN IF EXISTS sla_accumulated_hours,
DROP COLUMN IF EXISTS sla_pause_count;

DROP TABLE IF EXISTS efiling_sla_pause_history CASCADE;
DROP VIEW IF EXISTS efiling_file_sla_status CASCADE;
```

```bash
# Revert code
cd /opt/wmp/wmp
git revert HEAD
pm2 restart wmp
```

## 📞 Support

For issues:
1. Check PM2 logs: `pm2 logs wmp --lines 100`
2. Check database: Review query logs
3. Check browser console: For frontend errors
4. Review: `EFILING_PERMISSION_AND_SLA_IMPLEMENTATION.md`

## Next Steps

1. Run database migration ✓
2. Deploy code changes ✓
3. Test permission system
4. Test SLA pause/resume
5. Monitor for 24 hours
6. Collect user feedback

## Summary

All requirements have been implemented:
- ✅ Edit permissions restricted to admin + creator
- ✅ E-signature mandatory before marking
- ✅ Marked users limited to sign/comment/attach
- ✅ CEO SLA pause/resume functionality
- ✅ Complete audit trail
- ✅ Permission validation API

The system is ready for testing and deployment!

