import "server-only";
import { resend } from "./resend";
import { render } from "@react-email/render";
import { BookingConfirmation } from "./templates/BookingConfirmation";
import { AdminNotification } from "./templates/AdminNotification";
import { EnquiryAck } from "./templates/EnquiryAck";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { format } from "date-fns";

export async function sendBookingConfirmation(bookingId: string): Promise<void> {
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

    await resend.emails.send({
      from: settings.emailTemplates.fromEmail,
      to: traveller.email,
      subject: settings.emailTemplates.bookingSubject,
      html,
    });
  } catch (e) {
    console.error("Failed to send booking confirmation:", e);
  }
}

export async function sendAdminNotification(
  type: "booking" | "enquiry",
  id: string
): Promise<void> {
  try {
    const settings = await getSettings();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
      detailUrl = `${baseUrl}/admin/bookings/${id}`;
    } else {
      const enquiry = await db.enquiry.findUnique({ where: { id } });
      if (!enquiry) return;
      summary = `Name: ${enquiry.name}\nEmail: ${enquiry.email}\nType: ${enquiry.type}\nMessage: ${enquiry.message.slice(0, 200)}`;
      detailUrl = `${baseUrl}/admin/enquiries`;
    }

    const html = await render(
      AdminNotification({
        type,
        summary,
        detailUrl,
        brandName: settings.brand.name,
      })
    );

    await resend.emails.send({
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

    await resend.emails.send({
      from: settings.emailTemplates.fromEmail,
      to: enquiry.email,
      subject: settings.emailTemplates.enquirySubject,
      html,
    });
  } catch (e) {
    console.error("Failed to send enquiry ack:", e);
  }
}
