const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const {
  createDailyChallenge,
  getActiveChallenge,
  getAllChallenges,
  completeChallenge,
  getChallengeStats,
  updateDailyChallenge,
  deleteDailyChallenge,
} = require("./daily-challenge.controller");

// Admin routes
router.post("/", protect, adminOnly, createDailyChallenge);
router.put("/:id", protect, adminOnly, updateDailyChallenge);
router.delete("/:id", protect, adminOnly, deleteDailyChallenge);

// Student/Public routes
router.get("/active", protect, getActiveChallenge);
router.get("/all", protect, getAllChallenges);
router.post("/complete", protect, completeChallenge);
router.get("/stats", protect, adminOnly, getChallengeStats);

module.exports = router;