const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth.middleware");
const { adminOnly } = require("../../middlewares/admin.middleware");
const { exportExcel, exportPPT } = require("./export.controller");

router.get("/excel", protect, adminOnly, exportExcel);
router.get("/ppt", protect, adminOnly, exportPPT);

module.exports = router;