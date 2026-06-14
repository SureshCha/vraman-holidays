import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/site/sections";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, metaTitle: true, metaDescription: true },
  });
  if (!page) return {};
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;

  const page = await db.page.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      sections: {
        where: { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) notFound();

  return (
    <main>
      {page.sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={{
            id: section.id,
            type: section.type,
            order: section.order,
            data: section.data as Record<string, unknown>,
          }}
        />
      ))}
    </main>
  );
}
