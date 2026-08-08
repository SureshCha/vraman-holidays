import { config } from "dotenv";
config();

import fs from "node:fs";
import crypto from "node:crypto";
import forge from "node-forge";

// Standalone sanity check for the connectIPS signing + validatetxn wiring,
// run against the UAT sandbox before trusting it inside the full booking
// flow. Requires IPS_MERCHANT_ID, IPS_APP_ID, IPS_BASIC_AUTH_PASSWORD, and
// either IPS_PFX_PATH or IPS_PFX_BASE64 + IPS_PFX_PASSWORD to be set (in
// .env, or the environment). Run with: npx tsx scripts/check-connectips.ts
//
// This duplicates (rather than imports) the extraction logic in
// src/lib/payments/ips-sign.ts, because that module is guarded with
// `import "server-only"`, which unconditionally throws outside of Next's
// bundler (it relies on Next swapping in a no-op at build time).

function signIpsMessage(message: string): string {
  const base64Pfx = process.env.IPS_PFX_BASE64;
  const pfxPath = process.env.IPS_PFX_PATH;
  const passphrase = process.env.IPS_PFX_PASSWORD;
  if (!passphrase) throw new Error("Set IPS_PFX_PASSWORD");
  const pfxBuffer = base64Pfx ? Buffer.from(base64Pfx, "base64") : pfxPath ? fs.readFileSync(pfxPath) : null;
  if (!pfxBuffer) throw new Error("Set IPS_PFX_PATH or IPS_PFX_BASE64");

  const asn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer.toString("binary")));
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, passphrase);
  const pkcs8ShroudedKeyBagOid = forge.pki.oids.pkcs8ShroudedKeyBag as string;
  const keyBagOid = forge.pki.oids.keyBag as string;
  const keyBags = p12.getBags({ bagType: pkcs8ShroudedKeyBagOid })[pkcs8ShroudedKeyBagOid]
    ?? p12.getBags({ bagType: keyBagOid })[keyBagOid];
  const privateKey = keyBags?.[0]?.key;
  if (!privateKey) throw new Error("Could not find a private key inside the pfx");

  const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
  return crypto.createSign("RSA-SHA256").update(message, "utf8").sign(privateKeyPem, "base64");
}

async function main() {
  const merchantId = process.env.IPS_MERCHANT_ID;
  const appId = process.env.IPS_APP_ID;
  const appName = process.env.IPS_APP_NAME ?? "Test Merchant";
  const basicAuthPassword = process.env.IPS_BASIC_AUTH_PASSWORD;
  const validationUrl = process.env.IPS_VALIDATION_URL ?? "https://uat.connectips.com/connectipswebws/api/creditor/validatetxn";

  if (!merchantId || !appId || !basicAuthPassword) {
    console.error("Set IPS_MERCHANT_ID, IPS_APP_ID, IPS_BASIC_AUTH_PASSWORD (and IPS_PFX_PATH/IPS_PFX_BASE64 + IPS_PFX_PASSWORD) before running this script.");
    process.exit(1);
  }

  const txnId = `chk${Date.now().toString(36)}`.slice(0, 20);
  const now = new Date();
  const txnDate = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

  const loginMessage = `MERCHANTID=${merchantId},APPID=${appId},APPNAME=${appName},TXNID=${txnId},TXNDATE=${txnDate},TXNCRNCY=NPR,TXNAMT=100,REFERENCEID=chk-ref,REMARKS=check,PARTICULARS=check,TOKEN=TOKEN`;
  const loginToken = signIpsMessage(loginMessage);
  console.log("Login TXNID:", txnId);
  console.log("Login token generated OK, length:", loginToken.length);

  // This txnId was never actually POSTed to the login page, so a well-formed
  // request should come back as status ERROR / "TRANSACTION NOT FOUND" —
  // that still proves auth + token format are accepted. A 401 means the
  // Basic Auth credentials are wrong; a signature-specific error means the
  // TOKEN format needs adjusting.
  const validateMessage = `MERCHANTID=${merchantId},APPID=${appId},REFERENCEID=${txnId},TXNAMT=100`;
  const validateToken = signIpsMessage(validateMessage);

  const res = await fetch(validationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${appId}:${basicAuthPassword}`).toString("base64")}`,
    },
    body: JSON.stringify({
      merchantId: Number(merchantId),
      appId,
      referenceId: txnId,
      txnAmt: 100,
      token: validateToken,
    }),
  });

  console.log("validatetxn HTTP status:", res.status);
  console.log("validatetxn body:", await res.text());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
