import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`bank-transfer:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const bookingId = body?.bookingId as string | undefined;

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Booking is not in PENDING status" }, { status: 409 });
  }

  // Check if a bank transfer transaction already exists for this booking
  const existing = await db.paymentTransaction.findFirst({
    where: { bookingId, gateway: "BANK_TRANSFER", status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ transactionId: existing.id });
  }

  const txn = await db.paymentTransaction.create({
    data: {
      bookingId,
      gateway: "BANK_TRANSFER",
      status: "PENDING",
      amount: booking.totalAmount,
      currency: booking.currency,
    },
  });

  return NextResponse.json({ transactionId: txn.id }, { status: 201 });
}
