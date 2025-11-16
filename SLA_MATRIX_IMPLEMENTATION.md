# SLA Matrix Implementation - Simplifying Geographic Routing

## 📋 Overview

This implementation simplifies the e-filing marking system by:
- Removing complex `efiling_marking_rules` table
- Introducing simple `efiling_sla_matrix` table for SLA management
- Making marking purely geography-based with SLA lookups
- Maintaining CEO/COO global access privileges

## 🗄️ Database Changes

### 1. Migration File: `efiling_sla_matrix_migration.sql`

**Creates:**
- `efiling_sla_matrix` table with:
  - `from_role_code` and `to_role_code` (role transition)
  - `level_scope` ('district' | 'division' | 'global')
  - `sla_hours` (default: 24)
  - Unique constraint on (from_role_code, to_role_code)

**Drops:**
- `efiling_marking_rules` table (CASCADE)

**Default Entries:**
- EE → SE: 24 hours, district scope
- SE → CE: 24 hours, global scope
- CE → COO: 48 hours, global scope
- COO → CEO: 72 hours, global scope
- CEO → CE (execution): 24 hours, global scope
- CE → XEN (execution): 24 hours, district scope

### 2. Run Migration

```sql
-- Execute the migration file
\i efiling_sla_matrix_migration.sql
```

## 🔧 Backend Code Changes

### 1. `lib/efilingGeographicRouting.js` - Simplified

**Removed Functions:**
- `getMarkingRule()` - No longer needed

**Simplified Functions:**

#### `getAllowedRecipients(client, options)`
- Filters users by geography only (district/division)
- No marking rules lookup
- CEO/COO bypass geographic restrictions

#### `getSLA(client, fromRoleCode, toRoleCode)`
- New function to lookup SLA from matrix
- Supports wildcard patterns (e.g., 'WAT_XEN_*')
- Returns default 24 hours if no match

#### `validateGeographicMatch(file, user, departmentType)`
- Simplified to check geography based on department type
- No rule dependency

### 2. `app/api/efiling/files/[id]/mark-to/route.js`

**Changes:**
- Removed `getMarkingRule()` calls
- Geographic validation uses department type
- SLA lookup via `getSLA()` function
- CEO/COO bypass geography

**Flow:**
1. Validate file exists
2. Check e-signature (existing)
3. Get department type
4. For each target user:
   - Validate geography (unless CEO/COO)
   - Get SLA from matrix
   - Create movement record
5. Update file with new assignee and SLA deadline

### 3. `app/api/efiling/files/[id]/assign/route.js`

**Changes:**
- Removed `getMarkingRule()` calls
- Geographic validation simplified
- SLA lookup via `getSLA()`

**Flow:**
1. Get file and users
2. Validate geography (unless CEO/COO)
3. Get SLA from matrix
4. Update file with SLA deadline

### 4. `app/api/efiling/files/[id]/marking-recipients/route.js`

**No changes needed** - Already uses `getAllowedRecipients()`

### 5. New CRUD API: `app/api/efiling/sla/`

**GET `/api/efiling/sla`**
- List all SLA matrix entries
- Optional filters: `from_role_code`, `to_role_code`, `active_only`

**POST `/api/efiling/sla`**
- Create new SLA matrix entry
- Requires: `from_role_code`, `to_role_code`
- Optional: `level_scope`, `sla_hours`, `description`, `is_active`

**PUT `/api/efiling/sla/[id]`**
- Update existing SLA matrix entry
- Update any field (except id)

**DELETE `/api/efiling/sla/[id]`**
- Soft delete (sets `is_active = false`)

## 🎯 Marking Logic Flow

### For District-Based Departments:
1. User can mark to users in same `district_id`
2. Lookup SLA from matrix (from_role → to_role)
3. Apply SLA deadline = NOW() + sla_hours

### For Division-Based Departments:
1. User can mark to users in same `division_id`
2. Lookup SLA from matrix
3. Apply SLA deadline

### For CEO/COO (Global Users):
1. Can mark to ANY user (no geographic restriction)
2. Still use SLA from matrix
3. `level_scope` = 'global' entries apply

## 📝 Example API Usage

### Create SLA Entry
```bash
POST /api/efiling/sla
{
  "from_role_code": "WAT_XEN_SAF",
  "to_role_code": "SE_CEN",
  "level_scope": "district",
  "sla_hours": 24,
  "description": "EE Safoora marks to SE Central"
}
```

### List SLA Entries
```bash
GET /api/efiling/sla?active_only=true&from_role_code=WAT_XEN_*
```

### Update SLA
```bash
PUT /api/efiling/sla/5
{
  "sla_hours": 12,
  "level_scope": "district"
}
```

## ✅ Testing Checklist

- [ ] Create file as EE Water (district-based)
- [ ] Verify marking shows only SEs in same district
- [ ] Mark file → verify movement log includes SLA from matrix
- [ ] CEO marks file → bypass geographic restriction (global)
- [ ] Change SLA (e.g., EE → SE = 12h) via API
- [ ] Verify new SLA applies immediately on next marking
- [ ] No `efiling_marking_rules` table dependency anywhere
- [ ] Division-based departments respect division_id matching
- [ ] COO can mark globally like CEO

## 🔄 Migration Steps

1. **Backup Database** (IMPORTANT!)
   ```bash
   pg_dump -U root your_database > backup_before_sla_matrix.sql
   ```

2. **Run Migration SQL**
   ```bash
   psql -U root your_database -f efiling_sla_matrix_migration.sql
   ```

3. **Deploy Code Changes**
   - Deploy updated API routes
   - Deploy updated routing helper

4. **Populate SLA Matrix**
   - Use POST `/api/efiling/sla` or direct SQL inserts
   - Add entries for all role transitions needed

5. **Test Marking Flow**
   - Test district-based marking
   - Test division-based marking
   - Test CEO/COO global marking

## 📚 Key Benefits

1. **Simpler Logic**: No complex rule matching
2. **Geography-First**: Marking based on location, not rules
3. **Easy SLA Management**: Central SLA matrix table
4. **Admin-Friendly**: CRUD API for SLA management
5. **Flexible**: Wildcard patterns for role matching
6. **Backward Compatible**: Existing files continue working

 crispChanges Complete ✅

