const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/api-error");

/**
 * Auto-mark missed tasks and create impositions.
 * Optimized: bulk queries instead of nested sequential loops.
 */
const reconcileMissedTasks = async () => {
  const now = new Date();

  const [tasks, students] = await Promise.all([
    prisma.task.findMany({ where: { endTime: { lt: now } }, select: { id: true, title: true } }),
    prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true } }),
  ]);

  if (!tasks.length || !students.length) return true;

  for (const task of tasks) {
    const reason = `Missed task: ${task.title}`;

    const [existingCompletions, existingImpositions] = await Promise.all([
      prisma.taskCompletion.findMany({
        where: { taskId: task.id },
        select: { studentId: true, status: true },
      }),
      prisma.imposition.findMany({
        where: { reason },
        select: { studentId: true },
      }),
    ]);

    const completedSet = new Map(existingCompletions.map((c) => [c.studentId, c.status]));
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

    if (completionsToUpsert.length > 0) {
      await Promise.all(
        completionsToUpsert.map((studentId) =>
          prisma.taskCompletion.upsert({
            where: { taskId_studentId: { taskId: task.id, studentId } },
            update: { status: "NOT_COMPLETED" },
            create: { taskId: task.id, studentId, status: "NOT_COMPLETED" },
          })
        )
      );
    }

    if (impositionsToCreate.length > 0) {
      await prisma.imposition.createMany({
        data: impositionsToCreate.map((studentId) => ({
          studentId,
          reason,
          description: `Did not complete the task "${task.title}" before deadline.`,
          isSent: false,
        })),
        skipDuplicates: true,
      });
    }
  }

  return true;
};

const createTask = async (adminId, data) => {
  if (!data.title || !data.description) throw new ApiError(400, "Title and description required");
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail || null,
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      createdBy: adminId,
    },
  });
};

const getAllTasks = async () => {
  await reconcileMissedTasks();
  return prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { completions: true },
  });
};

const getActiveTasks = async (studentId) => {
  await reconcileMissedTasks();

  const now = new Date();
  const tasks = await prisma.task.findMany({
    where: { startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { startTime: "desc" },
  });

  // Fetch all completions for this student in one query
  const completions = await prisma.taskCompletion.findMany({
    where: { studentId, taskId: { in: tasks.map((t) => t.id) } },
    select: { taskId: true, status: true, completedAt: true },
  });
  const completionMap = new Map(completions.map((c) => [c.taskId, c]));

  return tasks.map((task) => {
    const completion = completionMap.get(task.id);
    return {
      ...task,
      status: completion?.status || "PENDING",
      completedAt: completion?.completedAt || null,
    };
  });
};

const getMyTaskHistory = async (studentId) => {
  await reconcileMissedTasks();

  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });

  // Fetch all completions for this student in one query
  const completions = await prisma.taskCompletion.findMany({
    where: { studentId },
    select: { taskId: true, status: true, completedAt: true },
  });
  const completionMap = new Map(completions.map((c) => [c.taskId, c]));

  return tasks.map((task) => {
    const completion = completionMap.get(task.id);
    return {
      ...task,
      status: completion?.status || "NOT_COMPLETED",
      completedAt: completion?.completedAt || null,
    };
  });
};

const completeTask = async (studentId, taskId) => {
  await reconcileMissedTasks();

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new ApiError(404, "Task not found");

  if (task.endTime && new Date(task.endTime) < new Date()) {
    throw new ApiError(400, "Task deadline has passed");
  }

  const existing = await prisma.taskCompletion.findUnique({
    where: { taskId_studentId: { taskId, studentId } },
  });

  if (existing?.status === "COMPLETED") {
    throw new ApiError(409, "Task already completed");
  }

  const completion = await prisma.taskCompletion.upsert({
    where: { taskId_studentId: { taskId, studentId } },
    update: { status: "COMPLETED", completedAt: new Date() },
    create: { taskId, studentId, status: "COMPLETED", completedAt: new Date() },
  });

  return { message: "Task marked as completed", completion };
};

const getTaskById = async (id) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new ApiError(404, "Task not found");
  return task;
};

const updateTask = async (id, data) => {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Task not found");

  if (data.startTime) data.startTime = new Date(data.startTime);
  if (data.endTime) data.endTime = new Date(data.endTime);

  return prisma.task.update({ where: { id }, data });
};

const deleteTask = async (id) => {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Task not found");

  await prisma.taskCompletion.deleteMany({ where: { taskId: id } });
  await prisma.task.delete({ where: { id } });
  return true;
};

module.exports = {
  reconcileMissedTasks,
  createTask,
  getAllTasks,
  getActiveTasks,
  getMyTaskHistory,
  completeTask,
  getTaskById,
  updateTask,
  deleteTask,
};