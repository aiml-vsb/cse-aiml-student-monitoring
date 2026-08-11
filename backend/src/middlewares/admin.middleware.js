const ApiError = require("../utils/api-error");
const { protect } = require("./auth.middleware");
const asyncHandler = require("../utils/async-handler");

/**
 * Admin-only access – must be used AFTER `protect`.
 */
const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied – admin privileges required");
  }
  next();
});

// Combined middleware for convenience
const adminAuth = [protect, adminOnly];

module.exports = { adminOnly, adminAuth };
