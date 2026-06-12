import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { HomepageClient } from "./HomepageClient";

export default async function HomepagePage() {
  await connection();
  const session = await auth();
  if (!session || session.user.role === "EDITOR") notFound();

  const sections = await db.homeSection.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Homepage</h1>
        <p className="text-muted-foreground text-sm">Reorder and edit homepage sections.</p>
      </div>
      <HomepageClient sections={sections.map((s) => ({ id: s.id, type: s.type, order: s.order, data: s.data as Record<string, unknown>, visible: s.visible }))} />
    </div>
  );
}
