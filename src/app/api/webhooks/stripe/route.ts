import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body needed for signature verification
  const sig = req.headers.get("stripe-signature") ?? "";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-05-27.dahlia",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata["bookingId"];
    if (!bookingId) return NextResponse.json({ received: true });

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.status === "CONFIRMED") {
      return NextResponse.json({ received: true });
    }

    await db.$transaction([
      db.paymentTransaction.create({
        data: {
          bookingId,
          gateway: "STRIPE",
          gatewayTxnId: intent.id,
          amount: intent.amount,
          currency: intent.currency.toUpperCase(),
          status: "SUCCESS",
          rawResponse: intent as never,
        },
      }),
      db.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      }),
    ]);

    sendBookingConfirmation(bookingId).catch(() => {});
    sendAdminNotification("booking", bookingId).catch(() => {});
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata["bookingId"];
    if (bookingId) {
      await db.paymentTransaction.create({
        data: {
          bookingId,
          gateway: "STRIPE",
          gatewayTxnId: intent.id,
          amount: intent.amount,
          currency: intent.currency.toUpperCase(),
          status: "FAILED",
          rawResponse: intent as never,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
