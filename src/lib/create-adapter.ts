/**
 * Auto-detects database type from DATABASE_URL protocol:
 * - postgresql:// → Neon PostgreSQL (recommended for all environments)
 * - mysql://      → MariaDB/MySQL (cPanel fallback)
 */
export function createAdapter() {
  const url = process.env.DATABASE_URL!;

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    return new PrismaPg({ connectionString: url });
  }

  // MySQL/MariaDB
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

  const parsed = new URL(url);
  const base = {
    host: parsed.hostname,
    port: parseInt(parsed.port || "3306"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace("/", ""),
  };

  if (isLocal) {
    return new PrismaMariaDb({ ...base, connectionLimit: 5, idleTimeout: 30000 });
  }

  return new PrismaMariaDb({
    ...base,
    ssl: true,
    connectionLimit: 5,
    connectTimeout: 30000,
    socketTimeout: 60000,
    acquireTimeout: 30000,
    keepAliveDelay: 5000,
  });
}
