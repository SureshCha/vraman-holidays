import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Updates the From and Reply-to email addresses in SiteSettings.
// Usage: DATABASE_URL="<prod string>" npx tsx scripts/fix-email-settings.ts [mailbox]
// Defaults to info@vramanholidays.com.np.
const addr = process.argv[2] || "info@vramanholidays.com.np";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error("No SiteSettings row (id=1) found");

  const current = (settings.emailTemplates ?? {}) as Record<string, unknown>;
  const updated = { ...current, fromEmail: addr, replyTo: addr };

  await db.siteSettings.update({
    where: { id: 1 },
    data: { emailTemplates: updated as never },
  });
  console.log("✓ Updated emailTemplates.fromEmail and replyTo to:", addr);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
