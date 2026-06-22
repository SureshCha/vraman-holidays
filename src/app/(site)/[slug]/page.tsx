import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/site/sections";
import type { Metadata } from "next";

async function getPage(slug: string) {
  "use cache";
  cacheTag("pages");
  return db.page.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      sections: {
        where: { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
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
  const { slug } = await params;
  const page = await getPage(slug);

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
