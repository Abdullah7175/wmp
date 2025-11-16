# E-Filing Geographic Routing - Deployment Steps

## ✅ Step 1: SQL Migration (Already Completed)
You've already run `efiling_geographic_migration.sql` which added:
- Geographic columns to users and files
- Divisions table
- Marking rules table
- Department type classification

## 📋 Step 2: Code Changes (Already Applied)
All API routes have been updated:
- ✅ File creation auto-populates geography
- ✅ Mark-to API uses geographic routing
- ✅ Assign API uses geographic routing
- ✅ User APIs handle geography fields
- ✅ New marking-recipients endpoint created

## 🚀 Step 3: Populate Data

### 3.1 Populate Divisions Table
```sql
-- Example divisions (adjust based on your actual divisions)
INSERT INTO divisions (name, code, ce_type, department_id, description) VALUES
('Dhabeji Pumping Division', 'DIV_DHABEJI_PUMP', 'E&M Water Bulk', <water_bulk_dept_id>, 'E&M Water Bulk Division 1'),
('Pepri Division Pumping & Filtration', 'DIV_PEPRI_PF', 'E&M Water Bulk', <water_bulk_dept_id>, 'E&M Water Bulk Division 1'),
-- Add all divisions from your organogram
...;
```

### 3.2 Update Existing Users with Geography
```sql
-- Update users with their district/town/division based on their role and department
-- Example: XEN Safoora should have district_id and town_id set
UPDATE efiling_users 
SET district_id = <district_id>, town_id = <town_id>
WHERE efiling_role_id IN (SELECT id FROM efiling_roles WHERE code LIKE 'WAT_XEN_SAF%');

-- Do this for all users based on their actual location
```

### 3.3 Populate Marking Rules
Run the sample SQL from `MARKING_RULES_SAMPLE.sql` or create your own based on organizational hierarchy.

## 🔍 Step 4: Verify Setup

### Check Users Have Geography
```sql
SELECT u.id, u.employee_id, r.code as role_code, 
       d.title as district, t.town, div.name as division
FROM efiling_users u
LEFT JOIN efiling_roles r ON u.efiling_role_id = r.id
LEFT JOIN district d ON u.district_id = d.id
LEFT JOIN town t ON u.town_id = t.id
LEFT JOIN divisions div ON u.division_id = div.id
WHERE u.is_active = true;
```

### Check Marking Rules Exist
```sql
SELECT mr.*, 
       r1.code as from_role_code, 
       r2.code as to_role_code,
       mr.level_scope
FROM efiling_marking_rules mr
JOIN efiling_roles r1 ON mr.from_role_id = r1.id
JOIN efiling_roles r2 ON mr.to_role_id = r2.id
WHERE mr.is_active = true
ORDER BY mr.from_role_id, mr.to_role_id;
```

### Test File Creation
1. Create a file as a district-based user
2. Verify file.district_id and file.town_id are set
3. Verify file.division_id is NULL

### Test Marking
1. Get allowed recipients: `GET /api/efiling/files/[id]/marking-recipients`
2. Verify only users in same district/town/division are returned
3. Try marking to a user in different district → should fail
4. Test as CEO → should be able to mark to anyone

## ⚠️ Step 5: Cleanup (After Testing)
Once everything works, run `efiling_workflow_cleanup.sql` to remove old workflow tables.

## 📝 Step 6: Update UI (If Needed)
The marking dropdown should call:
```
GET /api/efiling/files/[id]/marking-recipients
```
And display the returned recipients list.

No other UI changes needed - file creation, editing, viewing, e-signature, and attachments remain unchanged.

