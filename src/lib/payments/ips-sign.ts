import "server-only";
import fs from "node:fs";
import crypto from "node:crypto";
import forge from "node-forge";

let cachedPrivateKeyPem: string | null = null;

function loadPfxBuffer(): Buffer {
  const base64 = process.env.IPS_PFX_BASE64;
  if (base64) return Buffer.from(base64, "base64");

  const path = process.env.IPS_PFX_PATH;
  if (path) return fs.readFileSync(path);

  throw new Error("connectIPS is not configured: set IPS_PFX_PATH or IPS_PFX_BASE64");
}

function extractPrivateKeyPem(): string {
  if (cachedPrivateKeyPem) return cachedPrivateKeyPem;

  const passphrase = process.env.IPS_PFX_PASSWORD;
  if (!passphrase) throw new Error("connectIPS is not configured: set IPS_PFX_PASSWORD");

  const pfxBuffer = loadPfxBuffer();
  const asn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer.toString("binary")));
  const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, passphrase);

  const pkcs8ShroudedKeyBagOid = forge.pki.oids.pkcs8ShroudedKeyBag as string;
  const keyBagOid = forge.pki.oids.keyBag as string;
  const keyBags = p12.getBags({ bagType: pkcs8ShroudedKeyBagOid })[pkcs8ShroudedKeyBagOid]
    ?? p12.getBags({ bagType: keyBagOid })[keyBagOid];
  const privateKey = keyBags?.[0]?.key;
  if (!privateKey) throw new Error("connectIPS: could not find a private key inside IPS_PFX_PATH/IPS_PFX_BASE64");

  cachedPrivateKeyPem = forge.pki.privateKeyToPem(privateKey);
  return cachedPrivateKeyPem;
}

export function signIpsMessage(message: string): string {
  const privateKeyPem = extractPrivateKeyPem();
  return crypto.createSign("RSA-SHA256").update(message, "utf8").sign(privateKeyPem, "base64");
}
