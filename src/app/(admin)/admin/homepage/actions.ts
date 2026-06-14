"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";
import { SectionType } from "@/generated/prisma/enums";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const validTypes = new Set(Object.values(SectionType));

function validateSection(input: unknown): { type: SectionType; data: Record<string, unknown>; visible: boolean } | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  if (typeof obj["type"] !== "string" || !validTypes.has(obj["type"] as SectionType)) return null;
  if (!obj["data"] || typeof obj["data"] !== "object") return null;
  return {
    type: obj["type"] as SectionType,
    data: obj["data"] as Record<string, unknown>,
    visible: typeof obj["visible"] === "boolean" ? obj["visible"] : true,
  };
}

export async function upsertHomeSection(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const parsed = validateSection(input);
  if (!parsed) return { success: false, error: "Invalid section data" };

  const count = await db.homeSection.count();

  const prismaData = { type: parsed.type, data: parsed.data as never, visible: parsed.visible };
  const section = id
    ? await db.homeSection.update({ where: { id }, data: prismaData })
    : await db.homeSection.create({ data: { ...prismaData, order: count } });

  revalidateTag("home-sections", "max");
  revalidatePath("/", "page");
  return { success: true, data: { id: section.id } };
}

export async function deleteHomeSection(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  await db.homeSection.delete({ where: { id } });
  revalidateTag("home-sections", "max");
  revalidatePath("/", "page");
  return { success: true, data: undefined };
}

export async function reorderHomeSections(ids: string[]): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  await Promise.all(ids.map((id, i) => db.homeSection.update({ where: { id }, data: { order: i } })));
  revalidateTag("home-sections", "max");
  revalidatePath("/", "page");
  return { success: true, data: undefined };
}
