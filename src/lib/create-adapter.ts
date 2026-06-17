/**
 * MariaDB/MySQL adapter factory.
 * Uses dynamic require to avoid crashing at build time when DATABASE_URL is not set.
 */
export function createAdapter() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  return new PrismaMariaDb(process.env.DATABASE_URL!);
}
