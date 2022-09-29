import { PrismaClient } from "@prisma/client/edge";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
