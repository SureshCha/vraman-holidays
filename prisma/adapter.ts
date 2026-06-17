/**
 * MariaDB adapter factory for seed.ts and scripts/.
 */
export function createAdapter() {
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  return new PrismaMariaDb(process.env.DATABASE_URL!);
}
