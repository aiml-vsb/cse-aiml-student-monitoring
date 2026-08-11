const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  thumbnail: z.string().url().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  thumbnail: z.string().url().optional().nullable(),
});

module.exports = { createTaskSchema, updateTaskSchema };