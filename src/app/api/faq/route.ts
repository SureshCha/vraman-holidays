import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!checkRateLimit(`faq:${clientIp(req)}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const [faqs, settings] = await Promise.all([
    db.faq.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { id: true, question: true, answer: true, category: true },
    }),
    getSettings(),
  ]);

  return NextResponse.json(
    {
      faqs,
      whatsappNumber: settings.featureFlags.enableWhatsapp
        ? settings.contact.whatsappNumber
        : null,
      brandName: settings.brand.name,
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" } },
  );
}
