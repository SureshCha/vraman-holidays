"use server";

import { db } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const tripTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

export async function createTripType(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = tripTypeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const tt = await db.tripType.create({ data: parsed.data });
  revalidatePath("/admin/destinations/trip-types");
  return { success: true, data: { id: tt.id } };
}

export async function updateTripType(id: string, input: unknown): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = tripTypeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  await db.tripType.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/destinations/trip-types");
  return { success: true, data: undefined };
}

export async function deleteTripType(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  await db.tripType.update({ where: { id }, data: { packages: { set: [] } } });
  await db.tripType.delete({ where: { id } });
  revalidatePath("/admin/destinations/trip-types");
  return { success: true, data: undefined };
}

export async function reorderTripTypes(ids: string[]): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  await Promise.all(ids.map((id, i) => db.tripType.update({ where: { id }, data: { order: i } })));
  return { success: true, data: undefined };
}
