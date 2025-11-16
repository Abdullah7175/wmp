# E-Filing Geographic Routing Implementation - Complete

## ✅ Files Created/Updated

### 1. SQL Scripts
- ✅ `efiling_geographic_migration.sql` - Adds geographic columns and marking rules table
- ✅ `efiling_workflow_cleanup.sql` - Removes unnecessary workflow tables

### 2. Core Library
- ✅ `lib/efilingGeographicRouting.js` - Geographic routing helper functions
  - `getAllowedRecipients()` - Gets users who can receive files
  - `getMarkingRule()` - Validates marking transitions
  - `validateGeographicMatch()` - Checks geographic compatibility

### 3. API Updates

#### File Creation
- ✅ `app/api/efiling/files/route.js` (POST)
  - Auto-populates `district_id`, `town_id`, `division_id` from creator
  - Removed workflow template dependency
  - Geography set based on `department_type`:
    - `district` → uses creator's district_id, town_id
    - `division` → uses creator's division_id
    - `global` → geography remains null

#### File Marking
- ✅ `app/api/efiling/files/[id]/mark-to/route.js` (POST)
  - Uses `efiling_marking_rules` instead of workflow stages
  - Applies geographic filtering
  - CEO bypass for global scope
  - GET endpoint returns allowed recipients

- ✅ `app/api/efiling/files/[id]/assign/route.js` (POST)
  - Uses geographic routing helpers
  - Validates marking rules
  - Geographic matching validation

#### New Endpoint
- ✅ `app/api/efiling/files/[id]/marking-recipients/route.js` (GET)
  - Returns list of users who can receive the file
  - Filtered by marking rules + geography
  - Use this for "Mark To" dropdown

#### User Management
- ✅ `app/api/efiling/users/route.js`
  - POST/PUT now accepts `district_id`, `town_id`, `subtown_id`, `division_id`
  - GET returns geography information with user data
  - Geography fields are cleared for consultants

## 📋 Next Steps

### 1. Populate Marking Rules
You need to insert marking rules into `efiling_marking_rules` table. Example:

```sql
-- Example: XEN can mark to SE in same district
INSERT INTO efiling_marking_rules (from_role_id, to_role_id, department_id, level_scope, require_same_location, sla_hours)
SELECT 
    r1.id, r2.id, dept.id, 'district', true, 24
FROM efiling_roles r1
CROSS JOIN efiling_roles r2
CROSS JOIN efiling_departments dept
WHERE r1.code LIKE 'WAT_XEN_%' 
  AND r2.code LIKE 'SE_%'
  AND dept.department_type = 'district';
```

### 2. Update Existing Users
Add geography to existing users:

```sql
-- Update users based on their role and department
-- This is manual - you'll need to map each user to their district/town/division
UPDATE efiling_users SET district_id = ?, town_id = ? WHERE id = ?;
```

### 3. Update Existing Files (Optional)
If you want to backfill geography for existing files:

```sql
-- Copy geography from creator
UPDATE efiling_files f
SET district_id = eu.district_id,
    town_id = eu.town_id,
    division_id = eu.division_id
FROM efiling_users eu
WHERE f.created_by = eu.id
  AND (f.district_id IS NULL OR f.town_id IS NULL OR f.division_id IS NULL);
```

### 4. Populate Divisions Table
Create divisions for division-based departments:

```sql
INSERT INTO divisions (name, code, ce_type, department_id, description)
VALUES 
    ('Dhabeji Pumping Division', 'DIV_DHABEJI', 'E&M Water Bulk', <dept_id>, 'E&M Water Bulk Division 1'),
    -- Add all divisions from organogram
    ...;
```

### 5. Run Cleanup SQL (After Testing)
Once everything works, run `efiling_workflow_cleanup.sql` to remove old workflow tables.

## 🔄 API Usage

### Get Allowed Recipients for Marking
```javascript
GET /api/efiling/files/[id]/marking-recipients
// Returns: { recipients: [...], count: N }
```

### Create File (Auto-populates geography)
```javascript
POST /api/efiling/files
// Geography automatically set from creator's user record
```

### Mark File To User
```javascript
POST /api/efiling/files/[id]/mark-to
Body: { user_ids: [1, 2], remarks: "..." }
// Validates marking rule + geography before allowing
```

### Create/Update User with Geography
```javascript
POST /api/efiling/users
Body: { 
    ..., 
    district_id: 1,  // For district-based users
    town_id: 5,      // Optional, for town-based
    division_id: 3   // For division-based users
}
```

## ⚠️ Important Notes

1. **Workflow Tables**: Still exist for backward compatibility. Drop them after testing.
2. **Existing Files**: May not have geography set. Files created after this update will have it.
3. **CEO Flexibility**: CEO role bypasses geographic restrictions (`level_scope = 'global'`).
4. **Consultants**: Consultants don't need geography (they're external).
5. **Department Type**: Must be set correctly in `efiling_departments.department_type`.

## 🧪 Testing Checklist

- [ ] Create file as district-based user → geography auto-populated
- [ ] Create file as division-based user → division_id set
- [ ] Mark file to user → only shows users in same district/town/division
- [ ] CEO marks file → can mark to anyone (global scope)
- [ ] Marking rule validation → errors if rule doesn't allow transition
- [ ] Geographic mismatch → error if locations don't match

