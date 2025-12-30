/**
 * Email Service
 * Sends emails via SMTP
 * Configure SMTP credentials in .env file
 */

// SMTP Configuration from environment variables
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    },
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
    fromName: process.env.SMTP_FROM_NAME || 'E-Filing System'
};

// Check if SMTP is configured
const isSMTPConfigured = () => {
    return !!(
        SMTP_CONFIG.host &&
        SMTP_CONFIG.auth.user &&
        SMTP_CONFIG.auth.pass &&
        SMTP_CONFIG.from
    );
};

/**
 * Send email via SMTP
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {string} text - Email plain text content (optional)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendEmail(to, subject, html, text = null) {
    try {
        // Check if SMTP is configured
        if (!isSMTPConfigured()) {
            console.warn('[Email Service] SMTP not configured. Please add SMTP credentials to .env file.');
            return {
                success: false,
                error: 'Email service is not configured. Please contact administrator.'
            };
        }

        // Validate email address
        if (!to || !to.includes('@')) {
            throw new Error('Invalid email address');
        }

        // Dynamic import of nodemailer (only load if needed)
        const nodemailer = await import('nodemailer');

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: SMTP_CONFIG.host,
            port: SMTP_CONFIG.port,
            secure: SMTP_CONFIG.secure,
            auth: SMTP_CONFIG.auth,
            tls: {
                rejectUnauthorized: false // Allow self-signed certificates
            }
        });

        // Verify connection
        await transporter.verify();

        // Email options
        const mailOptions = {
            from: `"${SMTP_CONFIG.fromName}" <${SMTP_CONFIG.from}>`,
            to: to,
            subject: subject,
            html: html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
        };

        console.log('[Email Service] Sending email:', {
            to: to,
            subject: subject,
            from: SMTP_CONFIG.from
        });

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('[Email Service] Email sent successfully:', {
            messageId: info.messageId,
            to: to
        });

        return {
            success: true,
            message: 'Email sent successfully',
            data: { messageId: info.messageId }
        };

    } catch (error) {
        console.error('[Email Service] Error sending email:', error);

        // Handle specific error types
        if (error.code === 'EAUTH') {
            return {
                success: false,
                error: 'SMTP authentication failed. Please check your credentials.'
            };
        }

        if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            return {
                success: false,
                error: 'Unable to connect to email server. Please try again later.'
            };
        }

        return {
            success: false,
            error: error.message || 'Failed to send email'
        };
    }
}

/**
 * Send OTP via Email
 * @param {string} email - User's email address
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendOTPViaEmail(email, otpCode, userName = 'User') {
    const subject = 'Your OTP for E-Signature Verification';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin-top: 0;">E-Signature Verification</h2>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <p>Dear ${userName},</p>
                
                <p>Your OTP for e-signature verification is:</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                        ${otpCode}
                    </h1>
                </div>
                
                <p style="color: #dc2626; font-weight: bold;">This code is valid for 60 seconds.</p>
                
                <p style="color: #dc2626;">⚠️ Please do not share this code with anyone.</p>
                
                <p>If you did not request this OTP, please ignore this email or contact support.</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
                <p>Thank you,<br>E-Filing System</p>
                <p style="margin-top: 10px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(email, subject, html);
}

