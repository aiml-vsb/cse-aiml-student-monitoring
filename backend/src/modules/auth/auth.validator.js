const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const studentLoginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const sendOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

const verifyOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const adminLoginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const githubCallbackSchema = z.object({
  code: z.string().min(1, "GitHub code is required"),
});

module.exports = {
  registerSchema,
  studentLoginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
  githubCallbackSchema,
};