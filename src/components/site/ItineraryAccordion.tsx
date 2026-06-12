"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface Day {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean } | null;
  accommodation: string | null;
}

export function ItineraryAccordion({ days }: { days: Day[] }) {
  return (
    <Accordion multiple={false} className="space-y-2">
      {days.map((day) => (
        <AccordionItem key={day.id} value={day.id} className="border rounded-lg px-4">
          <AccordionTrigger className="text-left hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {day.dayNumber}
              </span>
              <span className="font-medium text-sm">{day.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{day.description}</p>
            <div className="flex flex-wrap gap-2">
              {day.meals?.breakfast && <Badge variant="outline" className="text-xs">🍳 Breakfast</Badge>}
              {day.meals?.lunch && <Badge variant="outline" className="text-xs">🥗 Lunch</Badge>}
              {day.meals?.dinner && <Badge variant="outline" className="text-xs">🍽️ Dinner</Badge>}
              {day.accommodation && <Badge variant="secondary" className="text-xs">🏨 {day.accommodation}</Badge>}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
