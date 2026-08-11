const nodemailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = require("../config/env");

/**
 * Create reusable transporter (Gmail SMTP)
 */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports (587)
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  // Best practices to avoid spam
  tls: {
    rejectUnauthorized: false, // Allow self-signed certs for testing
  },
});

/**
 * Verify transporter connection (call on startup)
 */
const verifyMailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Mail server ready (Gmail SMTP)");
  } catch (error) {
    console.warn("⚠️ Mail server verification failed:", error.message);
  }
};

/**
 * Send OTP email
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.otp - Verification code
 * @param {number} params.expiryMinutes - OTP expiry (minutes)
 */
const sendOTPEmail = async ({ to, otp, expiryMinutes = 10 }) => {
  const mailOptions = {
    from: MAIL_FROM,
    to,
    subject: "Your OTP – CSE(AIML) Student Monitoring System",
    text: `Your verification code is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes.\nIf you didn't request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 8px;">
        <h2 style="color: #6d28d9; text-align: center;">CSE(AIML) Student Monitoring</h2>
        <p style="color: #444;">Your one-time verification code is:</p>
        <div style="text-align: center; padding: 20px; font-size: 32px; font-weight: bold; color: #6d28d9; background: #eef2ff; border-radius: 8px;">
          <span style="letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #777; font-size: 14px; margin-top: 20px;">This code expires in <strong>${expiryMinutes} minutes</strong>.</p>
        <p style="color: #aaa; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send imposition penalty email (optimized to avoid spam filtering)
 * @param {Object} params
 * @param {string} params.to - Student email
 * @param {string} params.studentName - Student username
 * @param {string} params.reason - Reason for imposition
 * @param {string} [params.description] - Optional additional notes
 */
const sendImpositionEmail = async ({ to, studentName, reason, description = "" }) => {
  const mailOptions = {
    from: MAIL_FROM,
    to,
    subject: `⚠️ Imposition Notice – ${reason}`,
    text: `Dear ${studentName},\n\nYou have been given an imposition for: ${reason}.\n\n${description}\n\nPlease make sure to complete all future assignments on time.\n\nRegards,\nCSE(AIML) Faculty`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
        <h2 style="color: #b91c1c; margin-top: 0;">Imposition Notice</h2>
        <p style="color: #444;">Dear <strong>${studentName}</strong>,</p>
        <p style="color: #444;">You have been given an imposition for:</p>
        <blockquote style="background: #fff; padding: 10px; border-radius: 4px; color: #b91c1c; font-weight: bold;">
          ${reason}
        </blockquote>
        ${description ? `<p style="color: #555;">${description}</p>` : ""}
        <p style="color: #777;">Please complete all future assignments on time.</p>
        <p style="color: #444;">Regards,<br/>CSE(AIML) Faculty</p>
      </div>
    `,
    // Anti-spam headers
    headers: {
      "X-Entity-Ref-ID": `${Date.now()}-${to}`,
      "Precedence": "bulk",
      "List-Unsubscribe": `<mailto:${SMTP_USER}?subject=unsubscribe>`,
    },
    priority: "high",
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  verifyMailConnection,
  sendOTPEmail,
  sendImpositionEmail,
};