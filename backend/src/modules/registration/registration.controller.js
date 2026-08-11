const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const registrationService = require("./registration.service");

const getMyRegistrations = asyncHandler(async (req, res) => {
  const result = await registrationService.getMyRegistrations(req.user.id);
  return ApiResponse.success(res, result, "Registrations fetched");
});

const getRegistrationById = asyncHandler(async (req, res) => {
  const result = await registrationService.getRegistrationById(req.params.id);
  return ApiResponse.success(res, result, "Registration fetched");
});

const getAllRegistrations = asyncHandler(async (req, res) => {
  const result = await registrationService.getAllRegistrations();
  return ApiResponse.success(res, result, "All registrations fetched");
});

const deleteRegistration = asyncHandler(async (req, res) => {
  const result = await registrationService.deleteRegistration(req.params.id, req.user.id);
  return ApiResponse.success(res, result, "Registration cancelled");
});

module.exports = {
  getMyRegistrations,
  getRegistrationById,
  getAllRegistrations,
  deleteRegistration,
};