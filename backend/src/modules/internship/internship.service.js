const axios = require("axios");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");

/**
 * Auto-detect preview image from link (same logic as hackathon)
 */
const fetchLinkPreview = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = response.data;
    const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (match) return match[1];
    const matchAlt = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (matchAlt) return matchAlt[1];
    return null;
  } catch {
    return null;
  }
};

const createInternship = async (payload, adminId) => {
  const {
    title,
    description,
    link,
    previewImage,
    applicationStart,
    applicationEnd,
    duration,
    hasStipend,
    stipendAmount,
  } = payload;

  let finalPreview = previewImage;
  if (!finalPreview) {
    finalPreview = await fetchLinkPreview(link);
    if (!finalPreview) {
      throw new ApiError(400, "No preview detected for the link. Please provide a preview image URL.");
    }
  }

  const internship = await prisma.internship.create({
    data: {
      title,
      description,
      link,
      previewImage: finalPreview,
      applicationStart: new Date(applicationStart),
      applicationEnd: new Date(applicationEnd),
      duration,
      hasStipend: hasStipend ?? false,
      stipendAmount: hasStipend ? stipendAmount : null,
      createdBy: adminId,
    },
  });

  return internship;
};

const getActiveInternships = async () => {
  const now = new Date();
  const internships = await prisma.internship.findMany({
    where: { applicationEnd: { gt: now } },
    orderBy: { applicationStart: "asc" },
  });
  return internships;
};

const getInternshipById = async (id) => {
  const internship = await prisma.internship.findUnique({ where: { id } });
  if (!internship) throw new ApiError(404, "Internship not found");
  return internship;
};

const updateInternship = async (id, payload, adminId) => {
  const existing = await prisma.internship.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Internship not found");

  let finalPreview = payload.previewImage ?? existing.previewImage;
  if (payload.link && !finalPreview) {
    finalPreview = await fetchLinkPreview(payload.link);
  }

  const updated = await prisma.internship.update({
    where: { id },
    data: {
      ...payload,
      previewImage: finalPreview,
      hasStipend: payload.hasStipend ?? existing.hasStipend,
      stipendAmount: payload.hasStipend ? payload.stipendAmount : null,
      createdBy: adminId,
    },
  });
  return updated;
};

const deleteInternship = async (id) => {
  const existing = await prisma.internship.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Internship not found");

  await prisma.registration.deleteMany({
    where: { eventType: "INTERNSHIP", eventId: id },
  });

  await prisma.internship.delete({ where: { id } });
  return { message: "Internship deleted" };
};

const registerForInternship = async (internshipId, studentId) => {
  const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
  if (!internship) throw new ApiError(404, "Internship not found");

  const now = new Date();
  if (now > new Date(internship.applicationEnd)) {
    throw new ApiError(400, "Application deadline has passed");
  }

  const existing = await prisma.registration.findUnique({
    where: {
      studentId_eventType_eventId: {
        studentId,
        eventType: "INTERNSHIP",
        eventId: internshipId,
      },
    },
  });

  if (existing) {
    throw new ApiError(409, "You are already registered for this internship");
  }

  const registration = await prisma.registration.create({
    data: { studentId, eventType: "INTERNSHIP", eventId: internshipId },
  });

  return { message: "Successfully registered for internship", registration };
};

const unregisterFromInternship = async (studentId, internshipId) => {
  const registration = await prisma.registration.findFirst({
    where: { studentId, eventType: "INTERNSHIP", eventId: internshipId },
  });
  if (!registration) throw new ApiError(404, "Registration not found");
  await prisma.registration.delete({ where: { id: registration.id } });
  return true;
};

module.exports = {
  fetchLinkPreview,
  createInternship,
  getActiveInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  registerForInternship,
  unregisterFromInternship,
};