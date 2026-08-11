const { z } = require("zod");

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  link: z.string().url(),
  previewImage: z.string().url().optional().nullable(),
  courseStart: z.string().datetime(),
  courseEnd: z.string().datetime(),
  benefit: z.string().optional().nullable(),
});

const updateCourseSchema = createCourseSchema.partial();

const registerSchema = z.object({});

module.exports = { createCourseSchema, updateCourseSchema, registerSchema };