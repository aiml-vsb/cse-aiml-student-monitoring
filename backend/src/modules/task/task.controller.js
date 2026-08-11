const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const taskService = require("./task.service");

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.body);
  return ApiResponse.success(res, task, "Task created", 201);
});

const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getAllTasks();
  return ApiResponse.success(res, tasks, "Tasks fetched");
});

const getActiveTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getActiveTasks(req.user.id);
  return ApiResponse.success(res, tasks, "Active tasks fetched");
});

const getMyTaskHistory = asyncHandler(async (req, res) => {
  const tasks = await taskService.getMyTaskHistory(req.user.id);
  return ApiResponse.success(res, tasks, "Task history fetched");
});

const completeTask = asyncHandler(async (req, res) => {
  const result = await taskService.completeTask(req.user.id, req.params.id);
  return ApiResponse.success(res, result, "Task marked as completed");
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  return ApiResponse.success(res, task, "Task fetched");
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  return ApiResponse.success(res, task, "Task updated");
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  return ApiResponse.success(res, null, "Task deleted");
});

module.exports = {
  createTask,
  getAllTasks,
  getActiveTasks,
  getMyTaskHistory,
  completeTask,
  getTaskById,
  updateTask,
  deleteTask,
};