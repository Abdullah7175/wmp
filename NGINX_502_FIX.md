# Fixing 502 Bad Gateway Error with HTTPS

## Problem
Getting 502 Bad Gateway when accessing `https://wmp.kwsc.gos.pk`, but `http://wmp.kwsc.gos.pk:3000` works fine.

## Root Causes
1. **PM2 is using wrong script** - Using `next start` instead of standalone mode
2. **Nginx proxy_pass might be incorrect** - Not pointing to the right backend
3. **Backend server not running** - Next.js app might not be listening on port 3000
4. **Firewall blocking** - Port 3000 might be blocked from nginx to app

## Solutions

### 1. Update PM2 Configuration
The `ecosystem.config.js` has been updated to use standalone mode. Restart PM2:

```bash
# Stop current PM2 process
pm2 stop wmp
pm2 delete wmp

# Rebuild the application (important!)
npm run build

# Start with updated config
pm2 start ecosystem.config.js

# Check status
pm2 status
pm2 logs wmp
```

### 2. Verify Backend is Running
Check if the app is listening on port 3000:

```bash
# Check if port 3000 is listening
netstat -tlnp | grep :3000
# OR
ss -tlnp | grep :3000

# Should show something like:
# tcp  0  0  0.0.0.0:3000  0.0.0.0:*  LISTEN  12345/node
```

### 3. Test Backend Directly
Test if the backend responds:

```bash
# From the server itself
curl http://localhost:3000
curl http://127.0.0.1:3000

# Should return HTML, not connection refused
```

### 4. Nginx Configuration
Your nginx config should look like this:

```nginx
server {
    listen 443 ssl http2;
    server_name wmp.kwsc.gos.pk;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Proxy to Next.js (CRITICAL: Use 127.0.0.1, not localhost)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Essential headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Origin $scheme://$host;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Disable buffering for Server Actions
        proxy_buffering off;
        proxy_request_buffering off;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name wmp.kwsc.gos.pk;
    return 301 https://$server_name$request_uri;
}
```

### 5. Common Issues and Fixes

#### Issue: "Connection refused" in nginx error logs
**Fix:** 
- Verify app is running: `pm2 status`
- Check app is listening: `netstat -tlnp | grep :3000`
- Restart app: `pm2 restart wmp`

#### Issue: "Connection timeout"
**Fix:**
- Check firewall: `sudo ufw status`
- Allow local connections: `sudo ufw allow from 127.0.0.1 to any port 3000`
- Check SELinux if enabled

#### Issue: "502 Bad Gateway" but app works on :3000
**Fix:**
- Verify nginx proxy_pass uses `127.0.0.1:3000` (not `localhost:3000`)
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify nginx can reach backend: `curl http://127.0.0.1:3000` from server

### 6. Debugging Steps

```bash
# 1. Check if app is running
pm2 status
pm2 logs wmp --lines 50

# 2. Check if port 3000 is open
netstat -tlnp | grep :3000

# 3. Test backend directly
curl -v http://127.0.0.1:3000

# 4. Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# 5. Test nginx configuration
sudo nginx -t

# 6. Reload nginx
sudo systemctl reload nginx
```

### 7. Environment Variables
Make sure these are set in your `.env` file or PM2 environment:

```bash
NEXTAUTH_URL=https://wmp.kwsc.gos.pk
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

### 8. Complete Restart Procedure

```bash
# 1. Stop everything
pm2 stop wmp
sudo systemctl stop nginx

# 2. Rebuild
npm run build

# 3. Start app
pm2 start ecosystem.config.js
pm2 logs wmp  # Watch for errors

# 4. Test backend
curl http://127.0.0.1:3000

# 5. Start nginx
sudo systemctl start nginx
sudo nginx -t  # Verify config

# 6. Test HTTPS
curl -k https://wmp.kwsc.gos.pk
```

## Verification Checklist

- [ ] PM2 shows app is running: `pm2 status`
- [ ] Port 3000 is listening: `netstat -tlnp | grep :3000`
- [ ] Backend responds: `curl http://127.0.0.1:3000`
- [ ] Nginx config is valid: `sudo nginx -t`
- [ ] Nginx error log shows no errors: `sudo tail /var/log/nginx/error.log`
- [ ] HTTPS works: `curl -k https://wmp.kwsc.gos.pk`
- [ ] Environment variable `NEXTAUTH_URL` is set to HTTPS

## Still Not Working?

If you still get 502 after following these steps:

1. **Check nginx error log:**
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs wmp --lines 100
   ```

3. **Verify standalone build exists:**
   ```bash
   ls -la .next/standalone/server.js
   ```

4. **Check file permissions:**
   ```bash
   ls -la .next/standalone/server.js
   chmod +x .next/standalone/server.js
   ```

5. **Try running standalone server manually:**
   ```bash
   cd .next/standalone
   node server.js
   # Should see: "Ready on http://0.0.0.0:3000"
   ```

