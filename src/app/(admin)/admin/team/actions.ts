"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function upsertTeamMember(
  id: string | null,
  data: { name: string; role: string; bio?: string; imageUrl?: string; visible: boolean }
): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  if (!data.name.trim()) return { success: false, error: "Name is required" };
  if (!data.role.trim()) return { success: false, error: "Role is required" };

  const member = id
    ? await db.teamMember.update({ where: { id }, data: { ...data, bio: data.bio ?? null, imageUrl: data.imageUrl ?? null } })
    : await db.teamMember.create({ data: { ...data, bio: data.bio ?? null, imageUrl: data.imageUrl ?? null, order: await db.teamMember.count() } });

  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true, data: { id: member.id } };
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await db.teamMember.delete({ where: { id } });
  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true, data: undefined };
}

export async function reorderTeamMembers(ids: string[]): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await Promise.all(ids.map((id, i) => db.teamMember.update({ where: { id }, data: { order: i } })));
  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true, data: undefined };
}
