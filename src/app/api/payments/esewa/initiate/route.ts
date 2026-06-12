import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGateway } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json() as { bookingId: string };
  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== "PENDING") {
    return NextResponse.json({ error: "Booking not found or not pending" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const gateway = getGateway("ESEWA");

  const result = await gateway.initiate({
    bookingId,
    amount: booking.totalAmount,
    currency: booking.currency,
    returnUrl: `${baseUrl}/api/payments/esewa/verify`,
    failureUrl: `${baseUrl}/booking/failed?ref=${booking.bookingRef}`,
  });

  return NextResponse.json(result);
}
