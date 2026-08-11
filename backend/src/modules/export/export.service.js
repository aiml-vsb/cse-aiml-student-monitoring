const studentService = require("../student/student.service");
const excelService = require("../../services/excel.service");
const pptService = require("../../services/ppt.service");

const generateStudentExcel = async () => {
  const students = await studentService.getAllStudents();

  // Format for Excel
  const rows = students.map((s) => ({
    username: s.username || "N/A",
    email: s.email,
    year: s.year || "N/A",
    leetcodeUsername: s.leetcodeUsername || "N/A",
    githubUsername: s.githubUsername || "N/A",
    hackathonCount: s.hackathonCount,
    internshipCount: s.internshipCount,
    courseCount: s.courseCount,
    leetcodeCompletedCount: s.completedCount,
    impositionCount: s.imposition_count || 0,
    // Include registrations and impositions for detailed sheets
    hackathons: s.registrations?.filter((r) => r.eventType === "HACKATHON").map((r) => r.event?.title) || [],
    internships: s.registrations?.filter((r) => r.eventType === "INTERNSHIP").map((r) => r.event?.title) || [],
    courses: s.registrations?.filter((r) => r.eventType === "COURSE").map((r) => r.event?.title) || [],
    registeredAt: s.registrations?.map((r) => r.registeredAt) || [],
    impositions: s.impositions || [],
  }));

  return await excelService.generateStudentExcel(rows);
};

const generateStudentPPT = async () => {
  const analytics = await studentService.getStudentAnalytics();
  return await pptService.generateStudentPPT(analytics);
};

module.exports = { generateStudentExcel, generateStudentPPT };