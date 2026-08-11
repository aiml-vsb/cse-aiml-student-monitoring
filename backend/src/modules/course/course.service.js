const axios = require("axios");
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");

/**
 * Auto-detect preview image from link
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

const createCourse = async (payload, adminId) => {
  const { title, description, link, previewImage, courseStart, courseEnd, benefit } = payload;

  let finalPreview = previewImage;
  if (!finalPreview) {
    finalPreview = await fetchLinkPreview(link);
    if (!finalPreview) {
      throw new ApiError(400, "No preview detected for the link. Please provide a preview image URL.");
    }
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      link,
      previewImage: finalPreview,
      courseStart: new Date(courseStart),
      courseEnd: new Date(courseEnd),
      benefit,
      createdBy: adminId,
    },
  });

  return course;
};

const getActiveCourses = async () => {
  const now = new Date();
  const courses = await prisma.course.findMany({
    where: { courseEnd: { gt: now } },
    orderBy: { courseStart: "asc" },
  });
  return courses;
};

const getCourseById = async (id) => {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new ApiError(404, "Course not found");
  return course;
};

const updateCourse = async (id, payload, adminId) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Course not found");

  let finalPreview = payload.previewImage ?? existing.previewImage;
  if (payload.link && !finalPreview) {
    finalPreview = await fetchLinkPreview(payload.link);
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      ...payload,
      previewImage: finalPreview,
      createdBy: adminId,
    },
  });
  return updated;
};

const deleteCourse = async (id) => {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Course not found");

  await prisma.registration.deleteMany({
    where: { eventType: "COURSE", eventId: id },
  });

  await prisma.course.delete({ where: { id } });
  return { message: "Course deleted" };
};

const registerForCourse = async (courseId, studentId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new ApiError(404, "Course not found");

  const now = new Date();
  if (now > new Date(course.courseEnd)) {
    throw new ApiError(400, "Course enrollment has ended");
  }

  const existing = await prisma.registration.findUnique({
    where: {
      studentId_eventType_eventId: {
        studentId,
        eventType: "COURSE",
        eventId: courseId,
      },
    },
  });

  if (existing) {
    throw new ApiError(409, "You are already enrolled in this course");
  }

  const registration = await prisma.registration.create({
    data: { studentId, eventType: "COURSE", eventId: courseId },
  });

  return { message: "Successfully enrolled in course", registration };
};

const unregisterFromCourse = async (studentId, courseId) => {
  const registration = await prisma.registration.findFirst({
    where: { studentId, eventType: "COURSE", eventId: courseId },
  });
  if (!registration) throw new ApiError(404, "Registration not found");
  await prisma.registration.delete({ where: { id: registration.id } });
  return true;
};

module.exports = {
  fetchLinkPreview,
  createCourse,
  getActiveCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  registerForCourse,
  unregisterFromCourse,
};