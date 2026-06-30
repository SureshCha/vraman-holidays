import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";
import { HeroCarousel } from "./HeroCarousel";
import { MediaBackground } from "./MediaBackground";
import { safeMediaUrl } from "@/lib/media";

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
  videoUrl?: string;
  posterUrl?: string;
  slides?: HeroSlide[];
}

export async function HeroSection({ data, immersive = false }: { data: HeroData; immersive?: boolean }) {
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

  // Single background-media fallback (backward compatible with existing data).
  // Accepts an image OR a video (muted autoplay loop on desktop, poster on mobile).
  const hasMedia = !!(safeMediaUrl(data.videoUrl) || safeMediaUrl(data.imageUrl));

  return (
    <section className={`relative flex items-center overflow-hidden ${hasMedia ? "min-h-[88vh]" : "min-h-[70vh]"}`}>
      {/* In immersive (continuous-banner) mode the fixed page backdrop already
          shows this media, so the hero stays transparent to avoid doubling it. */}
      {immersive ? null : hasMedia ? (
        // Bottom-weighted dark scrim keeps centred white text legible over any
        // photo/video (including light artwork).
        <MediaBackground
          imageUrl={data.imageUrl}
          videoUrl={data.videoUrl}
          posterUrl={data.posterUrl}
          priority
          overlayClassName="bg-gradient-to-t from-black/75 via-black/45 to-black/40"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
      )}

      <div className="container mx-auto px-4 py-24 text-center relative z-10">
        {settings.brand.philosophy && (
          <AnimatedSection>
            <p
              className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] mb-5 ${hasMedia ? "text-white/80" : "text-accent"}`}
            >
              {settings.brand.philosophy}
            </p>
          </AnimatedSection>
        )}
        <AnimatedSection>
          <h1
            className={`text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-balance max-w-4xl mx-auto ${hasMedia ? "text-white drop-shadow-lg" : ""}`}
          >
            {headline}
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <p
            className={`mt-6 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto ${hasMedia ? "text-white/90 drop-shadow" : "text-muted-foreground"}`}
          >
            {subheadline}
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.3}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
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
