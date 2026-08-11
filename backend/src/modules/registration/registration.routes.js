const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const { studentAuth } = require("../../middlewares/student.middleware");
const { adminAuth } = require("../../middlewares/admin.middleware");
const {
  getMyRegistrations,
  getRegistrationById,
  getAllRegistrations,
  deleteRegistration,
} = require("./registration.controller");

// Student routes
router.get("/me", studentAuth, getMyRegistrations);

// Admin routes
router.get("/", adminAuth, getAllRegistrations);
router.get("/:id", protect, getRegistrationById);
router.delete("/:id", studentAuth, deleteRegistration);

module.exports = router;