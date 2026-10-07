import nodemailer from "nodemailer";

/**
 * KW&SC mail (OTP, meetings, communications test).
 * Port 465 (implicit SSL) is closed on this server — use 587 + STARTTLS.
 */
export const transporter = nodemailer.createTransport({
  host: "mail.kwsc.gos.pk",
  port: 587,
  secure: false, // 587 starts plain, then STARTTLS
  requireTLS: true,
  auth: {
    user: "efiling@kwsc.gos.pk",
    pass: process.env.EMAIL_PASSWORD,
  },
  // Government mail servers may use self-signed certificates
  tls: {
    rejectUnauthorized: false,
  },
  // Bound these so a dead SMTP port cannot hang Node until nginx returns 502
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

export const sendMeetingEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"KW&SC E-Filing System" <efiling@kwsc.gos.pk>',
      to,
      subject,
      html,
    });
    console.log("Email sent to:", to, "MessageID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error for", to, ":", error);
    return {
      success: false,
      error: error.message || "Failed to send email",
      code: error.code || null,
    };
  }
};

/**
 * Send OTP via Email (same backend as meetings — efiling@kwsc.gos.pk)
 */
export const sendOTPViaEmail = async (email, otpCode, userName = "User") => {
  const subject = "Your OTP for E-Signature Verification";
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
                <p style="color: #dc2626; font-weight: bold;">This code is valid for 120 seconds.</p>
                <p style="color: #dc2626;">Please do not share this code with anyone.</p>
                <p>If you did not request this OTP, please ignore this email or contact support.</p>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
                <p>Thank you,<br>KW&SC E-Filing System</p>
                <p style="margin-top: 10px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
    `;

  const result = await sendMeetingEmail({ to: email, subject, html });
  return {
    success: Boolean(result?.success),
    message: result?.success ? "Email sent successfully" : undefined,
    error: result?.success ? undefined : (result?.error || "Failed to send email"),
  };
};
