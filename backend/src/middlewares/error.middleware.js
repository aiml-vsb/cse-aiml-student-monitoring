const { ZodError } = require("zod");

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central error handler
const errorHandler = (err, req, res, next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const fieldErrors = err.flatten().fieldErrors;
    const messages = Object.entries(fieldErrors).map(
      ([field, errors]) => `${field}: ${errors.join(", ")}`
    );
    return res.status(400).json({
      success: false,
      message: messages.join("; ") || "Validation error",
      data: null,
    });
  }

  // Custom API errors – check for statusCode directly (no import needed)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // Any other error
  console.error("❌ Error:", err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    data: null,
  });
};

module.exports = { notFound, errorHandler };
