import "server-only";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import type { PaymentGatewayAdapter, InitiateParams, InitiateResult, VerifyParams, VerifyResult } from "./types";
import { signIpsMessage } from "./ips-sign";

// Lowest-precedence fallback only — reached when neither the admin Settings page
// nor the IPS_GATEWAY_URL/IPS_VALIDATION_URL env vars have a value set. The
// "production" URLs here are unconfirmed; the production cPanel host keeps the
// UAT env vars set explicitly so this branch is never exercised until go-live.
function defaultGatewayUrl(): string {
  return process.env.PAYMENTS_MODE !== "production"
    ? "https://uat.connectips.com/connectipswebgw/loginpage"
    : "https://connectips.com/connectipswebgw/loginpage";
}
function defaultValidationUrl(): string {
  return process.env.PAYMENTS_MODE !== "production"
    ? "https://uat.connectips.com/connectipswebws/api/creditor/validatetxn"
    : "https://connectips.com/connectipswebws/api/creditor/validatetxn";
}

function nonEmpty(value: string | undefined): string | undefined {
  return value && value.trim() !== "" ? value : undefined;
}

// Resolved fresh on every call (not a module-level const) so an admin edit on
// the Settings page takes effect immediately on the long-lived Passenger
// production process, without an app restart. Precedence: DB > env var > mode default.
async function resolveIpsConfig() {
  const settings = await getSettings();
  const dbIps = settings.paymentConfig.ips ?? {};
  return {
    merchantId: nonEmpty(dbIps.merchantId) ?? process.env.IPS_MERCHANT_ID,
    appId: nonEmpty(dbIps.appId) ?? process.env.IPS_APP_ID,
    appName: nonEmpty(dbIps.appName) ?? process.env.IPS_APP_NAME,
    gatewayUrl: nonEmpty(dbIps.gatewayUrl) ?? nonEmpty(process.env.IPS_GATEWAY_URL) ?? defaultGatewayUrl(),
    validationUrl: nonEmpty(dbIps.validationUrl) ?? nonEmpty(process.env.IPS_VALIDATION_URL) ?? defaultValidationUrl(),
  };
}

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`connectIPS is not configured: set ${name} (env var) or Admin → Settings → Payments`);
  return value;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`connectIPS is not configured: set ${name}`);
  return value;
}

function formatTxnDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${date.getFullYear()}`;
}

export class IpsAdapter implements PaymentGatewayAdapter {
  async initiate(params: InitiateParams): Promise<InitiateResult> {
    const cfg = await resolveIpsConfig();
    const merchantId = required(cfg.merchantId, "IPS_MERCHANT_ID");
    const appId = required(cfg.appId, "IPS_APP_ID");
    const appName = required(cfg.appName, "IPS_APP_NAME");

    // connectIPS requires a fresh, never-reused TXNID (<=20 chars) on every
    // login POST; a PENDING PaymentTransaction row is how we recover the
    // booking later, since connectIPS's redirect only ever echoes back TXNID.
    const txnId = nanoid(16);
    const reference = (params.bookingRef ?? params.bookingId).slice(0, 20);

    await db.paymentTransaction.create({
      data: {
        bookingId: params.bookingId,
        gateway: "IPS",
        status: "PENDING",
        amount: params.amount,
        currency: params.currency,
        gatewayTxnId: txnId,
      },
    });

    const fields = {
      MERCHANTID: merchantId,
      APPID: appId,
      APPNAME: appName,
      TXNID: txnId,
      TXNDATE: formatTxnDate(new Date()),
      TXNCRNCY: params.currency,
      TXNAMT: String(params.amount),
      REFERENCEID: reference,
      REMARKS: "Booking payment",
      PARTICULARS: `Booking payment ${reference}`.slice(0, 100),
    };

    const message = `MERCHANTID=${fields.MERCHANTID},APPID=${fields.APPID},APPNAME=${fields.APPNAME},TXNID=${fields.TXNID},TXNDATE=${fields.TXNDATE},TXNCRNCY=${fields.TXNCRNCY},TXNAMT=${fields.TXNAMT},REFERENCEID=${fields.REFERENCEID},REMARKS=${fields.REMARKS},PARTICULARS=${fields.PARTICULARS},TOKEN=TOKEN`;
    const token = signIpsMessage(message);

    return {
      formAction: cfg.gatewayUrl,
      formData: { ...fields, TOKEN: token },
    };
  }

  async verify(params: VerifyParams): Promise<VerifyResult> {
    const txnId = params.gatewayRef;
    if (!txnId) {
      return { success: false, gatewayTxnId: "", amount: 0, rawResponse: { note: "No TXNID was supplied" } };
    }

    const transaction = await db.paymentTransaction.findFirst({
      where: { gateway: "IPS", gatewayTxnId: txnId },
      orderBy: { createdAt: "desc" },
    });

    if (!transaction) {
      return { success: false, gatewayTxnId: txnId, amount: 0, rawResponse: { note: "No matching IPS transaction found for this TXNID" } };
    }

    const cfg = await resolveIpsConfig();
    const merchantId = required(cfg.merchantId, "IPS_MERCHANT_ID");
    const appId = required(cfg.appId, "IPS_APP_ID");
    // Basic-Auth password is a secret — always env-only, never routed through Settings.
    const password = requireEnv("IPS_BASIC_AUTH_PASSWORD");

    const message = `MERCHANTID=${merchantId},APPID=${appId},REFERENCEID=${txnId},TXNAMT=${transaction.amount}`;
    const token = signIpsMessage(message);

    try {
      const res = await fetch(cfg.validationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${appId}:${password}`).toString("base64")}`,
        },
        body: JSON.stringify({
          merchantId: Number(merchantId),
          appId,
          referenceId: txnId,
          txnAmt: transaction.amount,
          token,
        }),
      });

      const response = await res.json() as Record<string, unknown>;

      return {
        success: response?.status === "SUCCESS",
        gatewayTxnId: txnId,
        amount: transaction.amount,
        bookingId: transaction.bookingId,
        rawResponse: response,
      };
    } catch {
      return {
        success: false,
        gatewayTxnId: txnId,
        amount: transaction.amount,
        bookingId: transaction.bookingId,
        rawResponse: { note: "connectIPS validation request failed" },
      };
    }
  }
}
