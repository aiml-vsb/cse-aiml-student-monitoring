const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");
const { signToken } = require("../../lib/jwt");
const otpService = require("../otp/otp.service");
const githubService = require("../../services/github.service");
const ApiError = require("../../utils/api-error");

/**
 * Student registration – creates user with hashed password, sends OTP.
 */
const studentRegister = async ({ email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "STUDENT",
    },
  });

  const otp = await otpService.generateOtp(email);
  await otpService.sendOtpEmail(email, otp);

  return { userId: user.id, email: user.email };
};

/**
 * Student login using email + password.
 */
const studentLogin = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.role !== "STUDENT") {
    throw new ApiError(403, "This account is not a student account");
  }

  if (!user.password) {
    throw new ApiError(401, "This account uses Google sign-in. Please use Google to login.");
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.emailVerified) {
    throw new ApiError(403, "Email not verified. Please verify via OTP.");
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { token, user: sanitizeUser(user) };
};

/**
 * Admin login using email and password.
 */
const adminLogin = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== "ADMIN") {
    throw new ApiError(401, "Invalid admin credentials");
  }

  if (!user.password) {
    throw new ApiError(401, "Admin account not configured with a password");
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { token, user: sanitizeUser(user) };
};

/**
 * Verify OTP – marks email as verified, optionally logs in.
 */
const verifyOtpAndLogin = async ({ email, otp }) => {
  await otpService.verifyOtp(email, otp);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const newUser = await prisma.user.create({
      data: { email, role: "STUDENT", emailVerified: true },
    });
    const token = signToken({ id: newUser.id, role: newUser.role, email: newUser.email });
    return { token, user: sanitizeUser(newUser) };
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  const token = signToken({ id: updatedUser.id, role: updatedUser.role, email: updatedUser.email });
  return { token, user: sanitizeUser(updatedUser) };
};

/**
 * Send OTP for a given email (fallback OTP login).
 */
const sendOtpToEmail = async (email) => {
  const otp = await otpService.generateOtp(email);
  await otpService.sendOtpEmail(email, otp);
  return { message: "OTP sent to email" };
};

/**
 * Get current user profile – safely returns user without sensitive fields.
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      dailyCompletions: true,
      registrations: true,
      impositions: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");

  // Remove sensitive fields before returning
  const { password, githubAccessToken, ...safeUser } = user;

  return {
    ...safeUser,
    hasPassword: !!password,
  };
};

/**
 * Generate GitHub OAuth URL for linking.
 */
const getGithubOAuthUrl = async (targetUserId, redirectPath = "/student") => {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new ApiError(404, "User not found");

  const state = Buffer.from(JSON.stringify({ targetUserId, redirectPath })).toString("base64");
  return githubService.getOAuthURL(state);
};

/**
 * Manual GitHub link via code (POST).
 */
const linkGithubAccount = async (userId, code) => {
  const accessToken = await githubService.exchangeCodeForToken(code);
  const githubUser = await githubService.getGitHubUser(accessToken);

  const existingUser = await prisma.user.findFirst({
    where: { githubUsername: githubUser.username },
  });

  if (existingUser && existingUser.id !== userId) {
    throw new ApiError(409, "GitHub account already linked to another user");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      githubUsername: githubUser.username,
      githubAccessToken: accessToken,
    },
  });

  return { githubUsername: updated.githubUsername };
};

/**
 * GitHub OAuth redirect callback – links GitHub using state.
 */
const linkGithubViaOAuth = async (code, targetUserId) => {
  try {
    const accessToken = await githubService.exchangeCodeForToken(code);
    const githubUser = await githubService.getGitHubUser(accessToken);

    const existingUser = await prisma.user.findFirst({
      where: { githubUsername: githubUser.username },
    });

    if (existingUser && existingUser.id !== targetUserId) {
      return { success: false, error: "GitHub account already linked to another user" };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        githubUsername: githubUser.username,
        githubAccessToken: accessToken,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    return { success: false };
  }
};

const logout = async () => {
  return { message: "Logged out successfully" };
};

const sanitizeUser = (user) => {
  const { password, githubAccessToken, ...safeUser } = user;
  return { ...safeUser, hasPassword: !!password };
};

module.exports = {
  studentRegister,
  studentLogin,
  adminLogin,
  verifyOtpAndLogin,
  sendOtpToEmail,
  getCurrentUser,
  getGithubOAuthUrl,
  linkGithubAccount,
  linkGithubViaOAuth,
  logout,
  sanitizeUser,
};
