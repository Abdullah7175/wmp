import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "mail.kwsc.gos.pk",
  port: 465,
  secure: true, // SSL
  auth: {
    user: "efiling@kwsc.gos.pk",
    pass: process.env.EMAIL_PASSWORD, 
  },
  // Adding this because some government servers have self-signed certificates
  tls: {
    rejectUnauthorized: false,
  }
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
    return true;
  } catch (error) {
    console.error("Email error for", to, ":", error);
    return false;
  }
};