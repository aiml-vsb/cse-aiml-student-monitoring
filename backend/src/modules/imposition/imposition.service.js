const prisma = require("../../lib/prisma");
const mailService = require("../../services/mail.service");
const ApiError = require("../../utils/api-error");

const createImposition = async ({ studentId, reason, description }, adminId) => {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) throw new ApiError(404, "Student not found");
  if (student.role !== "STUDENT") throw new ApiError(400, "User is not a student");

  const imposition = await prisma.imposition.create({
    data: {
      studentId,
      reason,
      description,
    },
  });

  return imposition;
};

const getMyImpositions = async (studentId) => {
  const impositions = await prisma.imposition.findMany({
    where: { studentId },
    orderBy: { imposedAt: "desc" },
  });
  return impositions;
};

const getAllImpositions = async () => {
  const impositions = await prisma.imposition.findMany({
    orderBy: { imposedAt: "desc" },
    include: { student: { select: { id: true, username: true, email: true } } },
  });
  return impositions;
};

const sendImpositionEmail = async (impositionId) => {
  const imposition = await prisma.imposition.findUnique({
    where: { id: impositionId },
    include: { student: { select: { email: true, username: true } } },
  });

  if (!imposition) throw new ApiError(404, "Imposition not found");
  if (imposition.isSent) {
    throw new ApiError(400, "Email already sent for this imposition");
  }

  await mailService.sendImpositionEmail({
    to: imposition.student.email,
    studentName: imposition.student.username || "Student",
    reason: imposition.reason,
    description: imposition.description,
  });

  await prisma.imposition.update({
    where: { id: impositionId },
    data: { isSent: true },
  });

  return { message: "Imposition email sent successfully" };
};

module.exports = {
  createImposition,
  getMyImpositions,
  getAllImpositions,
  sendImpositionEmail,
};