import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FaqClient } from "./FaqClient";

export default async function FaqAdminPage() {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) notFound();

  const faqs = await db.faq.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">FAQ</h1>
        <p className="text-muted-foreground text-sm">Manage frequently asked questions.</p>
      </div>
      <FaqClient faqs={faqs} />
    </div>
  );
}
