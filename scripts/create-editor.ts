import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { createAdapter } from "../prisma/adapter";
import bcrypt from "bcryptjs";


const db = new PrismaClient({ adapter: createAdapter() });

async function main() {
  const hash = await bcrypt.hash("VramanDemo2026!", 12);
  const user = await db.user.upsert({
    where: { email: "demo@vramanholidays.com" },
    update: { passwordHash: hash, role: "EDITOR" },
    create: {
      email: "demo@vramanholidays.com",
      name: "Demo Editor",
      passwordHash: hash,
      role: "EDITOR",
    },
  });
  console.log("Created:", user.email, user.role);

  const users = await db.user.findMany({ select: { email: true, name: true, role: true } });
  console.log("All users:", JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
