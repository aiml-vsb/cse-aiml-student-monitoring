/**
 * Custom error class with status code and optional details.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = undefined, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;