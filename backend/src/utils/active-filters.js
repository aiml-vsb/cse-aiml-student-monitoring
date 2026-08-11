/**
 * Shared Prisma "where" filters for items that have not yet ended.
 */

const activeHackathonWhere = (now = new Date()) => ({
  registrationEnd: { gt: now },
});

const activeInternshipWhere = (now = new Date()) => ({
  applicationEnd: { gt: now },
});

const activeCourseWhere = (now = new Date()) => ({
  courseEnd: { gt: now },
});

/** Task is active until its deadline passes (no endTime = always active). */
const activeTaskWhere = (now = new Date()) => ({
  OR: [{ endTime: null }, { endTime: { gte: now } }],
});

module.exports = {
  activeHackathonWhere,
  activeInternshipWhere,
  activeCourseWhere,
  activeTaskWhere,
};
