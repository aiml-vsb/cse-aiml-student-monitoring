const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Optional: log slow queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    if (duration > 200) {
      console.warn(`⚠️ Slow query (${duration}ms): ${params.model}.${params.action}`);
    }
    return result;
  });
}

module.exports = prisma;