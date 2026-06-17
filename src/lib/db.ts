import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/**
 * Lazy-initialized Prisma client for MariaDB/MySQL.
 *
 * When DATABASE_URL is not set (CI builds without DB), returns a no-op
 * proxy where every query resolves to an empty array (findMany) or null
 * (findUnique/findFirst). This lets `next build` complete without a
 * database — all pages render dynamically at runtime on cPanel.
 */

// Deep no-op proxy: any chain of property access returns itself,
// any function call returns Promise<[]> (safe for .map(), .length, etc.)
const NO_DB: unknown = new Proxy(function () {}, {
  get() { return NO_DB; },
  apply() { return Promise.resolve([]); },
});

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    if (!process.env.DATABASE_URL) {
      return NO_DB as PrismaClient;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getClient() as any)[prop];
  },
});
