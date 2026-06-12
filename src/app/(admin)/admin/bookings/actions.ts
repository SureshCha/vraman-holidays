"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/generated/prisma/enums";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role === "EDITOR") {
    return { success: false, error: "Unauthorized" };
  }

  await db.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
  return { success: true, data: undefined };
}
