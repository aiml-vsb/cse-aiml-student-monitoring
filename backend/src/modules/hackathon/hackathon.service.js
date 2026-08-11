const axios = require("axios");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");

/**
 * Attempt to auto-detect a preview image from a URL (Open Graph).
 * @param {string} url
 * @returns {Promise<string|null>}
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

/**
 * Create a hackathon (admin only)
 */
const createHackathon = async (payload, adminId) => {
  const { title, description, link, previewImage, registrationStart, registrationEnd, price, isFree } = payload;

  let finalPreview = previewImage;

  // If no preview image given, try to auto-detect from link
  if (!finalPreview) {
    finalPreview = await fetchLinkPreview(link);
    if (!finalPreview) {
      throw new ApiError(400, "No preview detected for the link. Please provide a preview image URL.");
    }
  }

  const hackathon = await prisma.hackathon.create({
    data: {
      title,
      description,
      link,
      previewImage: finalPreview,
      registrationStart: new Date(registrationStart),
      registrationEnd: new Date(registrationEnd),
      price: price || 0,
      isFree: isFree ?? price === 0,
      createdBy: adminId,
    },
  });

  return hackathon;
};

/**
 * Get all hackathons that are NOT expired (registrationEnd > now)
 */
const getActiveHackathons = async () => {
  const now = new Date();
  const hackathons = await prisma.hackathon.findMany({
    where: {
      registrationEnd: { gt: now },
    },
    orderBy: { registrationStart: "asc" },
  });
  return hackathons;
};

/**
 * Get a single hackathon by ID (even if expired, for admin)
 */
const getHackathonById = async (id) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) throw new ApiError(404, "Hackathon not found");
  return hackathon;
};

/**
 * Update a hackathon (admin only)
 */
const updateHackathon = async (id, payload, adminId) => {
  const existing = await prisma.hackathon.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Hackathon not found");

  let finalPreview = payload.previewImage ?? existing.previewImage;
  if (payload.link && !finalPreview) {
    finalPreview = await fetchLinkPreview(payload.link);
  }

  const updated = await prisma.hackathon.update({
    where: { id },
    data: {
      ...payload,
      previewImage: finalPreview,
      createdBy: adminId,
    },
  });
  return updated;
};

/**
 * Delete a hackathon (admin only)
 */
const deleteHackathon = async (id) => {
  const existing = await prisma.hackathon.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Hackathon not found");

  // Delete registrations first
  await prisma.registration.deleteMany({
    where: { eventType: "HACKATHON", eventId: id },
  });

  await prisma.hackathon.delete({ where: { id } });
  return { message: "Hackathon deleted" };
};

/**
 * Register a student for a hackathon
 */
const registerForHackathon = async (hackathonId, studentId) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) throw new ApiError(404, "Hackathon not found");

  const now = new Date();
  if (now > new Date(hackathon.registrationEnd)) {
    throw new ApiError(400, "Registration has closed for this hackathon");
  }

  // Check if already registered
  const existing = await prisma.registration.findUnique({
    where: {
      studentId_eventType_eventId: {
        studentId,
        eventType: "HACKATHON",
        eventId: hackathonId,
      },
    },
  });

  if (existing) {
    throw new ApiError(409, "You are already registered for this hackathon");
  }

  const registration = await prisma.registration.create({
    data: {
      studentId,
      eventType: "HACKATHON",
      eventId: hackathonId,
    },
  });

  return { message: "Successfully registered for hackathon", registration };
};
const unregisterFromHackathon = async (studentId, hackathonId) => {
  const registration = await prisma.registration.findFirst({
    where: { studentId, eventType: "HACKATHON", eventId: hackathonId },
  });
  if (!registration) throw new ApiError(404, "Registration not found");
  await prisma.registration.delete({ where: { id: registration.id } });
  return true;
};

module.exports = {
  fetchLinkPreview,
  createHackathon,
  getActiveHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  registerForHackathon,
  unregisterFromHackathon,
};