// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function checkDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully via Prisma");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
  } finally {
    await prisma.$disconnect();
  }
}