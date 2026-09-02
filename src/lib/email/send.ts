import "server-only";
import { sendMail, isEmailConfigured } from "./mailer";
import { render } from "@react-email/render";
import { BookingConfirmation } from "./templates/BookingConfirmation";
import { BookingReceived } from "./templates/BookingReceived";
import { AdminNotification } from "./templates/AdminNotification";
import { EnquiryAck } from "./templates/EnquiryAck";
import { PaymentFailure } from "./templates/PaymentFailure";
import { DailyDigest } from "./templates/DailyDigest";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { format } from "date-fns";
import { computeInvoiceTotals, normaliseInvoiceItems, fmtNPR } from "@/lib/invoice-utils";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendBookingConfirmation(bookingId: string): Promise<void> {
  if (!isEmailConfigured()) { console.warn("No email transport configured — skipping booking confirmation email"); return; }
  try {
    const settings = await getSettings();
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: { select: { title: true } },
        departure: { select: { departureDate: true } },
        travellers: { where: { isPrimary: true }, take: 1 },
      },
    });
    if (!booking || !booking.travellers[0]) return;

    const traveller = booking.travellers[0];
    const html = await render(
      BookingConfirmation({
        travellerName: traveller.firstName,
        bookingRef: booking.bookingRef,
        packageTitle: booking.package.title,
        departureDate: booking.departure
          ? format(booking.departure.departureDate, "dd MMM yyyy")
          : undefined,
        totalAmount: (booking.totalAmount / 100).toLocaleString(),
        currency: booking.currency,
        brandName: settings.brand.name,
        footerText: settings.emailTemplates.footerText,
      })
    );

    await sendMail({
      from: settings.emailTemplates.fromEmail,
      to: traveller.email,
      subject: settings.emailTemplates.bookingSubject,
      html,
    });
  } catch (e) {
    console.error("Failed to send booking confirmation:", e);
  }
}

export async function sendBookingReceived(bookingId: string): Promise<void> {
  if (!isEmailConfigured()) { console.warn("No email transport configured — skipping booking received email"); return; }
  try {
    const settings = await getSettings();
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: { select: { title: true } },
        departure: { select: { departureDate: true } },
        travellers: { where: { isPrimary: true }, take: 1 },
      },
    });
    if (!booking || !booking.travellers[0]) return;

    const traveller = booking.travellers[0];
    const html = await render(
      BookingReceived({
        travellerName: traveller.firstName,
        bookingRef: booking.bookingRef,
        packageTitle: booking.package.title,
        departureDate: booking.departure
          ? format(booking.departure.departureDate, "dd MMM yyyy")
          : undefined,
        totalAmount: (booking.totalAmount / 100).toLocaleString(),
        currency: booking.currency,
        brandName: settings.brand.name,
        footerText: settings.emailTemplates.footerText,
      })
    );

    await sendMail({
      from: settings.emailTemplates.fromEmail,
      to: traveller.email,
      subject: `Booking received — ${settings.brand.name}`,
      html,
    });
  } catch (e) {
    console.error("Failed to send booking received email:", e);
  }
}

export async function sendAdminNotification(
  type: "booking" | "enquiry",
  id: string
): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const settings = await getSettings();
    let summary = "";
    let detailUrl = "";

    if (type === "booking") {
      const booking = await db.booking.findUnique({
        where: { id },
        include: {
          package: { select: { title: true } },
          travellers: { where: { isPrimary: true }, take: 1 },
        },
      });
      if (!booking) return;
      const t = booking.travellers[0];
      summary = `Ref: ${booking.bookingRef}\nPackage: ${booking.package.title}\nTraveller: ${t?.firstName ?? ""} ${t?.lastName ?? ""}\nEmail: ${t?.email ?? ""}\nAmount: ${booking.currency} ${(booking.totalAmount / 100).toLocaleString()}`;
      detailUrl = `${BASE_URL}/admin/bookings/${id}`;
    } else {
      const enquiry = await db.enquiry.findUnique({ where: { id } });
      if (!enquiry) return;
      summary = `Name: ${enquiry.name}\nEmail: ${enquiry.email}\nType: ${enquiry.type}\nMessage: ${enquiry.message.slice(0, 200)}`;
      detailUrl = `${BASE_URL}/admin/enquiries`;
    }

    const html = await render(
      AdminNotification({
        type,
        summary,
        detailUrl,
        brandName: settings.brand.name,
      })
    );

    await sendMail({
      from: settings.emailTemplates.fromEmail,
      to: settings.emailTemplates.replyTo,
      subject: `[${settings.brand.name}] New ${type}: ${type === "booking" ? "booking received" : "enquiry received"}`,
      html,
    });
  } catch (e) {
    console.error(`Failed to send admin ${type} notification:`, e);
  }
}

export async function sendEnquiryAck(enquiryId: string): Promise<void> {
  if (!isEmailConfigured()) return;
  try {
    const settings = await getSettings();
    const enquiry = await db.enquiry.findUnique({ where: { id: enquiryId } });
    if (!enquiry) return;

    const html = await render(
      EnquiryAck({
        name: enquiry.name,
        brandName: settings.brand.name,
        footerText: settings.emailTemplates.footerText,
      })
    );

    await sendMail({
      from: settings.emailTemplates.fromEmail,
      to: enquiry.email,
      subject: settings.emailTemplates.enquirySubject,
      html,
    });
  } catch (e) {
    console.error("Failed to send enquiry ack:", e);
  }
}

export async function sendPaymentFailure(bookingId: string): Promise<void> {
  if (!isEmailConfigured()) { console.warn("No email transport configured — skipping payment failure email"); return; }
  try {
    const settings = await getSettings();
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: { select: { title: true } },
        travellers: { where: { isPrimary: true }, take: 1 },
      },
    });
    if (!booking || !booking.travellers[0]) return;

    const traveller = booking.travellers[0];

    const html = await render(
      PaymentFailure({
        travellerName: traveller.firstName,
        bookingRef: booking.bookingRef,
        packageTitle: booking.package.title,
        totalAmount: (booking.totalAmount / 100).toLocaleString(),
        currency: booking.currency,
        retryUrl: `${BASE_URL}/booking?bookingId=${booking.id}`,
        brandName: settings.brand.name,
        footerText: settings.emailTemplates.footerText,
      })
    );

    await sendMail({
      from: settings.emailTemplates.fromEmail,
      to: traveller.email,
      subject: `Payment failed — ${settings.brand.name}`,
      html,
    });
  } catch (e) {
    console.error("Failed to send payment failure email:", e);
  }
}

export async function sendInvoiceEmail(invoiceId: string): Promise<void> {
  if (!isEmailConfigured()) { console.warn("No email transport configured — skipping invoice email"); return; }

  const [settings, invoice] = await Promise.all([
    getSettings(),
    db.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: { select: { qty: true, rate: true, discountPercent: true, taxable: true } } },
    }),
  ]);
  if (!invoice || !invoice.clientEmail) return;

  const { netTotal } = computeInvoiceTotals(normaliseInvoiceItems(invoice.items), Number(invoice.vatPercent));
  const invoiceUrl = `${BASE_URL}/invoice/${encodeURIComponent(invoice.invoiceNo)}`;
  const brandColor = /^#[0-9A-Fa-f]{3,6}$/.test(settings.theme?.primaryColor ?? "")
    ? settings.theme!.primaryColor
    : "#1A7A50";

  const clientName = escHtml(invoice.clientName);
  const invoiceNo   = escHtml(invoice.invoiceNo);
  const brandName   = escHtml(settings.brand.name);
  const footerText  = escHtml(settings.emailTemplates.footerText || `Thank you for your business with ${settings.brand.name}.`);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px;width:100%">
        <tr><td style="background:${brandColor};padding:16px 24px">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700">${brandName}</p>
        </td></tr>
        <tr><td style="padding:32px 24px">
          <p style="margin:0 0 8px;font-size:15px;color:#111827">Dear ${clientName},</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280">Please find your tax invoice below.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:16px;margin-bottom:24px">
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0">Invoice No</td>
              <td align="right" style="font-size:13px;font-weight:600;color:#111827;padding:4px 0;font-family:monospace">${invoiceNo}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0">Invoice Date</td>
              <td align="right" style="font-size:13px;color:#111827;padding:4px 0">${format(invoice.invoiceDate, "dd MMM yyyy")}</td>
            </tr>
            ${invoice.dueDate ? `<tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0">Due Date</td>
              <td align="right" style="font-size:13px;color:#111827;padding:4px 0">${format(invoice.dueDate, "dd MMM yyyy")}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size:14px;font-weight:700;color:#111827;padding:8px 0 0;border-top:1px solid #e5e7eb">Net Total</td>
              <td align="right" style="font-size:14px;font-weight:700;color:${brandColor};padding:8px 0 0;border-top:1px solid #e5e7eb">${escHtml(invoice.currency)} ${fmtNPR(netTotal)}</td>
            </tr>
          </table>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280">You can view and print your invoice using the link below:</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:${brandColor};border-radius:6px">
            <a href="${invoiceUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none">View Invoice</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
          ${footerText}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendMail({
    from: settings.emailTemplates.fromEmail,
    to: invoice.clientEmail,
    subject: `Tax Invoice ${invoice.invoiceNo} — ${settings.brand.name}`,
    html,
  });
}

export async function sendDailyDigest(): Promise<void> {
  if (!isEmailConfigured()) { console.warn("Email not configured — skipping daily digest"); return; }
  try {
    const settings = await getSettings();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [bookings, enquiriesCount, revenueAgg] = await Promise.all([
      db.booking.findMany({
        where: { createdAt: { gte: since } },
        include: { package: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.enquiry.count({ where: { createdAt: { gte: since } } }),
      db.paymentTransaction.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: since } },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amount ?? 0;

    const html = await render(
      DailyDigest({
        date: format(new Date(), "dd MMM yyyy"),
        bookingsCount: bookings.length,
        enquiriesCount,
        totalRevenue: (totalRevenue / 100).toLocaleString(),
        currency: "NPR",
        recentBookings: bookings.map((b) => ({
          bookingRef: b.bookingRef,
          packageTitle: b.package.title,
          totalAmount: (b.totalAmount / 100).toLocaleString(),
          currency: b.currency,
        })),
        brandName: settings.brand.name,
        adminUrl: BASE_URL,
      })
    );

    await sendMail({
      from: settings.emailTemplates.fromEmail,
      to: settings.emailTemplates.replyTo,
      subject: `[${settings.brand.name}] Daily Digest — ${format(new Date(), "dd MMM yyyy")}`,
      html,
    });
  } catch (e) {
    console.error("Failed to send daily digest:", e);
  }
}
