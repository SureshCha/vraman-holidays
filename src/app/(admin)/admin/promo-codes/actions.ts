"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { ContentStatus } from "@/generated/prisma/enums";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

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

  const hasPercent = data.discountPercent != null;
  const hasFixed = data.discountFixed != null;
  if (!hasPercent && !hasFixed) return { success: false, error: "Provide a discount percentage or fixed amount" };
  if (hasPercent && hasFixed) return { success: false, error: "Use either a percentage or a fixed amount, not both" };
  if (hasPercent && (data.discountPercent! <= 0 || data.discountPercent! > 100)) {
    return { success: false, error: "Percentage must be between 1 and 100" };
  }
  if (hasFixed && data.discountFixed! <= 0) {
    return { success: false, error: "Fixed discount must be greater than zero" };
  }

  const validFrom = new Date(data.validFrom);
  const validUntil = new Date(data.validUntil);
  if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validUntil.getTime())) {
    return { success: false, error: "Invalid validity dates" };
  }
  if (validUntil < validFrom) {
    return { success: false, error: "End date must be after start date" };
  }
  if (data.maxUses != null && data.maxUses <= 0) {
    return { success: false, error: "Max uses must be greater than zero" };
  }

  const existing = await db.promoCode.findUnique({ where: { code } });
  if (existing) return { success: false, error: "This code already exists" };

  const promo = await db.promoCode.create({
    data: {
      code,
      discountPercent: data.discountPercent ?? null,
      discountFixed: data.discountFixed ?? null,
      currency: data.currency ?? "NPR",
      validFrom,
      validUntil,
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
