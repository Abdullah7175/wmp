# 🔐 Secure File Download Implementation

## Overview

This document describes the secure file download implementation using **X-Accel-Redirect** with Nginx and Next.js. Files are now served securely with authentication and permission checks.

## Architecture

```
User Request → /api/uploads/efiling/attachments/file.pdf
     ↓
Node.js (Next.js API Route)
     ↓
1. Authenticate user (requireAuth)
2. Check permissions (checkFileAccess for efiling files)
3. Verify file exists
     ↓
Return: X-Accel-Redirect: /protected/uploads/...
     ↓
Nginx (internal location)
     ↓
Serve file directly from disk (fast, efficient)
```

## Security Features

### ✅ Authentication Required
- All file requests require valid session authentication
- Uses NextAuth.js session validation

### ✅ Permission Checks
- **E-filing attachments**: Checks if user has access to parent file
  - User must be creator OR assigned to the file
  - Admins (role 1, 2) bypass permission checks
  - Uses `checkFileAccess()` from `lib/authMiddleware.js`

### ✅ No Direct Access
- Files under `/protected/uploads/` are **internal only**
- Direct browser access returns `403 Forbidden`
- Only accessible via X-Accel-Redirect from authenticated Node.js route

### ✅ Path Traversal Protection
- Validates and sanitizes path segments
- Prevents `../` attacks
- Ensures resolved path stays within uploads directory

## Implementation Details

### Nginx Configuration

Located in `/etc/nginx/conf.d/wmp.conf`:

```nginx
# Internal protected files (NOT accessible directly)
location /protected/uploads/ {
    internal;  # 🔒 KEY: Only accessible via X-Accel-Redirect
    alias /opt/wmp16/public/uploads/;
    sendfile on;
    access_log off;
}
```

**Important**: The `internal` directive prevents direct browser access.

### Node.js API Route

Located in `app/api/uploads/[...path]/route.js`:

1. **Authentication**: Checks session via `await auth()`
2. **Permission Check**: For efiling attachments, queries database to verify access
3. **File Verification**: Checks file exists and path is valid
4. **X-Accel-Redirect**: Returns header pointing to `/protected/uploads/...`

### Database Integration

For efiling attachments:
- Looks up attachment by ID in `efiling_file_attachments` table
- Gets associated `file_id`
- Uses `checkFileAccess()` to verify user can access parent file

## Testing

### ✅ Test 1: Direct Access Should Fail

```bash
# ❌ This MUST return 403 Forbidden (NOT 200 OK)
curl -I https://wmp.kwsc.gos.pk/uploads/efiling/attachments/1766139416314.pdf

# Expected: HTTP/2 403

# ❌ This MUST also return 403 Forbidden
curl -I https://wmp.kwsc.gos.pk/protected/uploads/efiling/attachments/1766139416314.pdf

# Expected: HTTP/2 403
```

### ✅ Test 2: Authenticated Access Should Work

```bash
# Get session cookie (you'll need to login first in browser and extract cookie)
# Or use a tool like Postman with authentication

# ✅ This MUST work (with authentication)
curl -I -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  https://wmp.kwsc.gos.pk/api/uploads/efiling/attachments/1766139416314.pdf

# Expected: HTTP/2 200
# Response should include: X-Accel-Redirect header
```

### ✅ Test 3: Permission Check

1. Login as a user who **does NOT** have access to a specific file
2. Try to download attachment from that file
3. Should receive `403 Forbidden - You do not have access to this file`

### ✅ Test 4: Valid Access

1. Login as a user who **does** have access (creator or assigned)
2. Download attachment
3. Should receive file successfully with correct Content-Type

## File Types Supported

- **PDFs**: `application/pdf` with `X-Frame-Options: SAMEORIGIN` (allows embedding)
- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp` (inline display)
- **Documents**: Word, Excel, PowerPoint files (download as attachment)
- **Videos**: MP4, WebM, MOV, AVI

## Performance Benefits

1. **Fast File Serving**: Nginx serves files directly using `sendfile`
2. **Low Memory Usage**: No file buffering in Node.js
3. **Resilient**: Works even if Node.js restarts during download
4. **Caching**: Nginx handles file caching efficiently

## Troubleshooting

### Issue: 403 Forbidden on Authenticated Requests

**Check:**
1. Session cookie is valid and not expired
2. User has proper permissions in database
3. File path in database matches actual file location

### Issue: 404 File Not Found

**Check:**
1. File exists in `/opt/wmp16/public/uploads/`
2. Path in database matches file system structure
3. Check Nginx error logs: `tail -f /var/log/nginx/wmp-error.log`

### Issue: 500 Internal Server Error

**Check:**
1. Node.js logs: `pm2 logs wmp`
2. Database connection is working
3. File permissions on uploads directory: `ls -la /opt/wmp16/public/uploads/`

## Migration Notes

### Before (Insecure)
- Files served directly via `/uploads/` - publicly accessible
- No authentication required
- No permission checks

### After (Secure)
- Files served via `/api/uploads/` - requires authentication
- Permission checks for efiling files
- Internal Nginx location prevents direct access

### Code Changes Required

**None!** The existing codebase already uses `/api/uploads/` URLs:
- `app/api/efiling/files/upload-attachment/route.js` stores `/api/uploads/...` in database
- Frontend components already handle `/api/uploads/` paths correctly

## Security Best Practices

1. ✅ **Never serve sensitive files publicly** - Always use X-Accel-Redirect
2. ✅ **Always authenticate** - Check session before serving files
3. ✅ **Verify permissions** - Check database for access rights
4. ✅ **Sanitize paths** - Prevent path traversal attacks
5. ✅ **Use internal locations** - Nginx `internal` directive is crucial

## Related Files

- `app/api/uploads/[...path]/route.js` - Main download route
- `lib/authMiddleware.js` - Permission checking functions
- `/etc/nginx/conf.d/wmp.conf` - Nginx configuration
- `NGINX_SECURITY_CONFIG.md` - Nginx security documentation

## Next Steps

- [ ] Test all file download scenarios
- [ ] Monitor logs for any unauthorized access attempts
- [ ] Consider adding download logging/auditing
- [ ] Implement signed URLs for temporary file sharing (optional enhancement)
