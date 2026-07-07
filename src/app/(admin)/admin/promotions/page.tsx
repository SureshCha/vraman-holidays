import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PromotionsClient } from "./PromotionsClient";

export default async function PromotionsAdminPage() {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) notFound();

  const popups = await db.promoPopup.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
        <p className="text-muted-foreground text-sm">Manage promotional popups shown to visitors.</p>
      </div>
      <PromotionsClient
        popups={popups.map((p) => ({
          ...p,
          startDate: p.startDate?.toISOString().slice(0, 10) ?? "",
          endDate: p.endDate?.toISOString().slice(0, 10) ?? "",
        }))}
      />
    </div>
  );
}
