const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");
const { ADMIN_EMAIL } = require("../../config/env");
const {
  activeHackathonWhere,
  activeInternshipWhere,
  activeCourseWhere,
  activeTaskWhere,
} = require("../../utils/active-filters");

const DEFAULT_ADMIN_EMAIL = ADMIN_EMAIL;

const createAdmin = async ({ email, password, username }) => {
  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN",
      username: username || email.split("@")[0],
      profileComplete: true,
    },
  });

  const { password: _pw, ...safeAdmin } = admin;
  return safeAdmin;
};

const getAdmins = async () => {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return admins;
};

const deleteAdmin = async (adminId) => {
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== "ADMIN") {
    throw new ApiError(404, "Admin not found");
  }

  // Prevent deleting the default admin
  if (admin.email === DEFAULT_ADMIN_EMAIL) {
    throw new ApiError(400, "Default admin cannot be deleted");
  }

  // Prevent deleting yourself
  // (We'll check in controller by passing current user ID)
  await prisma.user.delete({ where: { id: adminId } });
  return { message: "Admin deleted" };
};

const getAdminStats = async () => {
  const now = new Date();

  const [
    totalStudents,
    totalAdmins,
    totalHackathons,
    totalInternships,
    totalCourses,
    totalImpositions,
    totalCompletions,
    totalRegistrations,
    totalTasks,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.hackathon.count({ where: activeHackathonWhere(now) }),
    prisma.internship.count({ where: activeInternshipWhere(now) }),
    prisma.course.count({ where: activeCourseWhere(now) }),
    prisma.imposition.count(),
    prisma.completion.count({ where: { status: "COMPLETED" } }),
    prisma.registration.count(),
    prisma.task.count({ where: activeTaskWhere(now) }),
  ]);

  return {
    totalStudents,
    totalAdmins,
    totalHackathons,
    totalInternships,
    totalCourses,
    totalImpositions,
    totalCompletions,
    totalRegistrations,
    totalTasks,
  };
};

module.exports = {
  createAdmin,
  getAdmins,
  deleteAdmin,
  getAdminStats,
};