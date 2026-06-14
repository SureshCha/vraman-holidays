"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/generated/prisma/enums";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  await db.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
  return { success: true, data: undefined };
}

export async function confirmBankTransfer(
  bookingId: string,
  referenceNote: string
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

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

  // Fire-and-forget emails
  const { sendBookingConfirmation, sendAdminNotification } = await import("@/lib/email/send");
  sendBookingConfirmation(bookingId).catch(() => {});
  sendAdminNotification("booking", bookingId).catch(() => {});

  revalidatePath("/admin/bookings");
  return { success: true, data: undefined };
}
