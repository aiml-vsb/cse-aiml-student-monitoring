const express = require("express");
const router = express.Router();
const { adminAuth } = require("../../middlewares/admin.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const validate = require("../../utils/validate");
const {
  createAdmin,
  getAdmins,
  deleteAdmin,
  getAdminStats,
} = require("./admin.controller");
const { createAdminSchema } = require("./admin.validator");

// All routes require admin authentication
router.use(adminAuth);

// @route  POST /api/v1/admin/create-admin
// @desc   Create a new admin (only admin can do this)
// @access Admin
router.post("/create-admin", validate(createAdminSchema), createAdmin);

// @route  GET /api/v1/admin
// @desc   List all admins
// @access Admin
router.get("/", getAdmins);

// @route  DELETE /api/v1/admin/:id
// @desc   Delete an admin (cannot delete default admin)
// @access Admin
router.delete("/:id", deleteAdmin);

// @route  GET /api/v1/admin/stats
// @desc   Get overall admin dashboard stats
// @access Admin
router.get("/stats", getAdminStats);

module.exports = router;