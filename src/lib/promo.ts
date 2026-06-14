import { ContentStatus } from "@/generated/prisma/enums";

type PromoUsability = {
  status: ContentStatus;
  validFrom: Date;
  validUntil: Date;
  maxUses: number | null;
  usedCount: number;
};

/** Whether a promo code is currently redeemable (published, in-window, under its use cap). */
export function checkPromoUsable(
  promo: PromoUsability,
  now: Date,
): { ok: true } | { ok: false; error: string } {
  if (promo.status !== ContentStatus.PUBLISHED) return { ok: false, error: "Invalid promo code" };
  if (now < promo.validFrom || now > promo.validUntil) return { ok: false, error: "This code has expired" };
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return { ok: false, error: "This code has reached its usage limit" };
  }
  return { ok: true };
}

/**
 * Discount (in minor units) a promo yields for a given total. Percentage is
 * clamped to 0–100 and the result is clamped to [0, total] so a malformed code
 * can never produce a negative price.
 */
export function computeDiscount(
  promo: { discountPercent: number | null; discountFixed: number | null },
  total: number,
): number {
  let discount = 0;
  if (promo.discountPercent != null) {
    const pct = Math.min(100, Math.max(0, promo.discountPercent));
    discount = Math.round(total * (pct / 100));
  } else if (promo.discountFixed != null) {
    discount = promo.discountFixed;
  }
  return Math.min(Math.max(0, discount), total);
}
