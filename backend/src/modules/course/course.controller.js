const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const courseService = require("./course.service");

const createCourse = asyncHandler(async (req, res) => {
  const result = await courseService.createCourse(req.body, req.user.id);
  return ApiResponse.success(res, result, "Course created successfully", 201);
});

const getCourses = asyncHandler(async (req, res) => {
  const result = await courseService.getActiveCourses();
  return ApiResponse.success(res, result, "Active courses fetched");
});

const getCourseById = asyncHandler(async (req, res) => {
  const result = await courseService.getCourseById(req.params.id);
  return ApiResponse.success(res, result, "Course fetched");
});

const updateCourse = asyncHandler(async (req, res) => {
  const result = await courseService.updateCourse(req.params.id, req.body, req.user.id);
  return ApiResponse.success(res, result, "Course updated");
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  return ApiResponse.success(res, null, "Course deleted");
});

const registerForCourse = asyncHandler(async (req, res) => {
  const result = await courseService.registerForCourse(req.params.id, req.user.id);
  return ApiResponse.success(res, result, "Enrollment successful");
});

const unregisterFromCourse = asyncHandler(async (req, res) => {
  const result = await courseService.unregisterFromCourse(req.user.id, req.params.id);
  return ApiResponse.success(res, result, "Registration removed");
});

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  registerForCourse,
  unregisterFromCourse,
};