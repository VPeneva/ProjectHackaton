import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin already exists
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    });

    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin",
        role: "ADMIN"
      }
    });

    console.log("Admin user created successfully:", admin);

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
