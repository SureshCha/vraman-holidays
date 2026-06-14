import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LegalPageEditor } from "../LegalPageEditor";

export default async function EditLegalPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const session = await auth();
  if (!session || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) notFound();

  const { slug } = await params;
  const page = await db.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/legal" className="hover:underline">Legal Pages</Link>
        <span>/</span>
        <span>{page.title}</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Edit: {page.title}</h1>

      <LegalPageEditor
        slug={page.slug}
        initialTitle={page.title}
        initialContent={page.content}
      />
    </div>
  );
}
