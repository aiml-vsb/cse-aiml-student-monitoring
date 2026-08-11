const asyncHandler = require("../../utils/async-handler");
const ApiError = require("../../utils/api-error");
const ApiResponse = require("../../utils/api-response");
const dailyChallengeService = require("./daily-challenge.service");
const { createDailyChallengeSchema, updateDailyChallengeSchema } = require("./daily-challenge.validator");

const createDailyChallenge = asyncHandler(async (req, res) => {
  const payload = createDailyChallengeSchema.parse(req.body);
  const challenge = await dailyChallengeService.createDailyChallenge(req.user.id, payload);
  return ApiResponse.success(res, challenge, "Daily challenge created successfully", 201);
});

const getActiveChallenge = asyncHandler(async (req, res) => {
  const challenge = await dailyChallengeService.getActiveChallenge(req.user.id);
  return ApiResponse.success(res, challenge, "Active challenge fetched");
});

const getAllChallenges = asyncHandler(async (req, res) => {
  const challenges = await dailyChallengeService.getAllChallenges(req.user.id);
  return ApiResponse.success(res, challenges, "Challenge history fetched");
});

const completeChallenge = asyncHandler(async (req, res) => {
  const result = await dailyChallengeService.completeChallenge(req.user.id);
  return ApiResponse.success(res, result, "Challenge completion recorded");
});

const getChallengeStats = asyncHandler(async (req, res) => {
  const stats = await dailyChallengeService.getChallengeStats();
  return ApiResponse.success(res, stats, "Challenge statistics fetched");
});

const updateDailyChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = updateDailyChallengeSchema.parse(req.body);
  const challenge = await dailyChallengeService.updateDailyChallenge(id, payload);
  return ApiResponse.success(res, challenge, "Challenge updated successfully");
});

const deleteDailyChallenge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await dailyChallengeService.deleteDailyChallenge(id);
  return ApiResponse.success(res, null, "Challenge deleted successfully");
});

module.exports = {
  createDailyChallenge,
  getActiveChallenge,
  getAllChallenges,
  completeChallenge,
  getChallengeStats,
  updateDailyChallenge,
  deleteDailyChallenge,
};
