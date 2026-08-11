const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middlewares/admin.middleware");
const { studentAuth } = require("../../middlewares/student.middleware");
const validate = require("../../utils/validate");
const {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  registerForInternship,
  unregisterFromInternship,
} = require("./internship.controller");
const { createInternshipSchema, updateInternshipSchema, registerSchema } = require("./internship.validator");

// Admin routes
router.post("/", adminAuth, validate(createInternshipSchema), createInternship);
router.put("/:id", adminAuth, validate(updateInternshipSchema), updateInternship);
router.delete("/:id", adminAuth, deleteInternship);

// Student/Public routes
router.get("/", getInternships);
router.get("/:id", getInternshipById);
router.post("/:id/register", studentAuth, validate(registerSchema), registerForInternship);
router.delete("/:id/register", studentAuth, unregisterFromInternship);

module.exports = router;