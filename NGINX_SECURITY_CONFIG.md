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

## Full Example Configuration

```nginx
http {
    # Hide nginx version
    server_tokens off;
    
    server {
        listen 443 ssl http2;
        server_name wmp.kwsc.gos.pk;
        
        # SSL configuration
        ssl_certificate /path/to/cert.pem;
        ssl_certificate_key /path/to/key.pem;
        
        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # Hide Server header
        more_set_headers 'Server: ';
        
        # Proxy to Next.js
        location / {
            proxy_pass http://localhost:3000;
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
