"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidateTag } from "next/cache";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function upsertPromoPopup(
  id: string | null,
  data: { title: string; imageUrl: string; linkUrl: string; alt: string; visible: boolean; startDate?: string; endDate?: string }
): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  if (!data.title.trim()) return { success: false, error: "Title is required" };
  if (!data.imageUrl.trim()) return { success: false, error: "Image is required" };
  if (!data.linkUrl.trim()) return { success: false, error: "Link URL is required" };

  const payload = {
    title: data.title.trim(),
    imageUrl: data.imageUrl,
    linkUrl: data.linkUrl.trim(),
    alt: data.alt.trim(),
    visible: data.visible,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  };

  const popup = id
    ? await db.promoPopup.update({ where: { id }, data: payload })
    : await db.promoPopup.create({ data: { ...payload, order: await db.promoPopup.count() } });

  revalidateTag("promo-popups", "max");
  return { success: true, data: { id: popup.id } };
}

export async function deletePromoPopup(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await db.promoPopup.delete({ where: { id } });
  revalidateTag("promo-popups", "max");
  return { success: true, data: undefined };
}

export async function reorderPromoPopups(ids: string[]): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await Promise.all(ids.map((id, i) => db.promoPopup.update({ where: { id }, data: { order: i } })));
  revalidateTag("promo-popups", "max");
  return { success: true, data: undefined };
}
