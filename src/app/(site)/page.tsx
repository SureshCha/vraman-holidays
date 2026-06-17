import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { SectionRenderer } from "@/components/site/sections";

async function getHomeSections() {
  "use cache";
  cacheTag("home-sections");
  return db.homeSection.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
}

export default async function HomePage() {
  const sections = await getHomeSections();

  return (
    <main>
      {sections.map((section) => (
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
