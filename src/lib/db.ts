import { PrismaClient } from "@/generated/prisma/client";
import { createAdapter } from "./create-adapter";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
