import Image from "next/image";
import Link from "next/link";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Star, Quote, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

async function getTestimonials() {
  "use cache";
  cacheTag("testimonials");
  return db.testimonial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Stories from the Journey | ${settings.brand.name}`,
    description:
      "Real stories from travellers who explored Nepal and beyond with Vraman Holidays — reviews, ratings, and memories worth sharing.",
  };
}

export default async function ReviewsPage() {
  const [settings, testimonials] = await Promise.all([getSettings(), getTestimonials()]);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/[0.06] to-background py-24 sm:py-28">
        <div className="container relative mx-auto px-4 text-center max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-5">
            Reviews &amp; Testimonials
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-balance">
            Stories from the Journey
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-accent/60" />
          <p className="text-base sm:text-lg text-muted-foreground mt-6 leading-relaxed">
            Every journey leaves a story. These are the words, smiles, and memories our travellers
            carried home from Nepal and beyond with {settings.brand.name}.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        {testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground">Stories coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="relative rounded-2xl border bg-card p-7 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Quote className="h-8 w-8 text-accent/30 shrink-0" />
                <div className="flex items-center gap-1 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < t.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <blockquote className="text-sm text-muted-foreground leading-relaxed mt-4 flex-1">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t">
                  {t.imageUrl ? (
                    <Image
                      src={t.imageUrl}
                      alt={t.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/10"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    {t.location && <p className="text-xs text-muted-foreground">{t.location}</p>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16 max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight">Travelled with us?</h2>
          <p className="text-muted-foreground mt-3 mb-6">
            We&apos;d love to hear your story — and share it with future travellers.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-primary-foreground font-medium shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
          >
            Share your experience
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
