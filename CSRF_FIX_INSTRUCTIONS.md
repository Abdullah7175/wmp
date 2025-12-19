# CSRF Token Fix for Production Server

## Problem
Getting `MissingCSRF: CSRF token was missing during an action callback` errors when logging in on production server.

## Root Cause
The CSRF token validation fails when:
1. The `NEXTAUTH_URL` doesn't match the actual domain being accessed
2. Cookies aren't being set properly due to domain/secure settings
3. Reverse proxy (nginx) isn't forwarding headers correctly

## Solution

### 1. Set Environment Variables

Make sure these are set in your `.env` or `.env.local` file on the server:

```bash
# Required: Set to your HTTPS domain (no port, no trailing slash)
NEXTAUTH_URL=https://wmp.kwsc.gos.pk

# Required: Must be set (used for JWT signing)
NEXTAUTH_SECRET=your-secret-key-here

# If you're behind a reverse proxy (nginx), set this:
BEHIND_PROXY=true

# Optional: If you need to set a specific cookie domain
# COOKIE_DOMAIN=.kwsc.gos.pk
```

### 2. If Using Nginx Reverse Proxy

If you have nginx in front of your Next.js app, make sure it forwards the correct headers:

```nginx
server {
    listen 443 ssl;
    server_name wmp.kwsc.gos.pk;

    # SSL configuration...
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # Important: Forward these headers for CSRF token validation
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # WebSocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. Rebuild and Restart

After setting the environment variables:

```bash
# Rebuild the application
npm run build

# Restart PM2
pm2 restart wmp

# Or if using standalone mode
pm2 delete wmp
pm2 start npm --name wmp -- start
```

### 4. Verify Configuration

Check that the environment variables are loaded:

```bash
# Check PM2 environment
pm2 env 0

# Or check the logs
pm2 logs wmp --lines 50
```

You should see the app starting with the correct URL.

### 5. Test Login

1. Clear your browser cookies for `wmp.kwsc.gos.pk`
2. Try logging in again
3. Check the browser's Developer Tools > Application > Cookies
4. You should see cookies like:
   - `__Secure-next-auth.csrf-token` (or `next-auth.csrf-token` in dev)
   - `__Secure-next-auth.session-token`

## Troubleshooting

### Still Getting CSRF Errors?

1. **Check the actual URL being used:**
   ```bash
   # In your server logs, look for:
   # "Local: http://wmp.kwsc.gos.pk:3000"
   # It should match your NEXTAUTH_URL
   ```

2. **Verify cookies are being set:**
   - Open browser DevTools > Application > Cookies
   - Check if CSRF token cookie exists
   - Verify it has `Secure` flag if using HTTPS

3. **Check if behind proxy:**
   - If using nginx/apache, set `BEHIND_PROXY=true`
   - This changes cookie prefix from `__Host-` to `__Secure-`

4. **Domain mismatch:**
   - Make sure `NEXTAUTH_URL` exactly matches what you see in browser address bar
   - No trailing slash
   - Use `https://` not `http://` for production

## Quick Fix Command

```bash
# Set environment variable and restart
export NEXTAUTH_URL=https://wmp.kwsc.gos.pk
pm2 restart wmp
```

Or add to your PM2 ecosystem config (already done in `ecosystem.config.js`).

