const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middlewares/admin.middleware");
const { studentAuth } = require("../../middlewares/student.middleware");
const validate = require("../../utils/validate"); // ✅ fixed import
const {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  registerForHackathon,
  unregisterFromHackathon,
} = require("./hackathon.controller");
const { createHackathonSchema, updateHackathonSchema, registerSchema } = require("./hackathon.validator");

// ── Admin routes ─────────────────────────────────────────
router.post("/", adminAuth, validate(createHackathonSchema), createHackathon);
router.put("/:id", adminAuth, validate(updateHackathonSchema), updateHackathon);
router.delete("/:id", adminAuth, deleteHackathon);

// ── Student/Public routes ────────────────────────────────
router.get("/", getHackathons);
router.get("/:id", getHackathonById);
router.post("/:id/register", studentAuth, validate(registerSchema), registerForHackathon);
router.delete("/:id/register", studentAuth, unregisterFromHackathon);

module.exports = router;