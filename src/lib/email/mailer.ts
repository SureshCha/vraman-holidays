import "server-only";
import nodemailer from "nodemailer";
import { resend } from "./resend";

/**
 * Unified email sender. Prefers SMTP (e.g. a cPanel mailbox) when SMTP_* env
 * vars are set, otherwise falls back to Resend, otherwise no-ops gracefully.
 *
 * SMTP env vars:
 *   SMTP_HOST   e.g. mail.vramanholidays.com.np
 *   SMTP_PORT   465 (SSL) or 587 (STARTTLS)   — defaults to 465
 *   SMTP_USER   full mailbox address, e.g. info@vramanholidays.com.np
 *   SMTP_PASS   mailbox password
 *   SMTP_FROM   optional From override; defaults to SMTP_USER. Most SMTP servers
 *               require the From to be the authenticated mailbox.
 */
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

/** True when at least one transport (SMTP or Resend) is configured. */
export function isEmailConfigured(): boolean {
  return smtpConfigured || Boolean(resend);
}

interface MailInput {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ from, to, subject, html }: MailInput): Promise<void> {
  if (transporter) {
    // cPanel/most SMTP servers reject a From that isn't the authenticated mailbox.
    await transporter.sendMail({
      from: process.env.SMTP_FROM || SMTP_USER || from,
      to,
      subject,
      html,
    });
    return;
  }
  if (resend) {
    await resend.emails.send({ from, to, subject, html });
    return;
  }
  console.warn("No email transport configured (SMTP_* or RESEND_API_KEY) — skipping email");
}
