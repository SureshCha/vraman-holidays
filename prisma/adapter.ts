/**
 * MariaDB adapter factory for seed.ts and scripts/.
 * Same logic as src/lib/create-adapter.ts.
 */
export function createAdapter() {
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  const url = process.env.DATABASE_URL!;
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

  if (isLocal) {
    return new PrismaMariaDb(url);
  }

  const parsed = new URL(url);
  return new PrismaMariaDb({
    host: parsed.hostname,
    port: parseInt(parsed.port || "3306"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace("/", ""),
    ssl: true,
    connectTimeout: 30000,
    socketTimeout: 60000,
    acquireTimeout: 30000,
    keepAliveDelay: 5000,
    idleTimeout: 0,
    minimumIdle: 1,
  });
}
