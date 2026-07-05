"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath, revalidateTag } from "next/cache";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function upsertFaq(
  id: string | null,
  data: { question: string; answer: string; category: string; visible: boolean }
): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  if (!data.question.trim()) return { success: false, error: "Question is required" };
  if (!data.answer.trim()) return { success: false, error: "Answer is required" };

  const faq = id
    ? await db.faq.update({ where: { id }, data })
    : await db.faq.create({ data: { ...data, order: await db.faq.count() } });

  revalidateTag("faq", "max");
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  return { success: true, data: { id: faq.id } };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await db.faq.delete({ where: { id } });
  revalidateTag("faq", "max");
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  return { success: true, data: undefined };
}

export async function reorderFaqs(ids: string[]): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await Promise.all(ids.map((id, i) => db.faq.update({ where: { id }, data: { order: i } })));
  revalidateTag("faq", "max");
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
  return { success: true, data: undefined };
}
