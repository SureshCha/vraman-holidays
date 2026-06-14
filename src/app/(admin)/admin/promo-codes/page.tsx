import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PromoCodesClient } from "./PromoCodesClient";

export default async function PromoCodesPage() {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) notFound();

  const promos = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Promo Codes</h1>
        <p className="text-muted-foreground text-sm">Create and manage discount codes for customers.</p>
      </div>
      <PromoCodesClient
        promos={promos.map((p) => ({
          id: p.id,
          code: p.code,
          discountPercent: p.discountPercent,
          discountFixed: p.discountFixed,
          currency: p.currency,
          validFrom: p.validFrom.toISOString(),
          validUntil: p.validUntil.toISOString(),
          maxUses: p.maxUses,
          usedCount: p.usedCount,
          status: p.status,
        }))}
      />
    </div>
  );
}
