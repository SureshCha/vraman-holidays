import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { Star } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

interface TestimonialsData {
  title?: string;
  limit?: number;
}

async function getTestimonials(limit: number) {
  "use cache";
  cacheTag("testimonials");
  return db.testimonial.findMany({
    where: { status: "PUBLISHED" },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function TestimonialsSection({ data }: { data: TestimonialsData }) {
  const limit = data.limit ?? 6;
  const testimonials = await getTestimonials(limit);

  if (testimonials.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-14">
      <AnimatedSection>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">{data.title ?? "What Our Travellers Say"}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border bg-card p-6 space-y-3"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              &ldquo;{t.content}&rdquo;
            </p>
            <div>
              <p className="font-semibold text-sm">{t.name}</p>
              {t.location && (
                <p className="text-xs text-muted-foreground">{t.location}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      </AnimatedSection>
    </section>
  );
}
