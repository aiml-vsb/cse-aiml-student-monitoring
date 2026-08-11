const { z } = require("zod");

const createDailyChallengeSchema = z.object({
  leetcodeNumber: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

const updateDailyChallengeSchema = z.object({
  leetcodeNumber: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return new Date(data.endTime) > new Date(data.startTime);
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

module.exports = { createDailyChallengeSchema, updateDailyChallengeSchema };