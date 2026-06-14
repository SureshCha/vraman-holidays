import { Suspense } from "react";
import { getHomeSections } from "@/lib/home-sections";
import { SectionRenderer } from "@/components/site/sections";

// The sections live in a Suspense boundary so, under Cache Components, they are
// a dynamic hole streamed from the live DB on every request — the homepage can
// never get stuck serving a stale/empty prerendered shell.
async function HomeSections() {
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

export default function HomePage() {
  return (
    <Suspense fallback={<main className="min-h-[60vh]" />}>
      <HomeSections />
    </Suspense>
  );
}
