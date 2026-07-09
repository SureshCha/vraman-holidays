import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";
import { sanitizeHtml } from "@/lib/sanitize";

interface ItineraryItem {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  alert?: string;
}

interface ItinerarySectionData {
  heading?: string;
  lead?: string;
  items?: ItineraryItem[];
}

export async function ItinerarySection({ data }: { data: ItinerarySectionData }) {
  const items = data.items ?? [];
  if (items.length === 0) return null;

  const settings = await getSettings();
  const heading = data.heading ? resolveTokens(data.heading, settings) : "";
  const lead = data.lead ? resolveTokens(data.lead, settings) : "";

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">{heading}</h2>
        )}
        {lead && (
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">{lead}</p>
        )}

        <Accordion multiple={false} className="space-y-3">
          {items.map((item, i) => {
            const key = `itinerary-${i}`;
            return (
              <AccordionItem key={key} value={key} className="border rounded-xl px-5 py-1">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-sm">{item.title ?? `Step ${i + 1}`}</span>
                        {item.subtitle && (
                          <p className="text-xs text-primary font-medium italic mt-0.5">{item.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 space-y-4">
                  {item.imageUrl && (
                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 672px"
                      />
                    </div>
                  )}

                  {item.description && (
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground [&_img]:rounded-lg [&_img]:my-3"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                    />
                  )}

                  {item.alert && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">{item.alert}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
