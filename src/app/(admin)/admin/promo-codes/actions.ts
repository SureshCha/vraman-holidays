"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ContentStatus } from "@/generated/prisma/enums";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) return null;
  return session;
}

export async function createPromoCode(data: {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  currency?: string;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
}): Promise<ActionResult<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const code = data.code.trim().toUpperCase();
  if (!code) return { success: false, error: "Code is required" };
  if (!data.discountPercent && !data.discountFixed) return { success: false, error: "Provide a discount percentage or fixed amount" };

  const existing = await db.promoCode.findUnique({ where: { code } });
  if (existing) return { success: false, error: "This code already exists" };

  const promo = await db.promoCode.create({
    data: {
      code,
      discountPercent: data.discountPercent ?? null,
      discountFixed: data.discountFixed ?? null,
      currency: data.currency ?? "NPR",
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
      maxUses: data.maxUses ?? null,
      status: ContentStatus.PUBLISHED,
    },
  });

  revalidatePath("/admin/promo-codes");
  return { success: true, data: { id: promo.id } };
}

export async function deletePromoCode(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };
  await db.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promo-codes");
  return { success: true, data: undefined };
}
