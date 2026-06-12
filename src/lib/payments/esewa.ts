import "server-only";
import crypto from "crypto";
import type { PaymentGatewayAdapter, InitiateParams, InitiateResult, VerifyParams, VerifyResult } from "./types";

const isSandbox = process.env.PAYMENTS_MODE !== "production";

const ESEWA_FORM_URL = isSandbox
  ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
  : "https://epay.esewa.com.np/api/epay/main/v2/form";

const ESEWA_STATUS_URL = isSandbox
  ? "https://rc-epay.esewa.com.np/api/epay/transaction/status/"
  : "https://epay.esewa.com.np/api/epay/transaction/status/";

function sign(message: string): string {
  const secret = process.env.ESEWA_SECRET ?? "";
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

export class EsewaAdapter implements PaymentGatewayAdapter {
  async initiate(params: InitiateParams): Promise<InitiateResult> {
    const merchantCode = process.env.ESEWA_MERCHANT_CODE ?? "";
    const txnUuid = params.bookingId;
    const totalAmount = params.amount; // in paisa

    const message = `total_amount=${totalAmount},transaction_uuid=${txnUuid},product_code=${merchantCode}`;
    const signature = sign(message);

    const formData: Record<string, string> = {
      amount: String(totalAmount),
      tax_amount: "0",
      total_amount: String(totalAmount),
      transaction_uuid: txnUuid,
      product_code: merchantCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: params.returnUrl,
      failure_url: params.failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    return { formData, formAction: ESEWA_FORM_URL };
  }

  async verify(params: VerifyParams): Promise<VerifyResult> {
    const merchantCode = process.env.ESEWA_MERCHANT_CODE ?? "";

    // eSewa returns base64-encoded JSON in the `data` query param
    const rawData = params.rawQuery?.["data"] ?? "";
    let decoded: Record<string, string> = {};
    try {
      decoded = JSON.parse(Buffer.from(rawData, "base64").toString("utf8")) as Record<string, string>;
    } catch {
      return { success: false, gatewayTxnId: "", amount: 0, rawResponse: rawData };
    }

    // Server-side verification
    const url = new URL(ESEWA_STATUS_URL);
    url.searchParams.set("product_code", merchantCode);
    url.searchParams.set("total_amount", decoded["total_amount"] ?? "");
    url.searchParams.set("transaction_uuid", decoded["transaction_uuid"] ?? "");

    const res = await fetch(url.toString());
    const json = await res.json() as Record<string, unknown>;

    const success = json["status"] === "COMPLETE";
    const amount = parseInt(decoded["total_amount"] ?? "0");

    if (isNaN(amount)) {
      return { success: false, gatewayTxnId: "", amount: 0, rawResponse: json };
    }

    return {
      success,
      gatewayTxnId: (decoded["transaction_uuid"] as string) ?? "",
      amount,
      rawResponse: json,
    };
  }
}
