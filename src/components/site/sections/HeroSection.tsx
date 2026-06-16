import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";
import { HeroCarousel } from "./HeroCarousel";

interface HeroSlide {
  imageUrl: string;
  headline?: string;
  subheadline?: string;
}

interface HeroData {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  slides?: HeroSlide[];
}

export async function HeroSection({ data }: { data: HeroData }) {
  const settings = await getSettings();

  const headline = data.headline || settings.brand.name;
  const subheadline = data.subheadline || settings.brand.tagline;
  const ctaLabel = data.ctaLabel || "Explore Destinations";
  const ctaHref = data.ctaHref || "/destinations";

  // Multi-slide carousel mode
  const slides = data.slides?.filter((s) => s.imageUrl);
  if (slides && slides.length > 0) {
    return (
      <section className="relative">
        <HeroCarousel
          slides={slides}
          fallbackHeadline={headline}
          fallbackSubheadline={subheadline}
        />
        {/* CTA buttons overlay */}
        <div className="absolute bottom-20 sm:bottom-24 inset-x-0 z-20">
          <AnimatedSection delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={ctaHref}>
                <Button size="lg" className="shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform">
                  {ctaLabel}
                </Button>
              </Link>
              <Link href="/propose">
                <Button size="lg" variant="secondary" className="shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform">
                  Propose Your Trip
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  // Single-image fallback (backward compatible with existing data)
  const hasImage = !!data.imageUrl;

  return (
    <section className="relative min-h-[75vh] flex items-center">
      {hasImage ? (
        <>
          <Image
            src={data.imageUrl!}
            alt={headline}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
      )}

      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <AnimatedSection>
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight ${hasImage ? "text-white drop-shadow-lg" : ""}`}
          >
            {headline}
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <p
            className={`mt-4 text-lg sm:text-xl md:text-2xl ${hasImage ? "text-white/90 drop-shadow" : "text-muted-foreground"}`}
          >
            {subheadline}
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.3}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={ctaHref}>
              <Button size="lg" className="shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform">
                {ctaLabel}
              </Button>
            </Link>
            <Link href="/propose">
              <Button size="lg" variant={hasImage ? "secondary" : "outline"} className="shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform">
                Propose Your Trip
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
