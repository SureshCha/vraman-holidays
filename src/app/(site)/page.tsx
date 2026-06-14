import { connection } from "next/server";
import { db } from "@/lib/db";
import { SectionRenderer } from "@/components/site/sections";

// Mirrors the (working) /destinations page: await connection() to render
// dynamically, then read the sections inline from the live DB. Avoids a
// Suspense/PPR postponed stream, which failed to resume on Vercel and left the
// homepage blank.
export default async function HomePage() {
  await connection();

  const sections = await db.homeSection.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });

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
