"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateSettings(data: Record<string, unknown>): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  await db.siteSettings.update({
    where: { id: 1 },
    data,
  });

  revalidateTag("settings", "max");
  return { success: true };
}
