# Environment Variable Fix for WhatsApp Secret Key

## Important Note

**The actual WhatsApp secret key value is `$343XSWE12$$` - this NEVER changes!**

We're only escaping it in the `.env` file so Next.js can parse it correctly. The value that gets sent to the WhatsApp API will still be `$343XSWE12$$`.

## Problem

The error `TypeError: Cannot read properties of undefined (reading 'split')` occurs because Next.js tries to interpret `$` characters in environment variable values as variable interpolation.

When Next.js sees `$343XSWE12$$` in the `.env` file, it thinks:
- `$343XSWE12$` is a variable name (which doesn't exist → undefined)
- This causes the error when trying to process it

## Solution

In Next.js `.env` files, you must escape each `$` character with `$$` to use it as a literal character.

### What You Write in `.env` File:
```env
WHATSAPP_SECRET_KEY=$$343XSWE12$$$$
```

### What Gets Stored in `process.env.WHATSAPP_SECRET_KEY`:
```
$343XSWE12$$
```

### What Gets Sent to WhatsApp API:
```json
{
  "secret_key": "$343XSWE12$$",
  "phone": "03330355270",
  "message": "otp 123456"
}
```

## How It Works

- **In `.env` file:** Write `$$343XSWE12$$$$` (6 dollar signs)
- **Next.js parsing:** Converts `$$` → `$`, so `$$343XSWE12$$$$` becomes `$343XSWE12$$`
- **In your code:** `process.env.WHATSAPP_SECRET_KEY` = `$343XSWE12$$` ✅
- **To WhatsApp API:** Sends `$343XSWE12$$` ✅

## Steps to Fix

1. **Edit your `.env` file:**
   ```bash
   nano .env
   ```

2. **Try single quotes first (simpler):**
   ```env
   WHATSAPP_API_URL=http://erp.rehmanigroup.com:8003/whatsapp.php
   WHATSAPP_SECRET_KEY='$343XSWE12$$'
   ```
   
   If this doesn't work, use the escaping method:
   ```env
   WHATSAPP_SECRET_KEY=$$343XSWE12$$$$
   ```

3. **Rebuild the application:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Verify the value is correct:**
   The WhatsApp API should receive `$343XSWE12$$` (with 3 dollar signs) - the same value you use in your API tests.

## Alternative: Try Single Quotes First

You can try wrapping the value in single quotes first - this sometimes works and is simpler:
```env
WHATSAPP_SECRET_KEY='$343XSWE12$$'
```

**Try this first!** If it works, you don't need to escape with `$$`. However, if you still get the error, use the `$$` escaping method above.

## Summary

- **Your actual secret key:** `$343XSWE12$$` (never changes)
- **In `.env` file:** Either `'$343XSWE12$$'` (with quotes) or `$$343XSWE12$$$$` (with escaping)
- **In your code:** `process.env.WHATSAPP_SECRET_KEY` will be `$343XSWE12$$`
- **To WhatsApp API:** Will send `$343XSWE12$$` ✅

The escaping is only for Next.js to parse the `.env` file correctly - it doesn't change the actual secret key value!

