"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { z } from "zod";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  location: z.string().min(1),
  order: z.number().int().default(0),
  openInNew: z.boolean().default(false),
});

export async function upsertNavItem(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const parsed = navItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const item = id
    ? await db.navigation.update({ where: { id }, data: parsed.data })
    : await db.navigation.create({ data: parsed.data });

  revalidateTag("navigation", "max");
  return { success: true, data: { id: item.id } };
}

export async function deleteNavItem(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  await db.navigation.delete({ where: { id } });
  revalidateTag("navigation", "max");
  return { success: true, data: undefined };
}

export async function reorderNavItems(ids: string[]): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  await Promise.all(ids.map((id, i) => db.navigation.update({ where: { id }, data: { order: i } })));
  revalidateTag("navigation", "max");
  return { success: true, data: undefined };
}
