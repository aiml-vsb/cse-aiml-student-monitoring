const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");

/**
 * Extract clean username from either plain input or full LeetCode URL.
 */
const extractLeetCodeUsername = (input) => {
  const str = (input || "").trim();
  if (!str) return "";

  if (str.includes("leetcode.com")) {
    try {
      const url = new URL(str.startsWith("http") ? str : `https://${str}`);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "u" && parts[1]) return parts[1];
      if (parts.length >= 1) return parts[parts.length - 1];
    } catch {
      return str;
    }
  }

  return str.replace(/^@/, "");
};

const extractGithubUsername = (input) => {
  const str = (input || "").trim();
  if (!str) return "";

  if (str.includes("github.com")) {
    try {
      const url = new URL(str.startsWith("http") ? str : `https://${str}`);
      const parts = url.pathname.split("/").filter(Boolean);
      return parts.length > 0 ? parts[0] : str;
    } catch {
      return str;
    }
  }

  return str.replace(/^@/, "");
};

const getMyProfile = async (studentId) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      dailyCompletions: true,
      registrations: true,
      impositions: true,
    },
  });

  if (!student) throw new ApiError(404, "Student not found");

  // Bulk fetch events instead of N sequential queries
  const hackathonIds = student.registrations.filter((r) => r.eventType === "HACKATHON").map((r) => r.eventId);
  const internshipIds = student.registrations.filter((r) => r.eventType === "INTERNSHIP").map((r) => r.eventId);
  const courseIds = student.registrations.filter((r) => r.eventType === "COURSE").map((r) => r.eventId);

  const [hackathons, internships, courses] = await Promise.all([
    hackathonIds.length ? prisma.hackathon.findMany({ where: { id: { in: hackathonIds } } }) : [],
    internshipIds.length ? prisma.internship.findMany({ where: { id: { in: internshipIds } } }) : [],
    courseIds.length ? prisma.course.findMany({ where: { id: { in: courseIds } } }) : [],
  ]);

  const eventMap = new Map([
    ...hackathons.map((h) => [h.id, h]),
    ...internships.map((i) => [i.id, i]),
    ...courses.map((c) => [c.id, c]),
  ]);

  const registrations = student.registrations.map((reg) => ({
    ...reg,
    event: eventMap.get(reg.eventId) || null,
  }));

  const { password, githubAccessToken, ...safeStudent } = student;
  return { ...safeStudent, hasPassword: !!password, registrations };
};

const updateMyProfile = async (studentId, payload) => {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) throw new ApiError(404, "Student not found");

  // Clean LeetCode username (support both username and full URL)
  if (payload.leetcodeUsername) {
    payload.leetcodeUsername = extractLeetCodeUsername(payload.leetcodeUsername);
  }

  if (payload.githubUsername) {
    payload.githubUsername = extractGithubUsername(payload.githubUsername);
  }

  // Check LeetCode username uniqueness
  if (payload.leetcodeUsername && payload.leetcodeUsername !== student.leetcodeUsername) {
    const existing = await prisma.user.findFirst({
      where: { leetcodeUsername: payload.leetcodeUsername },
    });
    if (existing && existing.id !== studentId) {
      throw new ApiError(409, "LeetCode username already linked to another account");
    }
  }

  // Check GitHub username uniqueness
  if (payload.githubUsername && payload.githubUsername !== student.githubUsername) {
    const existing = await prisma.user.findFirst({
      where: { githubUsername: payload.githubUsername },
    });
    if (existing && existing.id !== studentId) {
      throw new ApiError(409, "GitHub username already linked to another account");
    }
  }

  // Determine if profile is complete
  const finalUsername = payload.username || student.username;
  const finalYear = payload.year || student.year;
  const finalLeetcode = payload.leetcodeUsername || student.leetcodeUsername;
  const finalGithub = payload.githubUsername || student.githubUsername;

  const profileComplete = Boolean(
    finalUsername && finalYear && finalLeetcode && finalGithub
  );

  const data = {
    ...payload,
    profileComplete,
  };

  if (payload.password) {
    data.password = await bcrypt.hash(payload.password, 10);
  }

  delete data.confirmPassword;

  const updated = await prisma.user.update({
    where: { id: studentId },
    data,
  });

  const { password, githubAccessToken, ...safeStudent } = updated;
  return { ...safeStudent, hasPassword: !!password };
};

const getAllStudents = async () => {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      dailyCompletions: true,
      registrations: true,
      impositions: true,
    },
  });

  return students.map((student) => {
    const { password, githubAccessToken, ...safeStudent } = student;
    const completedCount = student.dailyCompletions.filter((c) => c.status === "COMPLETED").length;
    const hackathonCount = student.registrations.filter((r) => r.eventType === "HACKATHON").length;
    const internshipCount = student.registrations.filter((r) => r.eventType === "INTERNSHIP").length;
    const courseCount = student.registrations.filter((r) => r.eventType === "COURSE").length;
    return {
      ...safeStudent,
      hasPassword: !!password,
      completedCount,
      hackathonCount,
      internshipCount,
      courseCount,
      impositionCount: student.impositions.length,
    };
  });
};

const getStudentById = async (id) => {
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      dailyCompletions: true,
      registrations: true,
      impositions: true,
    },
  });

  if (!student) throw new ApiError(404, "Student not found");

  const { password, githubAccessToken, ...safeStudent } = student;
  return { ...safeStudent, hasPassword: !!password };
};

const updateStudentByAdmin = async (id, payload) => {
  const student = await prisma.user.findUnique({ where: { id } });
  if (!student || student.role !== "STUDENT") throw new ApiError(404, "Student not found");

  if (payload.leetcodeUsername) {
    payload.leetcodeUsername = extractLeetCodeUsername(payload.leetcodeUsername);
  }

  if (payload.githubUsername) {
    payload.githubUsername = extractGithubUsername(payload.githubUsername);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: payload,
  });

  const { password, githubAccessToken, ...safeStudent } = updated;
  return { ...safeStudent, hasPassword: !!password };
};

const deleteStudentByAdmin = async (id) => {
  const student = await prisma.user.findUnique({ where: { id } });
  if (!student || student.role !== "STUDENT") throw new ApiError(404, "Student not found");

  await prisma.completion.deleteMany({ where: { studentId: id } });
  await prisma.registration.deleteMany({ where: { studentId: id } });
  await prisma.imposition.deleteMany({ where: { studentId: id } });
  await prisma.user.delete({ where: { id } });

  return true;
};

const getStudentAnalytics = async () => {
  const students = await getAllStudents();

  const totalStudents = students.length;
  const hackathonRegistrations = students.reduce((s, stud) => s + (stud.hackathonCount || 0), 0);
  const internshipRegistrations = students.reduce((s, stud) => s + (stud.internshipCount || 0), 0);
  const courseRegistrations = students.reduce((s, stud) => s + (stud.courseCount || 0), 0);
  const leetcodeCompletions = students.reduce((s, stud) => s + (stud.completedCount || 0), 0);
  const impositionsCount = students.reduce((s, stud) => s + (stud.impositionCount || 0), 0);

  return {
    totalStudents,
    hackathonRegistrations,
    internshipRegistrations,
    courseRegistrations,
    leetcodeCompletions,
    impositionsCount,
    hackathonPercentage: totalStudents ? Math.round((hackathonRegistrations / totalStudents) * 100) : 0,
    internshipPercentage: totalStudents ? Math.round((internshipRegistrations / totalStudents) * 100) : 0,
    coursePercentage: totalStudents ? Math.round((courseRegistrations / totalStudents) * 100) : 0,
  };
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getStudentById,
  updateStudentByAdmin,
  deleteStudentByAdmin,
  getStudentAnalytics,
};
