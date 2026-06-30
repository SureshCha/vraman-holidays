import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import { MediaBackground } from "./MediaBackground";
import { safeMediaUrl } from "@/lib/media";

interface TestimonialsData {
  title?: string;
  limit?: number;
  backgroundImage?: string;
  backgroundVideo?: string;
  posterUrl?: string;
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

export async function TestimonialsSection({ data, immersive = false }: { data: TestimonialsData; immersive?: boolean }) {
  const limit = data.limit ?? 6;
  const testimonials = await getTestimonials(limit);

  if (testimonials.length === 0) return null;

  const serialized = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    rating: t.rating,
    content: t.content,
    imageUrl: t.imageUrl,
  }));

  const bg = safeMediaUrl(data.backgroundVideo) || safeMediaUrl(data.backgroundImage);
  const dark = !!bg || immersive;

  return (
    <section className="relative overflow-hidden py-20">
      {bg && !immersive && (
        <MediaBackground
          imageUrl={data.backgroundImage}
          videoUrl={data.backgroundVideo}
          posterUrl={data.posterUrl}
          overlayClassName="bg-black/60"
        />
      )}
      <div className="relative z-10 container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              Loved by travellers
            </p>
            <h2 className={`text-3xl sm:text-4xl font-semibold tracking-tight ${dark ? "text-white drop-shadow" : ""}`}>
              {data.title ?? "What Our Travellers Say"}
            </h2>
            <div className="mx-auto mt-5 h-px w-12 bg-accent/60" />
          </div>
        </AnimatedSection>

        <TestimonialsCarousel testimonials={serialized} />
      </div>
    </section>
  );
}
