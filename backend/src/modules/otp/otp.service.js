const crypto = require("crypto");
const mailService = require("../../services/mail.service");
const { OTP_EXPIRY_MINUTES } = require("../../config/constants");

// In-memory OTP store (works for single instance; for production, switch to Redis/DB)
const otpStore = new Map();

/**
 * Generate a 6-digit OTP and store it with expiry
 * @param {string} email
 * @returns {Promise<string>} The OTP code
 */
const generateOtp = async (email) => {
  const otp = crypto.randomInt(100000, 999999).toString();

  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    attempts: 0,
  });

  return otp;
};

/**
 * Send OTP email
 * @param {string} email
 * @param {string} otp
 */
const sendOtpEmail = async (email, otp) => {
  await mailService.sendOTPEmail({ to: email, otp, expiryMinutes: OTP_EXPIRY_MINUTES });
};

/**
 * Verify a user-provided OTP
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<boolean>}
 * @throws {Error} If OTP is invalid or expired
 */
const verifyOtp = async (email, otp) => {
  const record = otpStore.get(email);

  if (!record) {
    throw new Error("No OTP requested for this email");
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    throw new Error("OTP expired. Please request a new one.");
  }

  if (record.attempts >= 5) {
    otpStore.delete(email);
    throw new Error("Too many failed attempts. Please request a new OTP.");
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    otpStore.set(email, record);
    throw new Error("Invalid OTP");
  }

  // Success – remove OTP
  otpStore.delete(email);
  return true;
};

/**
 * Resend OTP (regenerates and sends a new one)
 * @param {string} email
 */
const resendOtp = async (email) => {
  const otp = await generateOtp(email);
  await sendOtpEmail(email, otp);
  return true;
};

module.exports = { generateOtp, sendOtpEmail, verifyOtp, resendOtp };