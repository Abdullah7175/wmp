# Admin OTP Fallback Feature

## Overview
When WhatsApp API is not working, admin users (role 1 or 2) can see OTPs in server logs and manually verify them. This is a secure fallback mechanism that **never exposes OTPs in the browser or API responses**.

## Security Features

### ✅ What is Secure:
- OTPs are **only logged server-side** in console/logs
- OTPs are **never sent to the browser** in API responses
- Only admins (role 1 or 2) can see OTPs in logs
- OTP verification still requires the correct code
- All admin actions are logged for audit purposes

### ❌ What is NOT Exposed:
- OTPs are NOT in API responses (except development mode for testing)
- OTPs are NOT visible in browser console
- OTPs are NOT visible to non-admin users
- OTPs are NOT stored in client-side storage

## How It Works

### 1. When OTP is Sent (`/api/efiling/send-otp`)

**Normal Flow:**
- OTP is generated and stored in database
- OTP is sent via WhatsApp
- If successful, user receives OTP on WhatsApp

**When WhatsApp Fails:**
- OTP is still generated and stored in database
- If current user is admin, OTP is logged to server console:
  ```
  [ADMIN OTP LOG] WhatsApp failed. OTP for user {userId} ({userName}): {otpCode}
  [ADMIN OTP LOG] User can verify this OTP manually. Expires at: {timestamp}
  ```
- API returns error (OTP is NOT in response)
- Admin can check server logs to see the OTP

### 2. When OTP is Verified (`/api/efiling/verify-auth`)

**Normal Flow:**
- User enters OTP code
- System verifies code matches stored OTP
- If match, authentication succeeds

**Admin Verification:**
- Admin can enter the OTP code they saw in logs
- System verifies code normally (same security check)
- Admin actions are logged:
  ```
  [ADMIN OTP VERIFY] Admin {adminId} ({adminName}) verifying OTP for user {userId}
  [ADMIN OTP VERIFY] Provided code: {code}, Stored code: {storedCode}, Match: {true/false}
  ```

## Usage Instructions for Admins

### Step 1: Check Server Logs
When WhatsApp fails, check your server logs (PM2 logs, console, or log files):

```bash
# If using PM2
pm2 logs wmp --lines 100

# Look for lines like:
[ADMIN OTP LOG] WhatsApp failed. OTP for user 123 (John Doe): 456789
[ADMIN OTP LOG] User can verify this OTP manually. Expires at: 2025-12-19T10:30:00.000Z
```

### Step 2: Verify OTP
1. User requests OTP verification
2. Admin enters the OTP code from logs
3. System verifies and authenticates if code matches

### Step 3: Monitor Verification
Check logs for verification attempts:
```
[ADMIN OTP VERIFY] Admin 1 (Admin User) verifying OTP for user 123
[ADMIN OTP VERIFY] Provided code: 456789, Stored code: 456789, Match: true
```

## Error Handling

### Improved Error Handling
- Auth errors are caught gracefully (won't cause 500 errors)
- Database errors are properly handled
- OTP generation continues even if WhatsApp fails
- All errors are logged for debugging

### Common Issues

**500 Error on `/api/efiling/send-otp`:**
- Check database connection
- Verify user exists in `efiling_users` table
- Check server logs for detailed error messages

**500 Error on `/api/efiling/verify-auth`:**
- Check if OTP exists in database
- Verify OTP hasn't expired (10 minutes)
- Check server logs for detailed error messages

## Security Considerations

### Admin Access Control
- Only users with role 1 or 2 can see OTPs in logs
- Admin verification still requires correct OTP code
- All admin actions are logged for audit

### Log Security
- Server logs should be protected (file permissions)
- Logs should not be accessible to non-admin users
- Consider log rotation and secure storage

### Best Practices
1. **Never share OTPs** - Even admins should verify OTPs securely
2. **Monitor admin actions** - Review logs regularly for suspicious activity
3. **Use HTTPS** - Ensure all API calls are over HTTPS in production
4. **Rotate secrets** - Keep NEXTAUTH_SECRET secure and rotated

## Development vs Production

### Development Mode
- OTPs may be included in API responses for testing
- More verbose logging
- Easier debugging

### Production Mode
- OTPs are **never** in API responses
- Only admins see OTPs in server logs
- Minimal error details in responses

## Troubleshooting

### OTP Not Appearing in Logs
1. Verify you're logged in as admin (role 1 or 2)
2. Check if WhatsApp actually failed (might have succeeded)
3. Check server log level settings
4. Verify you're looking at the correct log file

### OTP Verification Failing
1. Check if OTP has expired (10 minutes)
2. Verify OTP code matches exactly (case-sensitive)
3. Check server logs for verification details
4. Ensure user ID mapping is correct (users.id vs efiling_users.id)

### Still Getting 500 Errors
1. Check database connection
2. Verify all required tables exist
3. Check server logs for detailed error stack traces
4. Ensure environment variables are set correctly

## API Endpoints

### POST `/api/efiling/send-otp`
**Request:**
```json
{
  "userId": 123  // Optional, uses session if not provided
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your WhatsApp number",
  "expiresIn": "10 minutes",
  "phoneNumber": "0333***5678"
}
```

**Response (WhatsApp Failed - Admin):**
- Returns 500 error
- OTP logged to server console (admin only)
- OTP NOT in response

### POST `/api/efiling/verify-auth`
**Request:**
```json
{
  "userId": 123,
  "code": "456789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

**Response (Failure):**
```json
{
  "error": "Invalid code"
}
```

## Summary

This feature provides a secure fallback mechanism for admins when WhatsApp API fails, ensuring:
- ✅ OTPs are never exposed to browsers
- ✅ Only admins can see OTPs in server logs
- ✅ Normal security checks still apply
- ✅ All actions are logged for audit
- ✅ Better error handling prevents 500 errors

