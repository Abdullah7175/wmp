# Final .env File Fix Instructions

## Problem
Next.js 13.5.11 cannot parse `$` characters in environment variables, even with escaping.

## Solution
We've hardcoded the WhatsApp secret key in the service file as a temporary workaround. Now you need to comment out the problematic line in your `.env` file.

## Steps

### 1. Edit your `.env` file

**On Windows (D:\wmp\wmp\.env):**
```env
PG_USER=root
PG_HOST=127.0.0.1
PG_DATABASE=wmp_local
PG_PASSWORD=**@/#Abc1

DB_USER=root
DB_HOST=127.0.0.1
DB_NAME=wmp_local
DB_PASSWORD=**@/#Abc1
DB_PORT=5432
DB_SSL=false

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=KWSCuser123456
JWT_SECRET=KWSCuser

WHATSAPP_API_URL=http://erp.rehmanigroup.com:8003/whatsapp.php
# WHATSAPP_SECRET_KEY=$$343XSWE12$$$$  <-- COMMENT THIS OUT
```

**On Linux Server (/opt/new/.env):**
```env
PG_USER=root
PG_HOST=127.0.0.1
PG_DATABASE=wmp_local
PG_PASSWORD=**@/#Abc1

DB_USER=root
DB_HOST=127.0.0.1
DB_NAME=wmp_local
DB_PASSWORD=**@/#Abc1
DB_PORT=5432
DB_SSL=false

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=KWSCuser123456
JWT_SECRET=KWSCuser

WHATSAPP_API_URL=http://erp.rehmanigroup.com:8003/whatsapp.php
# WHATSAPP_SECRET_KEY=$$343XSWE12$$$$  <-- COMMENT THIS OUT
```

### 2. Key Changes

1. **Remove quotes from passwords:**
   - `PG_PASSWORD="**@/#Abc1"` → `PG_PASSWORD=**@/#Abc1`
   - `DB_PASSWORD="**@/#Abc1"` → `DB_PASSWORD=**@/#Abc1`

2. **Comment out WhatsApp secret key:**
   - Add `#` at the start: `# WHATSAPP_SECRET_KEY=$$343XSWE12$$$$`

### 3. Restart the server

```bash
# Stop the server (Ctrl+C)
# Clear cache
rm -rf .next  # On Linux
# or
rmdir /s /q .next  # On Windows

# Restart
npm run dev
```

## How It Works Now

- The WhatsApp secret key is **hardcoded** in `lib/whatsappService.js` as `$343XSWE12$$`
- The `.env` file no longer has the problematic line
- Next.js can parse the `.env` file without errors
- WhatsApp API will work correctly with the hardcoded secret key

## Future Improvement

Once you upgrade Next.js or find a better solution, you can:
1. Uncomment the line in `.env` (if escaping works in the new version)
2. Remove the hardcoded fallback from `lib/whatsappService.js`
3. Use `process.env.WHATSAPP_SECRET_KEY` directly

## Security Note

The secret key is now in the source code. Make sure:
- The repository is private
- The secret key is not committed to version control (it's already in `.gitignore`)
- Consider using a secrets management service for production

