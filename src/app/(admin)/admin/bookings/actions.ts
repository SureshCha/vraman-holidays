"use server";

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/generated/prisma/enums";
import { nanoid } from "nanoid";
import { requireAdmin } from "@/lib/auth-helpers";
import { IpsAdapter } from "@/lib/payments/ips";
import {
  bookingDetailsSchema,
  travellerUpdateSchema,
  adminCreateBookingSchema,
  adminPaymentSchema,
  updatePaymentSchema,
} from "@/lib/validators/booking";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function sendConfirmationEmails(bookingId: string) {
  const { sendBookingConfirmation, sendAdminNotification } = await import("@/lib/email/send");
  sendBookingConfirmation(bookingId).catch(() => {});
  sendAdminNotification("booking", bookingId).catch(() => {});
}

async function sendAdminOnlyNotification(bookingId: string) {
  const { sendAdminNotification } = await import("@/lib/email/send");
  sendAdminNotification("booking", bookingId).catch(() => {});
}

async function confirmBookingAndNotify(bookingId: string) {
  await db.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
  await sendConfirmationEmails(bookingId);
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  await db.booking.update({ where: { id }, data: { status } });
  logAction(session.user.id, "booking.status_change", "Booking", id, { status });
  revalidatePath("/admin/bookings");
  return { success: true, data: undefined };
}

export async function confirmBankTransfer(
  bookingId: string,
  referenceNote: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const pendingTxn = await db.paymentTransaction.findFirst({
    where: { bookingId, gateway: "BANK_TRANSFER", status: "PENDING" },
  });
  if (!pendingTxn) {
    return { success: false, error: "No pending bank transfer found for this booking" };
  }

  await db.$transaction([
    db.paymentTransaction.update({
      where: { id: pendingTxn.id },
      data: {
        status: "SUCCESS",
        gatewayTxnId: referenceNote || null,
      },
    }),
    db.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  logAction(session.user.id, "booking.bank_transfer_confirmed", "Booking", bookingId, { referenceNote });

  await sendConfirmationEmails(bookingId);

  revalidatePath("/admin/bookings");
  return { success: true, data: undefined };
}

export async function updateBookingDetails(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = bookingDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { status, departureId, totalAmount, discountAmount, travelInsurance, notes } =
    parsed.data;

  await db.booking.update({
    where: { id },
    data: { status, departureId, totalAmount, discountAmount, travelInsurance, notes },
  });

  logAction(session.user.id, "booking.details_updated", "Booking", id, {
    status,
    departureId,
    totalAmount,
    discountAmount,
    travelInsurance,
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  return { success: true, data: undefined };
}

export async function updateTraveller(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = travellerUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { firstName, lastName, email, phone, nationality, passportNo, dob, specialRequests } =
    parsed.data;

  const traveller = await db.traveller.update({
    where: { id },
    data: {
      firstName,
      lastName,
      email,
      phone,
      nationality: nationality ?? null,
      passportNo: passportNo ?? null,
      dob: dob ? new Date(dob) : null,
      specialRequests: specialRequests ?? null,
    },
    select: { bookingId: true },
  });

  logAction(session.user.id, "booking.traveller_updated", "Traveller", id, {
    bookingId: traveller.bookingId,
  });

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${traveller.bookingId}`);
  return { success: true, data: undefined };
}

export async function reVerifyIpsPayment(
  transactionId: string
): Promise<ActionResult<{ status: string }>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const txn = await db.paymentTransaction.findUnique({ where: { id: transactionId } });
  if (!txn) return { success: false, error: "Transaction not found" };
  if (txn.gateway !== "IPS") return { success: false, error: "Not an IPS transaction" };
  if (!txn.gatewayTxnId) return { success: false, error: "No TXNID recorded — cannot re-verify" };

  const adapter = new IpsAdapter();
  const result = await adapter.verify({ bookingId: txn.bookingId, gatewayRef: txn.gatewayTxnId });

  if (result.success) {
    await db.$transaction([
      db.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: "SUCCESS", rawResponse: result.rawResponse ?? undefined },
      }),
      db.booking.update({
        where: { id: txn.bookingId },
        data: { status: "CONFIRMED" },
      }),
    ]);
    await sendConfirmationEmails(txn.bookingId);
    logAction(session.user.id, "payment.ips_reverified_success", "PaymentTransaction", transactionId, { bookingId: txn.bookingId });
  } else {
    await db.paymentTransaction.update({
      where: { id: transactionId },
      data: { status: "FAILED", rawResponse: result.rawResponse ?? undefined },
    });
    logAction(session.user.id, "payment.ips_reverified_failed", "PaymentTransaction", transactionId, { bookingId: txn.bookingId });
  }

  revalidatePath(`/admin/bookings/${txn.bookingId}`);
  return { success: true, data: { status: result.success ? "SUCCESS" : "FAILED" } };
}

export async function manualConfirmPayment(
  transactionId: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const txn = await db.paymentTransaction.findUnique({ where: { id: transactionId } });
  if (!txn) return { success: false, error: "Transaction not found" };
  if (txn.status !== "PENDING") return { success: false, error: "Transaction is no longer PENDING" };

  await db.$transaction([
    db.paymentTransaction.update({
      where: { id: transactionId },
      data: { status: "SUCCESS" },
    }),
    db.booking.update({
      where: { id: txn.bookingId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  await sendConfirmationEmails(txn.bookingId);
  logAction(session.user.id, "payment.manual_confirmed", "PaymentTransaction", transactionId, {
    bookingId: txn.bookingId,
    gateway: txn.gateway,
  });

  revalidatePath(`/admin/bookings/${txn.bookingId}`);
  return { success: true, data: undefined };
}

export async function createManualBooking(
  input: unknown
): Promise<ActionResult<{ bookingId: string; bookingRef: string }>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = adminCreateBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    packageId, departureId, status: requestedStatus, currency,
    totalAmount, discountAmount, travelInsurance, notes, travellers, payment,
  } = parsed.data;

  // If a SUCCESS payment is attached, the booking must be CONFIRMED regardless.
  const status = payment?.status === "SUCCESS" ? "CONFIRMED" : requestedStatus;

  const pkg = await db.package.findFirst({ where: { id: packageId, status: "PUBLISHED" } });
  if (!pkg) return { success: false, error: "Package not found or not published" };

  if (departureId) {
    const dep = await db.packageDeparture.findFirst({ where: { id: departureId, packageId } });
    if (!dep) return { success: false, error: "Departure not found for this package" };
  }

  const bookingRef = nanoid(10).toUpperCase();

  const booking = await db.booking.create({
    data: {
      bookingRef,
      packageId,
      departureId: departureId ?? null,
      status,
      currency,
      totalAmount: Math.round(totalAmount * 100),
      discountAmount: Math.round(discountAmount * 100),
      travelInsurance,
      notes: notes ?? null,
      travellers: {
        create: travellers.map(({ dob, nationality, passportNo, address, specialRequests, ...rest }, i) => ({
          ...rest,
          nationality: nationality ?? null,
          passportNo: passportNo ?? null,
          dob: dob ? new Date(dob) : null,
          address: address ?? null,
          specialRequests: specialRequests ?? null,
          isPrimary: i === 0,
        })),
      },
      ...(payment ? {
        payments: {
          create: {
            gateway: payment.gateway,
            amount: Math.round(payment.amount * 100),
            status: payment.status,
            gatewayTxnId: payment.gatewayTxnId ?? null,
            currency: payment.currency,
          },
        },
      } : {}),
    },
  });

  logAction(session.user.id, "booking.manual_created", "Booking", booking.id, {
    bookingRef, packageId, status, totalAmount,
  });

  if (status === "CONFIRMED") {
    await sendConfirmationEmails(booking.id);
  } else {
    await sendAdminOnlyNotification(booking.id);
  }

  revalidatePath("/admin/bookings");
  return { success: true, data: { bookingId: booking.id, bookingRef } };
}

export async function addPaymentToBooking(
  bookingId: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = adminPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { gateway, amount, status, gatewayTxnId, currency } = parsed.data;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true },
  });
  if (!booking) return { success: false, error: "Booking not found" };

  await db.paymentTransaction.create({
    data: {
      bookingId,
      gateway,
      amount: Math.round(amount * 100),
      status,
      gatewayTxnId: gatewayTxnId ?? null,
      currency,
    },
  });

  if (status === "SUCCESS" && booking.status !== "CONFIRMED") {
    await confirmBookingAndNotify(bookingId);
  }

  logAction(session.user.id, "payment.admin_added", "PaymentTransaction", bookingId, { gateway, status });
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath(`/admin/bookings/${bookingId}/edit`);
  return { success: true, data: undefined };
}

export async function updatePaymentTransaction(
  txnId: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = updatePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { status, gatewayTxnId } = parsed.data;

  const txn = await db.paymentTransaction.findUnique({
    where: { id: txnId },
    select: { id: true, bookingId: true, status: true, booking: { select: { status: true } } },
  });
  if (!txn) return { success: false, error: "Transaction not found" };

  await db.paymentTransaction.update({
    where: { id: txnId },
    data: { status, gatewayTxnId: gatewayTxnId ?? null },
  });

  if (status === "SUCCESS" && txn.status !== "SUCCESS" && txn.booking.status !== "CONFIRMED") {
    await confirmBookingAndNotify(txn.bookingId);
  }

  logAction(session.user.id, "payment.admin_updated", "PaymentTransaction", txnId, {
    bookingId: txn.bookingId,
    status,
  });
  revalidatePath(`/admin/bookings/${txn.bookingId}`);
  revalidatePath(`/admin/bookings/${txn.bookingId}/edit`);
  return { success: true, data: undefined };
}
