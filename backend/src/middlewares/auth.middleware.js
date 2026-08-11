const { verifyToken } = require("../lib/jwt");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");
const asyncHandler = require("../utils/async-handler");

/**
 * Protects routes – requires a valid access token.
 * Attaches the full user object to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Alternatively, from cookie `access_token`
  if (!token && req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    throw new ApiError(401, "Not authorized – no token provided");
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, "Not authorized – invalid or expired token");
  }

  // Fetch fresh user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      role: true,
      username: true,
      year: true,
      leetcodeUsername: true,
      githubUsername: true,
      profileComplete: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Not authorized – user no longer exists");
  }

  req.user = user;
  next();
});

module.exports = { protect };