const ExcelJS = require("exceljs");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");

/**
 * Fetch student data and generate an Excel report buffer.
 * All DB queries are done here, so the function takes no arguments.
 */
const generateStudentsExcel = async () => {
  // Fetch students plus basic relations; registrations do not directly include event objects.
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      dailyCompletions: { select: { status: true } },
      registrations: true,
      impositions: { select: { reason: true, imposedAt: true } },
    },
  });

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found");
  }

  const hackathonIds = [];
  const internshipIds = [];
  const courseIds = [];

  students.forEach((student) => {
    student.registrations.forEach((reg) => {
      if (reg.eventType === "HACKATHON") hackathonIds.push(reg.eventId);
      if (reg.eventType === "INTERNSHIP") internshipIds.push(reg.eventId);
      if (reg.eventType === "COURSE") courseIds.push(reg.eventId);
    });
  });

  const uniqueIds = (ids) => [...new Set(ids)];
  const [hackathons, internships, courses] = await Promise.all([
    uniqueIds(hackathonIds).length
      ? prisma.hackathon.findMany({ where: { id: { in: uniqueIds(hackathonIds) } } })
      : [],
    uniqueIds(internshipIds).length
      ? prisma.internship.findMany({ where: { id: { in: uniqueIds(internshipIds) } } })
      : [],
    uniqueIds(courseIds).length
      ? prisma.course.findMany({ where: { id: { in: uniqueIds(courseIds) } } })
      : [],
  ]);

  const eventMap = new Map([
    ...hackathons.map((h) => [h.id, h.title]),
    ...internships.map((i) => [i.id, i.title]),
    ...courses.map((c) => [c.id, c.title]),
  ]);

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
          event: eventMap.get(r.eventId) || r.eventId,
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
          event: eventMap.get(r.eventId) || r.eventId,
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
          event: eventMap.get(r.eventId) || r.eventId,
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