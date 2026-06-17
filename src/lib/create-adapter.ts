/**
 * MariaDB/MySQL adapter factory.
 * - Remote databases (TiDB Cloud): SSL + 30s connect timeout (cold start)
 * - Localhost (cPanel MariaDB): default fast settings
 */
export function createAdapter() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  const url = process.env.DATABASE_URL!;
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

  if (isLocal) {
    return new PrismaMariaDb(url);
  }

  // Remote: parse URL into config object for SSL + timeout control
  const parsed = new URL(url);
  return new PrismaMariaDb({
    host: parsed.hostname,
    port: parseInt(parsed.port || "3306"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace("/", ""),
    ssl: true,
    connectTimeout: 30000,
  });
}
