const { z } = require("zod");

const createImpositionSchema = z.object({
  studentId: z.string().cuid("Invalid student ID"),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  description: z.string().optional().nullable(),
});

module.exports = { createImpositionSchema };