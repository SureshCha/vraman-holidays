/**
 * Auto-detects database type for seed.ts and scripts/.
 * Same logic as src/lib/create-adapter.ts.
 */
export function createAdapter() {
  const url = process.env.DATABASE_URL!;

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    const { PrismaPg } = require("@prisma/adapter-pg");
    return new PrismaPg({ connectionString: url });
  }

  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  return new PrismaMariaDb(url);
}
