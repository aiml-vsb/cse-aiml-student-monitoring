const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middlewares/admin.middleware");
const { studentAuth } = require("../../middlewares/student.middleware");
const validate = require("../../utils/validate");
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  registerForCourse,
  unregisterFromCourse,
} = require("./course.controller");
const { createCourseSchema, updateCourseSchema, registerSchema } = require("./course.validator");

// Admin routes
router.post("/", adminAuth, validate(createCourseSchema), createCourse);
router.put("/:id", adminAuth, validate(updateCourseSchema), updateCourse);
router.delete("/:id", adminAuth, deleteCourse);

// Student/Public routes
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/:id/register", studentAuth, validate(registerSchema), registerForCourse);
router.delete("/:id/register", studentAuth, unregisterFromCourse);

module.exports = router;