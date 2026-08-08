import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGateway } from "@/lib/payments";
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email/send";

// This is the connectIPS successURL, pre-registered as a static endpoint with
// the connectIPS integration support team. connectIPS appends only ?TXNID=...
// to it, so the booking must be recovered from our own PENDING PaymentTransaction
// row rather than from any other query param.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const txnId = searchParams.get("TXNID") ?? "";

  if (!txnId) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?reason=missing_txnid`);
  }

  const gateway = getGateway("IPS");
  const result = await gateway.verify({
    bookingId: "",
    gatewayRef: txnId,
    rawQuery: Object.fromEntries(searchParams.entries()),
  });

  if (!result.bookingId) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?reason=not_found`);
  }

  const booking = await db.booking.findUnique({ where: { id: result.bookingId } });
  if (!booking) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?reason=not_found`);
  }

  // Idempotent: connectIPS or the user's browser may hit this URL more than once.
  if (booking.status === "CONFIRMED") {
    return NextResponse.redirect(`${baseUrl}/booking/confirmation?ref=${booking.bookingRef}`);
  }

  if (!result.success || result.amount !== booking.totalAmount) {
    await db.paymentTransaction.updateMany({
      where: { gateway: "IPS", gatewayTxnId: txnId },
      data: { status: "FAILED", rawResponse: result.rawResponse as never },
    });
    const reason = !result.success ? "" : "&reason=amount_mismatch";
    return NextResponse.redirect(`${baseUrl}/booking/failed?ref=${booking.bookingRef}${reason}`);
  }

  await db.$transaction([
    db.paymentTransaction.updateMany({
      where: { gateway: "IPS", gatewayTxnId: txnId },
      data: { status: "SUCCESS", rawResponse: result.rawResponse as never },
    }),
    db.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    }),
  ]);

  sendBookingConfirmation(booking.id).catch(() => {});
  sendAdminNotification("booking", booking.id).catch(() => {});

  return NextResponse.redirect(`${baseUrl}/booking/confirmation?ref=${booking.bookingRef}`);
}
