const asyncHandler = require("../../utils/async-handler");
const ApiError = require("../../utils/api-error");
const ApiResponse = require("../../utils/api-response");
const studentService = require("./student.service");
const { updateProfileSchema, updateStudentByAdminSchema } = require("./student.validator");

const getMyProfile = asyncHandler(async (req, res) => {
  const student = await studentService.getMyProfile(req.user.id);
  return ApiResponse.success(res, student, "Profile fetched");
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const payload = updateProfileSchema.parse(req.body);
  const student = await studentService.updateMyProfile(req.user.id, payload);
  return ApiResponse.success(res, student, "Profile updated");
});

const getAllStudents = asyncHandler(async (req, res) => {
  const students = await studentService.getAllStudents();
  return ApiResponse.success(res, students, "All students fetched");
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  return ApiResponse.success(res, student, "Student fetched");
});

const updateStudentByAdmin = asyncHandler(async (req, res) => {
  const payload = updateStudentByAdminSchema.parse(req.body);
  const student = await studentService.updateStudentByAdmin(req.params.id, payload);
  return ApiResponse.success(res, student, "Student updated");
});

const deleteStudentByAdmin = asyncHandler(async (req, res) => {
  await studentService.deleteStudentByAdmin(req.params.id);
  return ApiResponse.success(res, null, "Student deleted");
});

const getStudentAnalytics = asyncHandler(async (req, res) => {
  const analytics = await studentService.getStudentAnalytics();
  return ApiResponse.success(res, analytics, "Student analytics fetched");
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudentByAdmin,
  deleteStudentByAdmin,
  getStudentAnalytics,
};