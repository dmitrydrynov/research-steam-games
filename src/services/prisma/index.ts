import { PrismaClient } from "@prisma/client";
import gameEmbedding from "./extensions/game-embedding";

const extendedPrismaClient = () => {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.POSTGRES_URL,
    log: process.env.DEBUG ? ["query", "error"] : ["error"],
    errorFormat: "pretty",
  });

  const extendedPrisma = prisma.$extends(gameEmbedding);

  return extendedPrisma;
};

export type ExtendedPrismaClient = ReturnType<typeof extendedPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? extendedPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
