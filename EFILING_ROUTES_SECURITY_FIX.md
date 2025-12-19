# E-Filing Routes Security Fix

## Issue
Several e-filing API routes were exposed without authentication, allowing unauthorized access to sensitive file data.

## Routes Secured

### File Data Routes (CRITICAL)
All these routes now require authentication and file access checks:

1. ✅ `/api/efiling/files/[id]/document` (GET)
   - **Before**: No authentication
   - **After**: Requires auth + file access check
   - **Impact**: Prevents unauthorized access to document content

2. ✅ `/api/efiling/files/[id]/attachments` (GET)
   - **Before**: No authentication
   - **After**: Requires auth + file access check
   - **Impact**: Prevents unauthorized access to file attachments

3. ✅ `/api/efiling/files/[id]/signatures` (GET)
   - **Before**: No authentication
   - **After**: Requires auth + file access check
   - **Impact**: Prevents unauthorized access to document signatures

4. ✅ `/api/efiling/files/[id]/timeline` (GET)
   - **Before**: No authentication
   - **After**: Requires auth + file access check
   - **Impact**: Prevents unauthorized access to file timeline

5. ✅ `/api/efiling/files/[id]/history` (GET)
   - **Before**: No authentication
   - **After**: Requires auth + file access check
   - **Impact**: Prevents unauthorized access to file history

6. ✅ `/api/efiling/files/[id]/pages` (GET)
   - **Before**: No authentication
   - **After**: Requires auth + file access check
   - **Impact**: Prevents unauthorized access to document pages

7. ✅ `/api/efiling/files/[id]/mark-to` (GET)
   - **Before**: No authentication
   - **After**: Requires auth + file access check
   - **Impact**: Prevents unauthorized access to marking recipients

### Other Routes
8. ✅ `/api/efiling/file-types` (GET)
   - **Before**: Optional authentication (didn't require it)
   - **After**: Requires authentication
   - **Impact**: Prevents unauthorized access to file type metadata

## Security Implementation

### Authentication Check
All secured routes now include:
```javascript
// SECURITY: Require authentication
const session = await auth();
if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### File Access Check
File-specific routes also include:
```javascript
// SECURITY: Check file access
const { checkFileAccess } = await import('@/lib/authMiddleware');
const userId = parseInt(session.user.id);
const isAdmin = [1, 2].includes(parseInt(session.user.role));

const hasAccess = await checkFileAccess(client, parseInt(id), userId, isAdmin);
if (!hasAccess) {
    return NextResponse.json(
        { error: 'Forbidden - You do not have access to this file' },
        { status: 403 }
    );
}
```

## Access Control Logic

The `checkFileAccess` function verifies:
1. **Admin users** (role 1 or 2): Full access to all files
2. **File creator**: Can access files they created
3. **Assigned user**: Can access files assigned to them
4. **Department access**: Users in the same department can access files

## Testing

After these changes, test that:
1. ✅ Unauthenticated requests return 401 Unauthorized
2. ✅ Authenticated users without file access return 403 Forbidden
3. ✅ Authenticated users with proper access can view files
4. ✅ Admin users can access all files

## Remaining Routes to Review

The following routes may need review (check if they require authentication):
- `/api/efiling/sla/route.js` (GET)
- `/api/efiling/sla-policies/route.js` (GET)
- `/api/efiling/zones/route.js` (GET)
- `/api/efiling/role-groups/route.js` (GET)
- `/api/efiling/departments/locations/route.js` (GET)
- `/api/efiling/roles/locations/route.js` (GET)
- `/api/efiling/role-groups/locations/route.js` (GET)
- `/api/efiling/departments/roles/route.js` (GET)

These routes may be intentionally public (for dropdowns, etc.) or may need authentication based on your security requirements.

## Impact

**Before**: Anyone could access file data by knowing the file ID
**After**: Only authenticated users with proper file access can view file data

This is a **CRITICAL** security fix that prevents unauthorized data exposure.

