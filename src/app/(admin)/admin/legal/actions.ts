"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateLegalPage(
  slug: string,
  data: { title: string; content: string }
): Promise<ActionResult> {
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data.title.trim()) return { success: false, error: "Title is required" };
  if (!data.content.trim()) return { success: false, error: "Content is required" };

  await db.legalPage.update({
    where: { slug },
    data: { title: data.title.trim(), content: data.content },
  });

  revalidatePath(`/legal/${slug}`);
  revalidatePath("/admin/legal");
  return { success: true, data: undefined };
}
