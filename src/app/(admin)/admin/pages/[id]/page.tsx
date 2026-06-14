import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageEditor } from "./PageEditor";

export default async function EditPageAdmin({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN"))
    notFound();

  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { order: "asc" } },
    },
  });
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/pages" className="hover:underline">
          Pages
        </Link>
        <span>/</span>
        <span>{page.title}</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Edit: {page.title}</h1>

      <PageEditor
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: page.status,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
        }}
        sections={page.sections.map((s) => ({
          id: s.id,
          type: s.type,
          order: s.order,
          data: s.data as Record<string, unknown>,
          visible: s.visible,
        }))}
      />
    </div>
  );
}
