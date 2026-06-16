import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

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

  const serialized = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    rating: t.rating,
    content: t.content,
    imageUrl: t.imageUrl,
  }));

  return (
    <section className="container mx-auto px-4 py-20">
      <AnimatedSection>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            {data.title ?? "What Our Travellers Say"}
          </h2>
        </div>
      </AnimatedSection>

      <TestimonialsCarousel testimonials={serialized} />
    </section>
  );
}
