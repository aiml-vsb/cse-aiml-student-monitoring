const { z } = require("zod");

const updateProfileSchema = z
  .object({
    username: z.string().min(3).optional(),
    year: z.string().min(1).optional(),
    leetcodeUsername: z.string().min(1).optional(),
    githubUsername: z.string().min(1).optional(),
    githubAccessToken: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
    confirmPassword: z.string().min(6).optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const updateStudentByAdminSchema = z.object({
  username: z.string().min(3).optional(),
  year: z.string().min(1).optional(),
  leetcodeUsername: z.string().min(1).optional(),
  githubUsername: z.string().min(1).optional(),
  profileComplete: z.boolean().optional(),
});

module.exports = { updateProfileSchema, updateStudentByAdminSchema };