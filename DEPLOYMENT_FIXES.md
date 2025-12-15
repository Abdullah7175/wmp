# Deployment Fixes for Live Server

## Issues Fixed

### 1. Standalone Mode Startup
**Problem:** Using `npm start` with standalone output configuration shows a warning.

**Solution:** Updated `package.json` to use standalone mode by default:
- `npm start` now runs `node .next/standalone/server.js`
- Old command available as `npm run start:next`

**Usage:**
```bash
npm start  # Now uses standalone mode
```

### 2. Server Actions Origin Header Warnings
**Problem:** "Missing `origin` header from a forwarded Server Actions request" warnings.

**Solution:** 
- Added `allowedOrigins` configuration in `next.config.mjs`
- Updated middleware to preserve forwarded headers

**Environment Variables Required:**
Make sure these are set in your production environment:
```bash
NEXTAUTH_URL=http://wmp.kwsc.gos.pk:3000  # or your actual domain
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

## Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Or if using PM2:
   ```bash
   npm run pm2:start
   ```

3. **If behind a reverse proxy (nginx/apache):**
   Make sure to forward these headers:
   ```
   X-Forwarded-Host
   X-Forwarded-Proto
   X-Forwarded-For
   Origin
   ```

## Allowed Origins

The following origins are configured for Server Actions:
- `wmp.kwsc.gos.pk`
- `localhost`
- `119.30.113.18`
- `127.0.0.1`

If you need to add more origins, update `next.config.mjs`:
```javascript
experimental: {
  serverActions: {
    allowedOrigins: [
      'your-domain.com',
      // ... other origins
    ],
  },
}
```

## Notes

- The warnings about Server Actions are non-critical but should be resolved with the configuration changes
- Make sure to rebuild after changing `next.config.mjs`
- If using a reverse proxy, ensure it forwards the Origin header properly

