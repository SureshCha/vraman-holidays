import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = (body?.code as string)?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const promo = await db.promoCode.findUnique({ where: { code } });

  if (!promo || promo.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  }

  const now = new Date();
  if (now < promo.validFrom || now > promo.validUntil) {
    return NextResponse.json({ error: "This code has expired" }, { status: 400 });
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 400 });
  }

  return NextResponse.json({
    code: promo.code,
    discountPercent: promo.discountPercent,
    discountFixed: promo.discountFixed,
    currency: promo.currency,
  });
}
