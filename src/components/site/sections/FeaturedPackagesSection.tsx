import Link from "next/link";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";
import { FeaturedPackagesCarousel } from "./FeaturedPackagesCarousel";

interface FeaturedPackagesData {
  title?: string;
  subtitle?: string;
  limit?: number;
}

async function getFeaturedPackages(limit: number) {
  "use cache";
  cacheTag("packages");
  return db.package.findMany({
    where: { status: "PUBLISHED", featured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true } },
      tripTypes: { select: { name: true } },
    },
  });
}

export async function FeaturedPackagesSection({ data }: { data: FeaturedPackagesData }) {
  const limit = data.limit ?? 6;
  const packages = await getFeaturedPackages(limit);

  if (packages.length === 0) return null;

  const serialized = packages.map((pkg) => ({
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    subtitle: pkg.subtitle,
    coverImage: pkg.coverImage,
    durationDays: pkg.durationDays,
    durationNights: pkg.durationNights,
    priceFrom: pkg.priceFrom,
    currency: pkg.currency,
    destinationName: pkg.destination.name,
    tripTypeNames: pkg.tripTypes.map((t) => t.name),
  }));

  return (
    <section className="container mx-auto px-4 py-20">
      <AnimatedSection>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {data.title ?? "Featured Packages"}
            </h2>
            {data.subtitle && (
              <p className="text-muted-foreground mt-1">{data.subtitle}</p>
            )}
          </div>
          <Link
            href="/packages"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all &rarr;
          </Link>
        </div>
      </AnimatedSection>

      <FeaturedPackagesCarousel packages={serialized} />
    </section>
  );
}
