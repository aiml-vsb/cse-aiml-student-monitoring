/**
 * Standard success response formatter.
 */
class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }
}

module.exports = ApiResponse;