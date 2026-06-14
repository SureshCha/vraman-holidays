import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";

interface HeroData {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
}

export async function HeroSection({ data }: { data: HeroData }) {
  const settings = await getSettings();

  const headline = data.headline || settings.brand.name;
  const subheadline = data.subheadline || settings.brand.tagline;
  const ctaLabel = data.ctaLabel || "Explore Destinations";
  const ctaHref = data.ctaHref || "/destinations";
  const hasImage = !!data.imageUrl;

  return (
    <section className="relative min-h-[70vh] flex items-center">
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
          <div className="absolute inset-0 bg-black/50" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
      )}

      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <AnimatedSection>
          <h1
            className={`text-4xl md:text-6xl font-bold tracking-tight ${hasImage ? "text-white" : ""}`}
          >
            {headline}
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={0.15}>
          <p
            className={`mt-4 text-xl md:text-2xl ${hasImage ? "text-white/90" : "text-muted-foreground"}`}
          >
            {subheadline}
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.3}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={ctaHref}>
              <Button size="lg">{ctaLabel}</Button>
            </Link>
            <Link href="/propose">
              <Button size="lg" variant={hasImage ? "secondary" : "outline"}>
                Propose Your Trip
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
