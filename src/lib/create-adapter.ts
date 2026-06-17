import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * MariaDB/MySQL adapter factory.
 * Reads DATABASE_URL from environment — must be a mysql:// connection string.
 */
export function createAdapter() {
  return new PrismaMariaDb(process.env.DATABASE_URL!);
}
