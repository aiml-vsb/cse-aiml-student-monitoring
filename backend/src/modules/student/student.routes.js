const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const validate = require("../../utils/validate");
const {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudentByAdmin,
  deleteStudentByAdmin,
  getStudentAnalytics,
} = require("./student.controller");
const { updateProfileSchema, updateStudentByAdminSchema } = require("./student.validator");

// Student routes (self)
router.get("/me", protect, getMyProfile);
router.put("/me", protect, validate(updateProfileSchema), updateMyProfile);

// Admin routes
router.get("/", protect, adminOnly, getAllStudents);
router.get("/analytics", protect, adminOnly, getStudentAnalytics);
router.get("/:id", protect, adminOnly, getStudentById);
router.put("/:id", protect, adminOnly, validate(updateStudentByAdminSchema), updateStudentByAdmin);
router.delete("/:id", protect, adminOnly, deleteStudentByAdmin);

module.exports = router;