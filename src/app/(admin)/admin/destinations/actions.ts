"use server";

import { db } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath, revalidateTag } from "next/cache";
import { destinationSchema } from "@/lib/validators/destination";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createDestination(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = destinationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.destination.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, error: "A destination with this slug already exists" };

  const dest = await db.destination.create({ data: parsed.data });
  revalidateTag("destinations", "max");
  revalidatePath("/destinations", "page");
  return { success: true, data: { id: dest.id } };
}

export async function updateDestination(id: string, input: unknown): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = destinationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.destination.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (existing) return { success: false, error: "Slug already in use" };

  await db.destination.update({ where: { id }, data: parsed.data });
  revalidateTag("destinations", "max");
  revalidatePath("/destinations", "page");
  revalidatePath(`/destinations/${parsed.data.slug}`, "page");
  return { success: true, data: undefined };
}

export async function deleteDestination(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const packageCount = await db.package.count({ where: { destinationId: id } });
  if (packageCount > 0) {
    return { success: false, error: `Cannot delete: ${packageCount} package(s) are linked to this destination` };
  }

  await db.destination.delete({ where: { id } });
  revalidateTag("destinations", "max");
  revalidatePath("/destinations", "page");
  return { success: true, data: undefined };
}

export async function reorderDestinations(ids: string[]): Promise<ActionResult> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  await Promise.all(
    ids.map((id, index) =>
      db.destination.update({ where: { id }, data: { order: index } })
    )
  );
  revalidateTag("destinations", "max");
  return { success: true, data: undefined };
}
