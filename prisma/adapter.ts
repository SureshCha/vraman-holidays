/**
 * Shared dual-adapter factory for seed.ts and scripts/.
 * Mirrors src/lib/create-adapter.ts but uses relative imports (no @/ alias).
 */
export function createAdapter() {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("mysql://") || url.startsWith("mariadb://")) {
    const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
    return new PrismaMariaDb(url);
  }

  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaPg({ connectionString: url });
}
