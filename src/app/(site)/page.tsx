import { connection } from "next/server";
import { getHomeSections } from "@/lib/home-sections";
import { SectionRenderer } from "@/components/site/sections";

export default async function HomePage() {
  await connection();
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
