const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const internshipService = require("./internship.service");

const createInternship = asyncHandler(async (req, res) => {
  const result = await internshipService.createInternship(req.body, req.user.id);
  return ApiResponse.success(res, result, "Internship created successfully", 201);
});

const getInternships = asyncHandler(async (req, res) => {
  const result = await internshipService.getActiveInternships();
  return ApiResponse.success(res, result, "Active internships fetched");
});

const getInternshipById = asyncHandler(async (req, res) => {
  const result = await internshipService.getInternshipById(req.params.id);
  return ApiResponse.success(res, result, "Internship fetched");
});

const updateInternship = asyncHandler(async (req, res) => {
  const result = await internshipService.updateInternship(req.params.id, req.body, req.user.id);
  return ApiResponse.success(res, result, "Internship updated");
});

const deleteInternship = asyncHandler(async (req, res) => {
  await internshipService.deleteInternship(req.params.id);
  return ApiResponse.success(res, null, "Internship deleted");
});

const registerForInternship = asyncHandler(async (req, res) => {
  const result = await internshipService.registerForInternship(req.params.id, req.user.id);
  return ApiResponse.success(res, result, "Registration successful");
});

const unregisterFromInternship = asyncHandler(async (req, res) => {
  const result = await internshipService.unregisterFromInternship(req.user.id, req.params.id);
  return ApiResponse.success(res, result, "Registration removed");
});

module.exports = {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  registerForInternship,
  unregisterFromInternship,
};
