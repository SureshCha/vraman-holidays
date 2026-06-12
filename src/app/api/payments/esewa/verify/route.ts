import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGateway } from "@/lib/payments";
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email/send";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawData = searchParams.get("data") ?? "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Decode bookingId from eSewa's transaction_uuid
  let bookingId: string;
  try {
    const decoded = JSON.parse(Buffer.from(rawData, "base64").toString("utf8")) as Record<string, string>;
    bookingId = decoded["transaction_uuid"] ?? "";
  } catch {
    return NextResponse.redirect(`${baseUrl}/booking/failed?reason=invalid_response`);
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?reason=not_found`);
  }

  const gateway = getGateway("ESEWA");
  const result = await gateway.verify({
    bookingId,
    gatewayRef: bookingId,
    rawQuery: Object.fromEntries(searchParams.entries()),
  });

  if (!result.success) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?ref=${booking.bookingRef}`);
  }

  await db.$transaction([
    db.paymentTransaction.create({
      data: {
        bookingId,
        gateway: "ESEWA",
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

  // Fire-and-forget emails
  sendBookingConfirmation(bookingId).catch(() => {});
  sendAdminNotification("booking", bookingId).catch(() => {});

  return NextResponse.redirect(
    `${baseUrl}/booking/confirmation?ref=${booking.bookingRef}`
  );
}
