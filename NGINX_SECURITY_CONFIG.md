# Nginx Security Configuration

## Hide Server Information

To hide the `Server` header that reveals nginx version, add this to your nginx configuration:

### Option 1: Hide Server Header Completely (Recommended)

Add this to your nginx server block:

```nginx
server {
    # ... other configuration ...
    
    # Hide nginx version
    server_tokens off;
    
    # Or completely remove Server header
    more_set_headers 'Server: ';
    
    # ... rest of configuration ...
}
```

### Option 2: Set Custom Server Header

If you need to keep a Server header but hide the version:

```nginx
server {
    # ... other configuration ...
    
    server_tokens off;
    more_set_headers 'Server: WebServer';
    
    # ... rest of configuration ...
}
```

### Option 3: Using nginx-extras Module

If you have `nginx-extras` installed, you can use:

```nginx
server {
    # ... other configuration ...
    
    server_tokens off;
    more_clear_headers 'Server';
    
    # ... rest of configuration ...
}
```

## 🔐 Secure File Serving with X-Accel-Redirect (RECOMMENDED)

**IMPORTANT SECURITY**: Files should **NOT** be publicly accessible. Use this secure method:

### How It Works

1. **User requests**: `/api/uploads/efiling/attachments/file.pdf`
2. **Node.js authenticates** and checks permissions
3. **Node.js returns**: `X-Accel-Redirect: /protected/uploads/efiling/attachments/file.pdf`
4. **Nginx serves file** directly (fast, efficient, secure)

### Nginx Configuration

```nginx
server {
    # ... SSL and other configuration ...
    
    # 🔒 INTERNAL: Protected files (NOT accessible directly from browser)
    # IMPORTANT: This MUST come before the "location /" block
    location /protected/uploads/ {
        internal;  # 🔒 KEY SECURITY: Only accessible via X-Accel-Redirect from Node.js
        alias /opt/wmp16/public/uploads/;
        
        # Security: Deny access to hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
        
        # Enable sendfile for better performance
        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        
        # Logging (optional, can disable for performance)
        access_log off;
    }
    
    # ❌ DO NOT add public /uploads/ location - this would be insecure!
    # Direct access to /uploads/ should be blocked (will fall through to Node.js proxy)
    
    # Proxy all requests to Next.js (including /api/uploads/*)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Benefits

- ✅ **Files are NOT publicly accessible** - `/protected/uploads/` returns `403 Forbidden` if accessed directly
- ✅ **Authentication required** - Node.js checks auth and permissions before allowing download
- ✅ **Fast file serving** - Nginx serves files directly (no Node.js streaming overhead)
- ✅ **Works if Node.js restarts** - Once download starts, Nginx handles it
- ✅ **Permission-based access** - E-filing files check user permissions in database

### Verify Security (IMPORTANT)

After applying, test that direct access is blocked:

```bash
# ❌ This MUST return 403 Forbidden (NOT 200 OK)
curl -I https://wmp.kwsc.gos.pk/uploads/efiling/attachments/1766139416314.pdf

# ❌ This MUST also return 403 Forbidden
curl -I https://wmp.kwsc.gos.pk/protected/uploads/efiling/attachments/1766139416314.pdf

# ✅ This MUST work (with authentication cookie)
curl -I -H "Cookie: next-auth.session-token=..." https://wmp.kwsc.gos.pk/api/uploads/efiling/attachments/1766139416314.pdf
```

### Verify Uploads Path

Before applying, verify the correct path to your uploads directory:

```bash
# Check where uploads are located
ls -la /opt/wmp16/public/uploads/

# If uploads are in a different location, adjust the alias path accordingly
# Common locations:
# - /opt/wmp16/public/uploads/
# - /opt/wmp/public/uploads/
# - /var/www/wmp/public/uploads/
```

---

## ⚠️ DEPRECATED: Public Uploads (NOT RECOMMENDED)

**DO NOT USE THIS** for sensitive files like PDFs, contracts, or e-filing documents.

The old approach of serving `/uploads/` directly makes files publicly accessible:

```nginx
# ❌ INSECURE - DO NOT USE FOR SENSITIVE FILES
location /uploads/ {
    alias /opt/wmp16/public/uploads/;
    # Anyone with the URL can access files!
}
```

This is only acceptable for:
- Public logos/images
- Public assets that should be accessible to anyone

**For sensitive documents, always use the secure X-Accel-Redirect method above.**

## Full Example Configuration (Secure)

```nginx
http {
    # Hide nginx version
    server_tokens off;
    
    server {
        listen 443 ssl http2;
        server_name wmp.kwsc.gos.pk;
        
        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/wmp.kwsc.gos.pk/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/wmp.kwsc.gos.pk/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
        
        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Increase body size for file uploads
        client_max_body_size 100M;
        
        # Proxy settings
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Next.js Static Assets (standalone mode)
        location /_next/static/ {
            alias /opt/wmp16/.next/standalone/.next/static/;
            access_log off;
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files $uri =404;
        }
        
        # Public Assets (if you have any)
        location /public/ {
            alias /opt/wmp16/public/;
            access_log off;
            expires 30d;
        }
        
        # 🔒 SECURE: Protected uploads (internal only, via X-Accel-Redirect)
        location /protected/uploads/ {
            internal;  # Only accessible via X-Accel-Redirect from Node.js
            alias /opt/wmp16/public/uploads/;
            
            # Security: Deny access to hidden files
            location ~ /\. {
                deny all;
                access_log off;
                log_not_found off;
            }
            
            sendfile on;
            tcp_nopush on;
            tcp_nodelay on;
            access_log off;
        }
        
        # Proxy to Next.js (handles /api/uploads/* with authentication)
        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_hide_header Server;
        }
        
        # Logging
        access_log /var/log/nginx/wmp-access.log;
        error_log /var/log/nginx/wmp-error.log;
    }
    
    # HTTP → HTTPS redirect
    server {
        listen 80;
        listen [::]:80;
        server_name wmp.kwsc.gos.pk www.wmp.kwsc.gos.pk;
        return 301 https://$host$request_uri;
    }
}
```

## After Making Changes

1. Test nginx configuration:
   ```bash
   sudo nginx -t
   ```

2. Reload nginx:
   ```bash
   sudo systemctl reload nginx
   # or
   sudo service nginx reload
   ```

3. Verify headers are hidden:
   ```bash
   curl -I https://wmp.kwsc.gos.pk
   ```

## Notes

- The `Server` header is set by nginx, not Next.js
- Next.js `X-Powered-By` header is already disabled in `next.config.mjs`
- You may need to install `nginx-extras` or `headers-more-nginx-module` for `more_set_headers` directive
- If you can't modify nginx, contact your server administrator
