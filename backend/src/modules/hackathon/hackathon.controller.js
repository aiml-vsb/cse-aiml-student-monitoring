const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const hackathonService = require("./hackathon.service");

const createHackathon = asyncHandler(async (req, res) => {
  const result = await hackathonService.createHackathon(req.body, req.user.id);
  return ApiResponse.success(res, result, "Hackathon created successfully", 201);
});

const getHackathons = asyncHandler(async (req, res) => {
  const result = await hackathonService.getActiveHackathons();
  return ApiResponse.success(res, result, "Active hackathons fetched");
});

const getHackathonById = asyncHandler(async (req, res) => {
  const result = await hackathonService.getHackathonById(req.params.id);
  return ApiResponse.success(res, result, "Hackathon fetched");
});

const updateHackathon = asyncHandler(async (req, res) => {
  const result = await hackathonService.updateHackathon(req.params.id, req.body, req.user.id);
  return ApiResponse.success(res, result, "Hackathon updated");
});

const deleteHackathon = asyncHandler(async (req, res) => {
  await hackathonService.deleteHackathon(req.params.id);
  return ApiResponse.success(res, null, "Hackathon deleted");
});

const registerForHackathon = asyncHandler(async (req, res) => {
  const result = await hackathonService.registerForHackathon(req.params.id, req.user.id);
  return ApiResponse.success(res, result, "Registration successful");
});

const unregisterFromHackathon = asyncHandler(async (req, res) => {
  const result = await hackathonService.unregisterFromHackathon(req.user.id, req.params.id);
  return ApiResponse.success(res, result, "Registration removed");
});

module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  registerForHackathon,
  unregisterFromHackathon,
};