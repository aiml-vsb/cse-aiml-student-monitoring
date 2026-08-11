const asyncHandler = require("../../utils/async-handler");
const ApiError = require("../../utils/api-error");
const ApiResponse = require("../../utils/api-response");
const adminService = require("./admin.service");
const { ADMIN_EMAIL } = require("../../config/env");

const createAdmin = asyncHandler(async (req, res) => {
  const result = await adminService.createAdmin(req.body);
  return ApiResponse.success(res, result, "Admin created successfully", 201);
});

const getAdmins = asyncHandler(async (req, res) => {
  const result = await adminService.getAdmins();
  return ApiResponse.success(res, result, "Admins fetched");
});

const deleteAdmin = asyncHandler(async (req, res) => {
  // Cannot delete yourself
  if (req.params.id === req.user.id) {
    throw new ApiError(400, "You cannot delete yourself");
  }

  const result = await adminService.deleteAdmin(req.params.id);
  return ApiResponse.success(res, result, "Admin deleted");
});

const getAdminStats = asyncHandler(async (req, res) => {
  const result = await adminService.getAdminStats();
  return ApiResponse.success(res, result, "Admin stats fetched");
});

module.exports = {
  createAdmin,
  getAdmins,
  deleteAdmin,
  getAdminStats,
};