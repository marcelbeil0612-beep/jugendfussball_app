import "server-only";

import { PrismaClient } from "@prisma/client";

process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";

const globalForPrisma = global as typeof global & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
