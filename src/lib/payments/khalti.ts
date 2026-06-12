import "server-only";
import type { PaymentGatewayAdapter, InitiateParams, InitiateResult, VerifyParams, VerifyResult } from "./types";

const isSandbox = process.env.PAYMENTS_MODE !== "production";

const KHALTI_BASE = isSandbox
  ? "https://dev.khalti.com/api/v2"
  : "https://khalti.com/api/v2";

function headers() {
  return {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY ?? ""}`,
    "Content-Type": "application/json",
  };
}

export class KhaltiAdapter implements PaymentGatewayAdapter {
  async initiate(params: InitiateParams): Promise<InitiateResult> {
    const res = await fetch(`${KHALTI_BASE}/epayment/initiate/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        return_url: params.returnUrl,
        website_url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        amount: params.amount, // in paisa
        purchase_order_id: params.bookingId,
        purchase_order_name: `Booking ${params.bookingId}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Khalti initiate failed: ${err}`);
    }

    const json = await res.json() as { payment_url: string; pidx: string };
    return { redirectUrl: json.payment_url };
  }

  async verify(params: VerifyParams): Promise<VerifyResult> {
    const pidx = params.rawQuery?.["pidx"] ?? params.gatewayRef;

    const res = await fetch(`${KHALTI_BASE}/epayment/lookup/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ pidx }),
    });

    const json = await res.json() as Record<string, unknown>;
    const success = json["status"] === "Completed";

    return {
      success,
      gatewayTxnId: (json["transaction_id"] as string) ?? pidx,
      amount: (json["total_amount"] as number) ?? 0,
      rawResponse: json,
    };
  }
}
