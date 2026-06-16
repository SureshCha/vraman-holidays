import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Updates the SiteSettings theme to match the Vraman Holidays logo colors.
// Sky blue primary (matching logo) + warm gold accent + light blue tint secondary.
// Reads DATABASE_URL from .env (dev) or pass inline for prod.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const BRAND_THEME = {
  primaryColor: "oklch(0.52 0.19 225)",      // Sky blue — matches the logo
  secondaryColor: "oklch(0.97 0.01 225)",    // Very light blue tint (not pure gray)
  accentColor: "oklch(0.70 0.16 60)",        // Warm gold — contrast accent
  fontFamily: "var(--font-geist-sans), sans-serif",
  borderRadius: "0.625rem",
};

async function main() {
  const host = (() => { try { return new URL(process.env.DATABASE_URL!).host; } catch { return "?"; } })();
  console.log("Updating theme on:", host);

  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error("No SiteSettings row (id=1) found");

  await db.siteSettings.update({
    where: { id: 1 },
    data: { theme: BRAND_THEME as never },
  });

  console.log("✓ Brand theme updated:");
  console.log("  Primary:", BRAND_THEME.primaryColor, "(sky blue — logo match)");
  console.log("  Secondary:", BRAND_THEME.secondaryColor, "(light blue tint)");
  console.log("  Accent:", BRAND_THEME.accentColor, "(warm gold)");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
