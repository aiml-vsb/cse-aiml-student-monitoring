const asyncHandler = require("../../utils/async-handler");
const ApiResponse = require("../../utils/api-response");
const excelService = require("../../services/excel.service");
const pptService = require("../../services/ppt.service");

const exportExcel = asyncHandler(async (req, res) => {
  const buffer = await excelService.generateStudentsExcel();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=students-${Date.now()}.xlsx`);
  return res.send(buffer);
});

const exportPPT = asyncHandler(async (req, res) => {
  const buffer = await pptService.generatePresentation();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  res.setHeader("Content-Disposition", `attachment; filename=student-report-${Date.now()}.pptx`);
  return res.send(buffer);
});

module.exports = { exportExcel, exportPPT };