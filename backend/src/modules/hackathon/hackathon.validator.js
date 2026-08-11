const { z } = require("zod");

const createHackathonSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  link: z.string().url(),
  previewImage: z.string().url().optional().nullable(),
  registrationStart: z.string().datetime(),
  registrationEnd: z.string().datetime(),
  price: z.number().min(0).default(0),
  isFree: z.boolean().default(true),
});

const updateHackathonSchema = createHackathonSchema.partial();

// For registration route – accept any body (or specific fields if needed)
const registerSchema = z.object({});

module.exports = { createHackathonSchema, updateHackathonSchema, registerSchema };