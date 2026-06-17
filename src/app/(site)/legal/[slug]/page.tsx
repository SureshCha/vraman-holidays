import { connection } from "next/server";
import { sanitizeHtml } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { cacheTag } from "next/cache";
import type { Metadata } from "next";

async function getLegalPage(slug: string) {
  "use cache";
  cacheTag("legal");
  return db.legalPage.findUnique({ where: { slug } });
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  return page ? { title: page.title } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) notFound();

  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{page.title}</h1>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
    </main>
  );
}
