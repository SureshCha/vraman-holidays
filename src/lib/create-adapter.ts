/**
 * Dual-adapter factory: auto-detects PostgreSQL vs MariaDB from DATABASE_URL.
 * - postgresql://... → @prisma/adapter-pg   (Vercel / Neon / local dev)
 * - mysql://...      → @prisma/adapter-mariadb (cPanel production)
 *
 * Used by src/lib/db.ts (app runtime) and prisma/seed.ts + scripts (CLI).
 */
export function createAdapter() {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("mysql://") || url.startsWith("mariadb://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
    return new PrismaMariaDb(url);
  }

  // Default: PostgreSQL
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaPg({ connectionString: url });
}
