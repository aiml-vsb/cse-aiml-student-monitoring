const ExcelJS = require("exceljs");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");

/**
 * Fetch student data and generate an Excel report buffer.
 * All DB queries are done here, so the function takes no arguments.
 */
const generateStudentsExcel = async () => {
  // Single query to get all students with their relations
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      dailyCompletions: { select: { status: true } },
      registrations: {
        include: {
          hackathon: { select: { title: true } },
          internship: { select: { title: true } },
          course: { select: { title: true } },
        },
      },
      impositions: { select: { reason: true, imposedAt: true } },
    },
  });

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found");
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CSE(AIML) Student Monitoring System";
  workbook.created = new Date();

  // ── Sheet 1: Overview ─────────────────────────────────────
  const overview = workbook.addWorksheet("Overview");
  overview.columns = [
    { header: "Username", key: "username", width: 20 },
    { header: "Email", key: "email", width: 32 },
    { header: "Year", key: "year", width: 12 },
    { header: "LeetCode", key: "leetcodeUsername", width: 20 },
    { header: "GitHub", key: "githubUsername", width: 20 },
    { header: "Hackathons", key: "hackathonCount", width: 12 },
    { header: "Internships", key: "internshipCount", width: 12 },
    { header: "Courses", key: "courseCount", width: 12 },
    { header: "LeetCode Completed", key: "leetcodeCompletedCount", width: 18 },
    { header: "Impositions", key: "impositionCount", width: 12 },
  ];

  students.forEach((s) => {
    const hackathonRegs = s.registrations.filter((r) => r.eventType === "HACKATHON");
    const internshipRegs = s.registrations.filter((r) => r.eventType === "INTERNSHIP");
    const courseRegs = s.registrations.filter((r) => r.eventType === "COURSE");
    overview.addRow({
      username: s.username || "",
      email: s.email,
      year: s.year || "",
      leetcodeUsername: s.leetcodeUsername || "",
      githubUsername: s.githubUsername || "",
      hackathonCount: hackathonRegs.length,
      internshipCount: internshipRegs.length,
      courseCount: courseRegs.length,
      leetcodeCompletedCount: s.dailyCompletions.filter((c) => c.status === "COMPLETED").length,
      impositionCount: s.impositions.length,
    });
  });

  // Style header
  const headerRow = overview.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6D28D9" } };
  headerRow.alignment = { horizontal: "center" };

  // ── Sheet 2: Hackathon Registrations ─────────────────────
  const hackSheet = workbook.addWorksheet("Hackathon Registrations");
  hackSheet.columns = [
    { header: "Student", key: "student", width: 20 },
    { header: "Hackathon", key: "event", width: 30 },
    { header: "Registration Date", key: "date", width: 20 },
  ];
  students.forEach((s) => {
    s.registrations
      .filter((r) => r.eventType === "HACKATHON")
      .forEach((r) => {
        hackSheet.addRow({
          student: s.username || s.email,
          event: r.hackathon?.title || r.eventId,
          date: r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "",
        });
      });
  });

  // ── Sheet 3: Internship Registrations ────────────────────
  const internSheet = workbook.addWorksheet("Internship Registrations");
  internSheet.columns = [
    { header: "Student", key: "student", width: 20 },
    { header: "Internship", key: "event", width: 30 },
    { header: "Registration Date", key: "date", width: 20 },
  ];
  students.forEach((s) => {
    s.registrations
      .filter((r) => r.eventType === "INTERNSHIP")
      .forEach((r) => {
        internSheet.addRow({
          student: s.username || s.email,
          event: r.internship?.title || r.eventId,
          date: r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "",
        });
      });
  });

  // ── Sheet 4: Course Registrations ────────────────────────
  const courseSheet = workbook.addWorksheet("Course Registrations");
  courseSheet.columns = [
    { header: "Student", key: "student", width: 20 },
    { header: "Course", key: "event", width: 30 },
    { header: "Registration Date", key: "date", width: 20 },
  ];
  students.forEach((s) => {
    s.registrations
      .filter((r) => r.eventType === "COURSE")
      .forEach((r) => {
        courseSheet.addRow({
          student: s.username || s.email,
          event: r.course?.title || r.eventId,
          date: r.registeredAt ? new Date(r.registeredAt).toLocaleString() : "",
        });
      });
  });

  // ── Sheet 5: Impositions ─────────────────────────────────
  const impSheet = workbook.addWorksheet("Impositions");
  impSheet.columns = [
    { header: "Student", key: "student", width: 20 },
    { header: "Reason", key: "reason", width: 40 },
    { header: "Date", key: "date", width: 20 },
  ];
  students.forEach((s) => {
    s.impositions.forEach((imp) => {
      impSheet.addRow({
        student: s.username || s.email,
        reason: imp.reason,
        date: new Date(imp.imposedAt).toLocaleString(),
      });
    });
  });

  return workbook.xlsx.writeBuffer();
};

module.exports = { generateStudentsExcel };