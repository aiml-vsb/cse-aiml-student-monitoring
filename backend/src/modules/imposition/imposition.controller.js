const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const impositionService = require("./imposition.service");

const createImposition = asyncHandler(async (req, res) => {
  const result = await impositionService.createImposition(req.body, req.user.id);
  return ApiResponse.success(res, result, "Imposition created", 201);
});

const getMyImpositions = asyncHandler(async (req, res) => {
  const result = await impositionService.getMyImpositions(req.user.id);
  return ApiResponse.success(res, result, "My impositions fetched");
});

const getAllImpositions = asyncHandler(async (req, res) => {
  const result = await impositionService.getAllImpositions();
  return ApiResponse.success(res, result, "All impositions fetched");
});

const sendImpositionEmail = asyncHandler(async (req, res) => {
  const result = await impositionService.sendImpositionEmail(req.params.id);
  return ApiResponse.success(res, result, result.message);
});

module.exports = {
  createImposition,
  getMyImpositions,
  getAllImpositions,
  sendImpositionEmail,
};