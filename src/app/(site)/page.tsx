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
  // When the page leads with a hero, pull it up under the transparent overlay header.
  const leadsWithHero = sections[0]?.type === "HERO";

  return (
    <main className={leadsWithHero ? "-mt-16" : ""}>
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
