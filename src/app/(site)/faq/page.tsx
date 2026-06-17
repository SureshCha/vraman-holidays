import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `FAQ | ${settings.brand.name}` };
}

async function getFaqs() {
  "use cache";
  cacheTag("faq");
  return db.faq.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
}

export default async function FaqPage() {
  const faqs = await getFaqs();

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

      <h1 className="text-3xl font-bold tracking-tight mt-4 mb-8">
        Frequently Asked Questions
      </h1>

      {faqs.length === 0 ? (
        <p className="text-muted-foreground">No FAQs available yet.</p>
      ) : (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-lg font-semibold mb-4">{category}</h2>
              <Accordion className="space-y-2">
                {items.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border rounded-xl px-1 data-[state=open]:shadow-sm transition-shadow"
                  >
                    <AccordionTrigger className="px-4 text-sm font-medium text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
