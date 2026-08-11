const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const otpService = require("./otp.service");
const { z } = require("zod");
const ApiError = require("../../utils/api-error");

const emailSchema = z.object({ email: z.string().email() });

const generateOtp = asyncHandler(async (req, res) => {
  const { email } = emailSchema.parse(req.body);
  const otp = await otpService.generateOtp(email);
  await otpService.sendOtpEmail(email, otp);
  return ApiResponse.success(res, null, "OTP sent successfully");
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = z
    .object({
      email: z.string().email(),
      otp: z.string().length(6),
    })
    .parse(req.body);

  await otpService.verifyOtp(email, otp);
  return ApiResponse.success(res, null, "OTP verified");
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = emailSchema.parse(req.body);
  await otpService.resendOtp(email);
  return ApiResponse.success(res, null, "OTP resent");
});

module.exports = { generateOtp, verifyOtp, resendOtp };