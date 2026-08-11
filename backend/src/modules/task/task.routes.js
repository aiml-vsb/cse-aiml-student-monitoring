const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const {
  createTask,
  getAllTasks,
  getActiveTasks,
  getMyTaskHistory,
  completeTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require("./task.controller");

// Admin routes
router.post("/", protect, adminOnly, createTask);
router.get("/", protect, getAllTasks);
router.get("/active", protect, getActiveTasks);
router.get("/history", protect, getMyTaskHistory);
router.put("/:id", protect, adminOnly, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);

// Student route (protected)
router.post("/:id/complete", protect, completeTask);
router.get("/:id", protect, getTaskById);

module.exports = router;