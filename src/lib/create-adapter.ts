/**
 * MariaDB/MySQL adapter factory.
 * - Localhost (cPanel): small pool (2 connections) for shared hosting limits
 * - Remote (TiDB Cloud): SSL + generous timeouts for serverless cold starts
 */
export function createAdapter() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
  const url = process.env.DATABASE_URL!;
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

  if (isLocal) {
    // Shared hosting: strict connection limits (often 10-15 per user)
    const parsed = new URL(url);
    return new PrismaMariaDb({
      host: parsed.hostname,
      port: parseInt(parsed.port || "3306"),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace("/", ""),
      connectionLimit: 2,
      idleTimeout: 30000,
    });
  }

  // Remote: SSL + robust timeouts for TiDB serverless cold starts
  const parsed = new URL(url);
  return new PrismaMariaDb({
    host: parsed.hostname,
    port: parseInt(parsed.port || "3306"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace("/", ""),
    ssl: true,
    connectionLimit: 5,
    connectTimeout: 30000,
    socketTimeout: 60000,
    acquireTimeout: 30000,
    keepAliveDelay: 5000,
  });
}
