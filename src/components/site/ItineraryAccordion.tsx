"use client";

import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface Day {
  id: string;
  dayNumber: number;
  title: string;
  subtitle?: string | null;
  summaryStrip?: string | null;
  description: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean } | null;
  accommodation: string | null;
  imageUrl?: string | null;
  images?: string[];
  alert?: string | null;
  elevation?: number | null;
}

export function ItineraryAccordion({ days }: { days: Day[] }) {
  return (
    <Accordion multiple={false} className="space-y-3">
      {days.map((day) => {
        const allImages = [
          ...(day.images?.length ? day.images : []),
          ...(day.imageUrl && !day.images?.includes(day.imageUrl) ? [day.imageUrl] : []),
        ];

        return (
          <AccordionItem key={day.id} value={day.id} className="border rounded-xl px-5 py-1">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {day.dayNumber}
                  </span>
                  <div>
                    <span className="font-semibold text-sm">{day.title}</span>
                    {day.subtitle && (
                      <p className="text-xs text-primary font-medium italic mt-0.5">{day.subtitle}</p>
                    )}
                  </div>
                </div>
                {day.summaryStrip && (
                  <p className="text-xs text-muted-foreground mt-1.5 ml-11">{day.summaryStrip}</p>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 space-y-4">
              {/* Day images */}
              {allImages.length > 0 && (
                <div className={`grid gap-2 ${allImages.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {allImages.map((src, i) => (
                    <div key={i} className="relative h-40 rounded-lg overflow-hidden bg-muted">
                      <Image src={src} alt={`${day.title} ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed">{day.description}</p>

              {/* Alert note */}
              {day.alert && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">{day.alert}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {day.meals?.breakfast && <Badge variant="outline" className="text-xs">🍳 Breakfast</Badge>}
                {day.meals?.lunch && <Badge variant="outline" className="text-xs">🥗 Lunch</Badge>}
                {day.meals?.dinner && <Badge variant="outline" className="text-xs">🍽️ Dinner</Badge>}
                {day.accommodation && <Badge variant="secondary" className="text-xs">🏨 {day.accommodation}</Badge>}
                {day.elevation != null && <Badge variant="outline" className="text-xs">📍 {day.elevation.toLocaleString()}m</Badge>}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
