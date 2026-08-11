const express = require("express");
const router = express.Router();
const { generateOtp, verifyOtp, resendOtp } = require("./otp.controller");

// @route  POST /api/v1/otp/generate
// @desc   Generate and send OTP (used internally by auth)
// @access Public (but we might keep it private later)
router.post("/generate", generateOtp);

// @route  POST /api/v1/otp/verify
// @desc   Verify OTP (used internally by auth)
// @access Public
router.post("/verify", verifyOtp);

// @route  POST /api/v1/otp/resend
// @desc   Resend OTP
// @access Public
router.post("/resend", resendOtp);

module.exports = router;