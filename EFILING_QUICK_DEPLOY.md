# E-Filing System Updates - Quick Deploy Guide

## 🚀 What Changed?

### 1. Permission System
- Only admin + creator can edit files
- Marked users can only sign, comment, attach

### 2. E-Signature Requirement
- Must sign before marking file
- API validates signature

### 3. CEO SLA Pause
- Timer pauses at CEO
- Resumes when CEO forwards

## 📦 Files to Deploy

```
database/migrations/add_sla_pause_tracking.sql  ← Run this first!
app/api/efiling/files/[id]/permissions/route.js
app/api/efiling/files/[id]/mark-to/route.js
lib/efilingSLAManager.js
```

## ⚡ Quick Deploy (5 Minutes)

### On Your Server:

```bash
# 1. Navigate to project
cd /opt/wmp/wmp

# 2. Pull latest changes
git pull origin main

# 3. Run database migration
psql -U root -d your_database_name -f database/migrations/add_sla_pause_tracking.sql

# 4. Restart app
pm2 restart wmp

# 5. Check logs
pm2 logs wmp --lines 20
```

## ✅ Verify It Works

### Test 1: Permission API
```bash
# Should return permissions object
curl http://202.61.47.29:3000/api/efiling/files/14/permissions
```

### Test 2: Try Marking Without Signature
1. Login to efilinguser
2. Create new file
3. Try clicking "Mark To" → Should be disabled
4. Add e-signature
5. "Mark To" → Should be enabled

### Test 3: Check SLA Pause
```sql
-- Check if columns exist
SELECT sla_paused, sla_accumulated_hours 
FROM efiling_file_workflows 
LIMIT 1;

-- Check pause history table
SELECT COUNT(*) FROM efiling_sla_pause_history;
```

## 🐛 If Something Breaks

### Problem: Migration fails

```bash
# Check if tables/columns already exist
psql -U root -d your_db

\d efiling_file_workflows
\d efiling_sla_pause_history
```

Solution: Migration uses `IF NOT EXISTS` - safe to rerun

### Problem: App won't start

```bash
# Check logs
pm2 logs wmp --err --lines 50

# Common issue: Database connection
# Verify database is running and credentials are correct
```

### Problem: Permission API returns 403

- User not in efiling_users table
- Check: `SELECT * FROM efiling_users WHERE user_id = <user_id>;`

## 📋 Key Database Tables

### efiling_file_workflows (Modified)
- Added: `sla_paused`, `sla_paused_at`, `sla_accumulated_hours`, `sla_pause_count`

### efiling_sla_pause_history (New)
- Tracks all pause/resume events
- Audit trail for SLA pauses

### efiling_document_signatures (Existing - Now Validated)
- Used to check if user has signed
- Required before marking file

## 🎯 Business Rules

| Action | Creator (unsigned) | Creator (signed) | Marked User | Admin |
|--------|-------------------|------------------|-------------|-------|
| Edit File | ✅ | ✅ | ❌ | ✅ |
| Add E-Sign | ✅ | ✅ | ✅ | ✅ |
| Mark To | ❌ | ✅ | ❌ | ✅ |
| Comment | ✅ | ✅ | ✅ | ✅ |
| Attach | ✅ | ✅ | ✅ | ✅ |

## 📞 Support Queries

```sql
-- Q: Which files are currently paused at CEO?
SELECT f.id, f.file_number, wf.sla_paused_at
FROM efiling_files f
JOIN efiling_file_workflows wf ON wf.file_id = f.id
WHERE wf.sla_paused = TRUE;

-- Q: How many files were marked without signature? (should be 0)
SELECT COUNT(*) 
FROM efiling_files f
WHERE f.id NOT IN (
    SELECT DISTINCT file_id 
    FROM efiling_document_signatures
);

-- Q: What's the average CEO review time?
SELECT AVG(duration_hours) as avg_ceo_review_hours
FROM efiling_sla_pause_history
WHERE pause_reason = 'CEO_REVIEW' AND resumed_at IS NOT NULL;
```

## ✨ What Users Will Notice

### File Creators:
- "Mark To" button disabled until they sign
- Tooltip: "You must add e-signature first"

### Marked Users:
- No "Edit" button visible
- Can only interact via signatures, comments, attachments

### CEO:
- Files show "SLA Paused" badge
- Timer doesn't run while with CEO

### Everyone:
- Clearer permission indicators
- Better error messages
- Audit trail of all actions

## 🎉 Success Indicators

After deployment, you should see:

✅ Migration completed without errors
✅ PM2 shows app "online"
✅ Permission API returns 200 OK
✅ Users can't mark files without signing
✅ SLA pauses when file reaches CEO
✅ No errors in PM2 logs

## 📝 Deployment Checklist

- [ ] Backup database
- [ ] Pull latest code
- [ ] Run migration script
- [ ] Restart PM2
- [ ] Test permission API
- [ ] Test signature requirement
- [ ] Test SLA pause at CEO
- [ ] Verify logs are clean
- [ ] Test as different user roles
- [ ] Monitor for 1 hour

## 🔗 Related Documentation

- **Implementation Details**: `EFILING_PERMISSION_AND_SLA_IMPLEMENTATION.md`
- **Full Deployment Guide**: `EFILING_DEPLOYMENT_GUIDE.md`
- **Database Schema**: See attached SQL in migration file

---

**Need Help?** Check PM2 logs first: `pm2 logs wmp --lines 100`

