# Email OTP Setup Guide

## Overview
The email OTP verification feature has been added to the system. Users can now choose between WhatsApp or Email for OTP verification.

## Installation

### 1. Install nodemailer
```bash
npm install nodemailer
```

## Configuration

### 2. Add SMTP credentials to `.env` file

Add the following environment variables to your `.env` file:

```env
# SMTP Configuration for Email OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=E-Filing System
```

### SMTP Configuration Details

- **SMTP_HOST**: Your SMTP server hostname (e.g., `smtp.gmail.com`, `smtp.outlook.com`)
- **SMTP_PORT**: SMTP port (usually `587` for TLS or `465` for SSL)
- **SMTP_SECURE**: Set to `true` for port 465 (SSL), `false` for port 587 (TLS)
- **SMTP_USER**: Your SMTP username/email
- **SMTP_PASS**: Your SMTP password or app-specific password
- **SMTP_FROM**: The email address that will appear as the sender
- **SMTP_FROM_NAME**: The display name for the sender

### Gmail Setup Example

For Gmail, you'll need to:
1. Enable 2-Step Verification
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=E-Filing System
```

## Features

### What's Changed

1. **Email Service**: New `lib/emailService.js` handles email sending via SMTP
2. **OTP Input Component**: New `components/ui/otp-input.jsx` provides 6-digit OTP input boxes
3. **OTP Verification Modal**: New reusable `components/OTPVerificationModal.jsx` component
4. **API Updates**: 
   - `/api/efiling/send-otp` now accepts `method` parameter (`whatsapp` or `email`)
   - `/api/efiling/verify-auth` now accepts `method` parameter
5. **UI Updates**: All OTP verification UIs now show:
   - Method selection dropdown (WhatsApp/Email) first
   - 6-digit OTP input boxes after OTP is sent

### Updated Components

- `app/efilinguser/components/DocumentSignatureSystem.jsx`
- `app/efiling/components/DocumentSignatureSystem.jsx`
- `app/efilinguser/components/ESignatureModal.jsx`
- `app/efiling/components/ESignatureModal.jsx`
- Profile settings page (if applicable)

## Testing

1. Start the application
2. Navigate to any feature that requires OTP verification
3. Select "Email" from the verification method dropdown
4. Click "Send OTP"
5. Check your email for the OTP
6. Enter the 6-digit OTP in the input boxes
7. Click "Verify"

## Troubleshooting

### Email not sending
- Check SMTP credentials in `.env`
- Verify SMTP server allows connections from your server
- Check server logs for SMTP errors
- For Gmail, ensure you're using an App Password, not your regular password

### OTP not received
- Check spam/junk folder
- Verify email address in user profile
- Check SMTP server logs
- Ensure SMTP service is not rate-limited

## Notes

- The email service will gracefully handle missing SMTP configuration
- If SMTP is not configured, users will see an error message
- WhatsApp OTP remains the default method
- Both methods use the same OTP code storage and verification system

