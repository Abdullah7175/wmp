# Complete .env File Fix

## Issues Found

1. **WhatsApp Secret Key**: The `$` characters need proper escaping
2. **Database Password**: Quotes around password values can cause "client password must be a string" error

## Correct .env File Format

Here's the complete, corrected `.env` file:

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
WHATSAPP_SECRET_KEY=$$343XSWE12$$$$
```

## Key Changes

### 1. Database Passwords - Remove Quotes
**Before (WRONG):**
```env
PG_PASSWORD="**@/#Abc1"
DB_PASSWORD="**@/#Abc1"
```

**After (CORRECT):**
```env
PG_PASSWORD=**@/#Abc1
DB_PASSWORD=**@/#Abc1
```

**Why:** The quotes are being included as part of the password string, causing PostgreSQL to receive `"**@/#Abc1"` (with quotes) instead of `**@/#Abc1`.

### 2. WhatsApp Secret Key - Use Escaping
**Before (WRONG):**
```env
WHATSAPP_SECRET_KEY=$343XSWE12$$
```

**After (CORRECT):**
```env
WHATSAPP_SECRET_KEY=$$343XSWE12$$$$
```

**Why:** Next.js interprets `$` as variable interpolation. `$$` escapes to a literal `$`.

## Steps to Fix

1. **Edit your `.env` file:**
   ```bash
   nano /opt/new/.env
   ```

2. **Remove quotes from password values:**
   - Change `PG_PASSWORD="**@/#Abc1"` to `PG_PASSWORD=**@/#Abc1`
   - Change `DB_PASSWORD="**@/#Abc1"` to `DB_PASSWORD=**@/#Abc1`

3. **Ensure WhatsApp secret key is escaped:**
   - Should be: `WHATSAPP_SECRET_KEY=$$343XSWE12$$$$`

4. **Save and restart:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

## Verification

After fixing, you should see:
- ✅ No "Cannot read properties of undefined (reading 'split')" error
- ✅ No "client password must be a string" error
- ✅ Database connections work properly
- ✅ WhatsApp service can read the secret key correctly

## What Gets Stored

- `process.env.DB_PASSWORD` = `**@/#Abc1` (no quotes)
- `process.env.WHATSAPP_SECRET_KEY` = `$343XSWE12$$` (3 dollar signs, as expected)

## If Issues Persist

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check for hidden characters:**
   ```bash
   cat -A .env | grep WHATSAPP_SECRET_KEY
   ```
   Should show: `WHATSAPP_SECRET_KEY=$$343XSWE12$$$$`

3. **Verify no duplicate variables:**
   ```bash
   grep -n "WHATSAPP_SECRET_KEY" .env
   ```
   Should only show one line.

