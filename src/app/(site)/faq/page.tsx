import { connection } from "next/server";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `FAQ | ${settings.brand.name}` };
}

export default async function FaqPage() {
  await connection();
  const faqs = await db.faq.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });

  // Group by category
  const grouped = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const list = grouped.get(faq.category) ?? [];
    list.push(faq);
    grouped.set(faq.category, list);
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <Breadcrumbs items={[{ label: "FAQ" }]} />

      <h1 className="text-3xl font-bold tracking-tight mt-4 mb-8">Frequently Asked Questions</h1>

      {faqs.length === 0 ? (
        <p className="text-muted-foreground">No FAQs available yet.</p>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-lg font-semibold mb-4">{category}</h2>
              <div className="space-y-3">
                {items.map((faq) => (
                  <details key={faq.id} className="group border rounded-lg">
                    <summary className="cursor-pointer p-4 font-medium text-sm flex items-center justify-between">
                      {faq.question}
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform">&#9662;</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
