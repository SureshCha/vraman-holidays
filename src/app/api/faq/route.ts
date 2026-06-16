import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const [faqs, settings] = await Promise.all([
    db.faq.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { id: true, question: true, answer: true, category: true },
    }),
    getSettings(),
  ]);

  return NextResponse.json({
    faqs,
    whatsappNumber: settings.featureFlags.enableWhatsapp
      ? settings.contact.whatsappNumber
      : null,
    brandName: settings.brand.name,
  });
}
