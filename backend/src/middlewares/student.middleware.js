const ApiError = require("../utils/api-error");
const { protect } = require("./auth.middleware");
const asyncHandler = require("../utils/async-handler");

/**
 * Student-only access – must be used AFTER `protect`.
 */
const studentOnly = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "STUDENT") {
    throw new ApiError(403, "Access denied – student privileges required");
  }
  next();
});

// Combined middleware for convenience
const studentAuth = [protect, studentOnly];

module.exports = { studentOnly, studentAuth };