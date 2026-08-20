import prisma from "../prisma_connection/prisma";

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully via Prisma");
    return true;
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    return false;
  }
  // no $disconnect() here — this is the shared client the whole app queries
  // with, so disconnecting it would kill every repository's connection.
}