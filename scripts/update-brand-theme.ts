import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { createAdapter } from "../prisma/adapter";

// Updates the SiteSettings theme to match the Vraman Holidays logo colors.
// Sky blue primary (matching logo) + warm gold accent + light blue tint secondary.
// Reads DATABASE_URL from .env (dev) or pass inline for prod.

const db = new PrismaClient({ adapter: createAdapter() });

const BRAND_THEME = {
  primaryColor: "oklch(0.55 0.24 225)",      // Vivid sky blue — punchy, logo-matched
  secondaryColor: "oklch(0.96 0.03 225)",    // Light blue tint — noticeably branded
  accentColor: "oklch(0.72 0.19 55)",        // Rich warm gold — strong contrast
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
