import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// This is the connectIPS failureURL, pre-registered as a static endpoint with
// the connectIPS integration support team — reached when the user clicks
// "Return"/"Return to Creditor Site" or the transaction fails at connectIPS's
// end. Like ips/verify, only ?TXNID=... is appended, so the booking is
// recovered from our own PaymentTransaction row.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const txnId = searchParams.get("TXNID") ?? "";

  const transaction = txnId
    ? await db.paymentTransaction.findFirst({
        where: { gateway: "IPS", gatewayTxnId: txnId },
        orderBy: { createdAt: "desc" },
        include: { booking: true },
      })
    : null;

  if (!transaction) {
    return NextResponse.redirect(`${baseUrl}/booking/failed?reason=not_found`);
  }

  if (transaction.status === "PENDING") {
    await db.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.redirect(`${baseUrl}/booking/failed?ref=${transaction.booking.bookingRef}`);
}
