import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PagesClient } from "./PagesClient";

export default async function PagesPage() {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) notFound();

  const pages = await db.page.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { sections: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground text-sm">
          Create and manage custom pages with the section builder.
        </p>
      </div>
      <PagesClient
        pages={pages.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          _count: p._count,
          updatedAt: p.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
