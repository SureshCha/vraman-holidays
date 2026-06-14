import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { checkPromoUsable, computeDiscount } from "@/lib/promo";

/**
 * Applies a promo code to a PENDING booking: validates the code, reserves one
 * use (respecting maxUses) and writes the discounted total onto the booking —
 * all atomically. The payment gateways read booking.totalAmount, so the
 * discount is what the customer is actually charged.
 */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`promo:${clientIp(req)}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const bookingId = (body?.bookingId as string | undefined)?.trim();
  const code = (body?.code as string | undefined)?.trim().toUpperCase();
  if (!bookingId || !code) {
    return NextResponse.json({ error: "Booking and code are required" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "This booking can no longer be modified" }, { status: 409 });
  }
  if (booking.promoCodeId) {
    return NextResponse.json({ error: "A promo code is already applied to this booking" }, { status: 409 });
  }

  const promo = await db.promoCode.findUnique({ where: { code } });
  if (!promo) return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });

  const usable = checkPromoUsable(promo, new Date());
  if (!usable.ok) return NextResponse.json({ error: usable.error }, { status: 400 });

  // booking.totalAmount is the un-discounted base (double application is blocked above).
  const discount = computeDiscount(promo, booking.totalAmount);
  if (discount <= 0) {
    return NextResponse.json({ error: "This code does not apply to your booking" }, { status: 400 });
  }
  const newTotal = booking.totalAmount - discount;

  try {
    const applied = await db.$transaction(async (tx) => {
      // Reserve a use atomically; the usedCount guard makes concurrent redemptions safe.
      const reserved = await tx.promoCode.updateMany({
        where: {
          id: promo.id,
          ...(promo.maxUses != null ? { usedCount: { lt: promo.maxUses } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (reserved.count === 0) throw new Error("USAGE_LIMIT");

      // Re-check booking state inside the transaction to avoid a TOCTOU race.
      const updated = await tx.booking.updateMany({
        where: { id: booking.id, status: "PENDING", promoCodeId: null },
        data: { totalAmount: newTotal, discountAmount: discount, promoCodeId: promo.id },
      });
      if (updated.count === 0) throw new Error("BOOKING_STATE");
      return true;
    });
    if (!applied) throw new Error("BOOKING_STATE");
  } catch (e) {
    const msg = e instanceof Error && e.message === "USAGE_LIMIT"
      ? "This code has reached its usage limit"
      : "This booking can no longer be modified";
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  return NextResponse.json({
    code: promo.code,
    discountAmount: discount,
    totalAmount: newTotal,
    currency: booking.currency,
  });
}
