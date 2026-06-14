import Link from "next/link";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { PackageCard } from "@/components/site/PackageCard";
import { AnimatedSection } from "./AnimatedSection";

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

  return (
    <section className="container mx-auto px-4 py-14">
      <AnimatedSection>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{data.title ?? "Featured Packages"}</h2>
          {data.subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{data.subtitle}</p>
          )}
        </div>
        <Link href="/destinations" className="text-sm text-primary hover:underline">
          View all &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            variant="featured"
            package={{
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
            }}
          />
        ))}
      </div>
      </AnimatedSection>
    </section>
  );
}
