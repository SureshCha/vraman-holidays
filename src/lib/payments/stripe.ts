import "server-only";
import Stripe from "stripe";
import type { PaymentGatewayAdapter, InitiateParams, InitiateResult, VerifyParams, VerifyResult } from "./types";

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-05-27.dahlia",
  });
}

export class StripeAdapter implements PaymentGatewayAdapter {
  async initiate(params: InitiateParams): Promise<InitiateResult> {
    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      metadata: { bookingId: params.bookingId },
    });

    return { clientSecret: paymentIntent.client_secret ?? undefined };
  }

  async verify(params: VerifyParams): Promise<VerifyResult> {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(params.gatewayRef);

    return {
      success: paymentIntent.status === "succeeded",
      gatewayTxnId: paymentIntent.id,
      amount: paymentIntent.amount,
      rawResponse: paymentIntent,
    };
  }
}
