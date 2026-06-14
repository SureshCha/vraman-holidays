import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";

interface CTAData {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function CTASection({ data }: { data: CTAData }) {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <AnimatedSection>
        <h2 className="text-2xl font-bold">
          {data.title ?? "Can\u2019t find what you\u2019re looking for?"}
        </h2>
        {data.subtitle && (
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">{data.subtitle}</p>
        )}
        <Link href={data.ctaHref ?? "/propose"} className="mt-6 inline-block">
          <Button size="lg">{data.ctaLabel ?? "Propose Your Trip"}</Button>
        </Link>
      </AnimatedSection>
    </section>
  );
}
