"use server";

import { requireEditor, requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { ContentStatus } from "@/generated/prisma/enums";
import { revalidateTag } from "next/cache";
import { z } from "zod";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const testimonialSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().min(1),
  imageUrl: z.string().optional(),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
});

export async function createTestimonial(input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await requireEditor())) return { success: false, error: "Unauthorized" };
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const t = await db.testimonial.create({ data: parsed.data });
  revalidateTag("testimonials", "max");
  return { success: true, data: { id: t.id } };
}

export async function updateTestimonialStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  if (!(await requireEditor())) return { success: false, error: "Unauthorized" };
  await db.testimonial.update({ where: { id }, data: { status } });
  revalidateTag("testimonials", "max");
  return { success: true, data: undefined };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await db.testimonial.delete({ where: { id } });
  revalidateTag("testimonials", "max");
  return { success: true, data: undefined };
}
