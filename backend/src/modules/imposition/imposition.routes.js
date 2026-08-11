const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middlewares/admin.middleware");
const { studentAuth } = require("../../middlewares/student.middleware");
const validate = require("../../utils/validate");
const {
  createImposition,
  getMyImpositions,
  getAllImpositions,
  sendImpositionEmail,
} = require("./imposition.controller");
const { createImpositionSchema } = require("./imposition.validator");

// Admin routes
router.post("/", adminAuth, validate(createImpositionSchema), createImposition);
router.get("/", adminAuth, getAllImpositions);
router.post("/:id/send-email", adminAuth, sendImpositionEmail);

// Student routes
router.get("/me", studentAuth, getMyImpositions);

module.exports = router;