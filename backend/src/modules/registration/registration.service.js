const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");

const getMyRegistrations = async (studentId) => {
  const registrations = await prisma.registration.findMany({
    where: { studentId },
    orderBy: { registeredAt: "desc" },
  });

  const hackathonIds = registrations.filter((r) => r.eventType === "HACKATHON").map((r) => r.eventId);
  const internshipIds = registrations.filter((r) => r.eventType === "INTERNSHIP").map((r) => r.eventId);
  const courseIds = registrations.filter((r) => r.eventType === "COURSE").map((r) => r.eventId);

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

  return registrations.map((reg) => ({
    ...reg,
    event: eventMap.get(reg.eventId) || null,
  }));
};

const getRegistrationById = async (id) => {
  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { student: { select: { id: true, username: true, email: true } } },
  });
  if (!registration) throw new ApiError(404, "Registration not found");
  return registration;
};

const getAllRegistrations = async () => {
  const registrations = await prisma.registration.findMany({
    orderBy: { registeredAt: "desc" },
    include: {
      student: { select: { id: true, username: true, email: true, year: true } },
    },
  });
  return registrations;
};

const deleteRegistration = async (id, studentId) => {
  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) throw new ApiError(404, "Registration not found");

  if (registration.studentId !== studentId) {
    throw new ApiError(403, "You can only cancel your own registrations");
  }

  await prisma.registration.delete({ where: { id } });
  return { message: "Registration cancelled" };
};

module.exports = {
  getMyRegistrations,
  getRegistrationById,
  getAllRegistrations,
  deleteRegistration,
};