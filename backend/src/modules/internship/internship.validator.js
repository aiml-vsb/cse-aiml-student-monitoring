const { z } = require("zod");

const createInternshipSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  link: z.string().url(),
  previewImage: z.string().url().optional().nullable(),
  applicationStart: z.string().datetime(),
  applicationEnd: z.string().datetime(),
  duration: z.string().optional().nullable(),
  hasStipend: z.boolean(),
  stipendAmount: z.string().optional().nullable(),
});

const updateInternshipSchema = createInternshipSchema.partial();

const registerSchema = z.object({});

module.exports = { createInternshipSchema, updateInternshipSchema, registerSchema };