import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGateway } from "@/lib/payments";
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email/send";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pidx = searchParams.get("pidx") ?? "";
  const purchaseOrderId = searchParams.get("purchase_order_id") ?? "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const bookingId = purchaseOrderId;
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?reason=not_found`);
  }

  const gateway = getGateway("KHALTI");
  const result = await gateway.verify({
    bookingId,
    gatewayRef: pidx,
    rawQuery: Object.fromEntries(searchParams.entries()),
  });

  if (!result.success) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?ref=${booking.bookingRef}`);
  }

  await db.$transaction([
    db.paymentTransaction.create({
      data: {
        bookingId,
        gateway: "KHALTI",
        gatewayTxnId: result.gatewayTxnId,
        amount: result.amount,
        currency: booking.currency,
        status: "SUCCESS",
        rawResponse: result.rawResponse as never,
      },
    }),
    db.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  sendBookingConfirmation(bookingId).catch(() => {});
  sendAdminNotification("booking", bookingId).catch(() => {});

  return NextResponse.redirect(
    `${baseUrl}/booking/confirmation?ref=${booking.bookingRef}`
  );
}
