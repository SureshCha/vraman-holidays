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

  const gateway = getGateway("IPS");

  // connectIPS does not accept a per-request return/failure URL — it uses a
  // static pair pre-registered with the connectIPS integration support team,
  // and echoes back only TXNID, which is how ips/verify and ips/failure
  // recover this booking.
  const result = await gateway.initiate({
    bookingId,
    bookingRef: booking.bookingRef,
    amount: booking.totalAmount,
    currency: booking.currency,
  });

  return NextResponse.json(result);
}
