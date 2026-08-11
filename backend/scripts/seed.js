const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../src/config/env");

const prisma = new PrismaClient();

const seed = async () => {
  try {
    console.log("🌱 Seeding database...");

    // Check if default admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      console.log("ℹ️ Default admin already exists – skipping creation.");
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN",
        username: "admin",
        profileComplete: true,
      },
    });

    console.log("✅ Default admin created successfully!");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("⚠️  Please change this password after first login!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();