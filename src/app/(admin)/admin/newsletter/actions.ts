"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true; data: void } | { success: false; error: string };

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }
  await db.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
  return { success: true, data: undefined };
}
