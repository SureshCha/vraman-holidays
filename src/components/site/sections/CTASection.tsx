import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";

interface CTAData {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  socialProof?: string;
  imageUrl?: string;
}

export function CTASection({ data }: { data: CTAData }) {
  // Only accept http(s) or root-relative image URLs.
  const img = data.imageUrl && /^(https?:\/\/|\/)/.test(data.imageUrl) ? data.imageUrl : null;
  const hasImage = !!img;
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div
          className={`relative overflow-hidden rounded-3xl px-6 py-16 sm:py-20 text-center text-primary-foreground ${hasImage ? "bg-cover bg-center" : "bg-gradient-to-br from-primary via-primary/90 to-primary/70"}`}
          style={hasImage ? { backgroundImage: `url("${img}")` } : undefined}
        >
          {hasImage && <div className="absolute inset-0 bg-black/55" />}
          <div className="relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {data.title ?? "Can\u2019t find what you\u2019re looking for?"}
            </h2>
            {data.subtitle && (
              <p className="mt-3 text-primary-foreground/80 max-w-lg mx-auto text-base sm:text-lg">
                {data.subtitle}
              </p>
            )}
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <Link
              href={data.ctaHref ?? "/propose"}
              className="mt-8 inline-block"
            >
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 py-6 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                {data.ctaLabel ?? "Propose Your Trip"}
              </Button>
            </Link>
            {data.socialProof && (
              <p className="mt-4 text-xs text-primary-foreground/60">
                {data.socialProof}
              </p>
            )}
          </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
