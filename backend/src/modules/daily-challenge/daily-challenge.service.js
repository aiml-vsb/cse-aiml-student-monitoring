const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");
const leetcodeService = require("../../services/leetcode.service");

/**
 * Auto-mark missed challenges and create impositions.
 * Optimized: single query per challenge using bulk upsert pattern.
 */
const reconcileMissedCompletions = async () => {
  const now = new Date();

  const [challenges, students] = await Promise.all([
    prisma.dailyChallenge.findMany({ where: { endTime: { lt: now } } }),
    prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true } }),
  ]);

  if (!challenges.length || !students.length) return true;

  for (const challenge of challenges) {
    // Get all existing completions for this challenge in one query
    const existingCompletions = await prisma.completion.findMany({
      where: { challengeId: challenge.id },
      select: { studentId: true, status: true },
    });
    const completedSet = new Map(existingCompletions.map((c) => [c.studentId, c.status]));

    // Get existing impositions for this challenge in one query
    const reason = `Missed LeetCode Challenge #${challenge.leetcodeNumber}`;
    const existingImpositions = await prisma.imposition.findMany({
      where: { reason },
      select: { studentId: true },
    });
    const imposedSet = new Set(existingImpositions.map((i) => i.studentId));

    const completionsToUpsert = [];
    const impositionsToCreate = [];

    for (const student of students) {
      const status = completedSet.get(student.id);
      if (!status || status === "PENDING") {
        completionsToUpsert.push(student.id);
      }
      if (!imposedSet.has(student.id) && status !== "COMPLETED") {
        impositionsToCreate.push(student.id);
      }
    }

    // Bulk upsert completions
    if (completionsToUpsert.length > 0) {
      await Promise.all(
        completionsToUpsert.map((studentId) =>
          prisma.completion.upsert({
            where: { studentId_challengeId: { studentId, challengeId: challenge.id } },
            update: { status: "NOT_COMPLETED" },
            create: { studentId, challengeId: challenge.id, status: "NOT_COMPLETED" },
          })
        )
      );
    }

    // Bulk create impositions
    if (impositionsToCreate.length > 0) {
      await prisma.imposition.createMany({
        data: impositionsToCreate.map((studentId) => ({
          studentId,
          reason,
          description: `Did not complete ${challenge.leetcodeTitle} (Problem #${challenge.leetcodeNumber}) before deadline.`,
          isSent: false,
        })),
        skipDuplicates: true,
      });
    }
  }

  return true;
};

const createDailyChallenge = async (adminId, { leetcodeNumber, startTime, endTime }) => {
  const problem = await leetcodeService.getProblem(leetcodeNumber);

  const challenge = await prisma.dailyChallenge.create({
    data: {
      leetcodeNumber,
      leetcodeTitle: problem.title,
      leetcodeSlug: problem.slug,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: adminId,
    },
  });
  return challenge;
};

const getActiveChallenge = async (studentId) => {
  await reconcileMissedCompletions();

  const now = new Date();
  const challenge = await prisma.dailyChallenge.findFirst({
    where: { startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { startTime: "desc" },
  });

  if (!challenge) return { active: false, message: "No active challenge right now" };

  const completion = await prisma.completion.findUnique({
    where: { studentId_challengeId: { studentId, challengeId: challenge.id } },
  });

  return {
    active: true,
    challenge,
    status: completion?.status || "PENDING",
    completedAt: completion?.completedAt || null,
    language: completion?.language || null,
  };
};

const getAllChallenges = async (studentId) => {
  await reconcileMissedCompletions();

  const challenges = await prisma.dailyChallenge.findMany({
    orderBy: { startTime: "desc" },
  });

  // Fetch all completions for this student in one query
  const completions = await prisma.completion.findMany({
    where: { studentId },
    select: { challengeId: true, status: true, language: true },
  });
  const completionMap = new Map(completions.map((c) => [c.challengeId, c]));

  return challenges.map((challenge) => {
    const completion = completionMap.get(challenge.id);
    return {
      ...challenge,
      status: completion?.status || "NOT_COMPLETED",
      language: completion?.language || null,
    };
  });
};

/**
 * MARK AS COMPLETED – WITH STRICT LEETCODE VERIFICATION
 */
const completeChallenge = async (studentId) => {
  await reconcileMissedCompletions();

  const now = new Date();
  const challenge = await prisma.dailyChallenge.findFirst({
    where: { startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { startTime: "desc" },
  });

  if (!challenge) throw new ApiError(404, "No active challenge found");

  const [existing, student] = await Promise.all([
    prisma.completion.findUnique({
      where: { studentId_challengeId: { studentId, challengeId: challenge.id } },
    }),
    prisma.user.findUnique({ where: { id: studentId }, select: { leetcodeUsername: true } }),
  ]);

  if (existing?.status === "COMPLETED") {
    throw new ApiError(409, "Challenge already completed");
  }

  if (!student?.leetcodeUsername) {
    throw new ApiError(400, "LeetCode username not linked. Please update your profile first.");
  }

  const verification = await leetcodeService.verifySubmission(
    student.leetcodeUsername,
    challenge.leetcodeNumber
  );

  if (!verification.verified) {
    throw new ApiError(400, verification.error);
  }

  const completion = await prisma.completion.upsert({
    where: { studentId_challengeId: { studentId, challengeId: challenge.id } },
    update: { status: "COMPLETED", completedAt: now, language: verification.language },
    create: {
      studentId,
      challengeId: challenge.id,
      status: "COMPLETED",
      completedAt: now,
      language: verification.language,
    },
  });

  return { message: "Challenge completed successfully", completion };
};

const getChallengeStats = async () => {
  await reconcileMissedCompletions();

  const challenges = await prisma.dailyChallenge.findMany({
    orderBy: { startTime: "desc" },
    include: { completions: { select: { status: true } } },
  });

  return challenges.map((challenge) => ({
    id: challenge.id,
    leetcodeNumber: challenge.leetcodeNumber,
    leetcodeTitle: challenge.leetcodeTitle,
    startTime: challenge.startTime,
    endTime: challenge.endTime,
    totalCompletions: challenge.completions.filter((c) => c.status === "COMPLETED").length,
    totalNotCompleted: challenge.completions.filter((c) => c.status === "NOT_COMPLETED").length,
    totalPending: challenge.completions.filter((c) => c.status === "PENDING").length,
  }));
};

const updateDailyChallenge = async (id, payload) => {
  const existing = await prisma.dailyChallenge.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Challenge not found");

  if (payload.leetcodeNumber && payload.leetcodeNumber !== existing.leetcodeNumber) {
    const problem = await leetcodeService.getProblem(payload.leetcodeNumber);
    payload.leetcodeTitle = problem.title;
    payload.leetcodeSlug = problem.slug;
  }

  if (payload.startTime) payload.startTime = new Date(payload.startTime);
  if (payload.endTime) payload.endTime = new Date(payload.endTime);

  return prisma.dailyChallenge.update({ where: { id }, data: payload });
};

const deleteDailyChallenge = async (id) => {
  const existing = await prisma.dailyChallenge.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Challenge not found");

  await prisma.completion.deleteMany({ where: { challengeId: id } });
  await prisma.dailyChallenge.delete({ where: { id } });
  return true;
};

module.exports = {
  createDailyChallenge,
  getActiveChallenge,
  getAllChallenges,
  completeChallenge,
  getChallengeStats,
  updateDailyChallenge,
  deleteDailyChallenge,
  reconcileMissedCompletions,
};