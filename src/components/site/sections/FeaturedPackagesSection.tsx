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
      departures: {
        where: { departureDate: { gte: new Date() } },
        select: { maxSeats: true, bookedSeats: true },
        take: 5,
      },
    },
  });
}

export async function FeaturedPackagesSection({ data }: { data: FeaturedPackagesData }) {
  const limit = data.limit ?? 6;
  const packages = await getFeaturedPackages(limit);

  if (packages.length === 0) return null;

  const serialized = packages.map((pkg) => {
    // Compute urgency: min seats left across upcoming departures
    const minSeatsLeft = pkg.departures.length > 0
      ? Math.min(...pkg.departures.map((d) => d.maxSeats - d.bookedSeats))
      : undefined;
    // "Trending" if >50% booked across departures
    const totalBooked = pkg.departures.reduce((s, d) => s + d.bookedSeats, 0);
    const totalSeats = pkg.departures.reduce((s, d) => s + d.maxSeats, 0);
    const isTrending = totalSeats > 0 && totalBooked / totalSeats > 0.5;

    return {
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
      seatsLeft: minSeatsLeft,
      isTrending,
    };
  });

  return (
    <section className="container mx-auto px-4 py-20">
      <AnimatedSection>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
              Curated for you
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {data.title ?? "Featured Packages"}
            </h2>
            {data.subtitle && (
              <p className="text-muted-foreground mt-2">{data.subtitle}</p>
            )}
          </div>
          <Link
            href="/packages"
            className="hidden sm:inline-block text-sm font-medium text-primary hover:underline shrink-0"
          >
            View all &rarr;
          </Link>
        </div>
      </AnimatedSection>

      <FeaturedPackagesCarousel packages={serialized} />
    </section>
  );
}
