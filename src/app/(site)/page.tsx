import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PackageCard } from "@/components/site/PackageCard";
import { cacheTag } from "next/cache";
import { Button } from "@/components/ui/button";

async function getFeaturedPackages() {
  "use cache";
  cacheTag("packages");
  return db.package.findMany({
    where: { status: "PUBLISHED", featured: true },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { destination: { select: { name: true } }, tripTypes: { select: { name: true } } },
  });
}

async function getPublishedDestinations() {
  "use cache";
  cacheTag("destinations");
  return db.destination.findMany({
    where: { status: "PUBLISHED" },
    take: 8,
    orderBy: { order: "asc" },
  });
}

export default async function HomePage() {
  await connection();
  const [settings, featuredPackages, destinations] = await Promise.all([
    getSettings(),
    getFeaturedPackages(),
    getPublishedDestinations(),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{settings.brand.name}</h1>
          <p className="mt-4 text-xl md:text-2xl text-muted-foreground">{settings.brand.tagline}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/destinations"><Button size="lg">Explore Destinations</Button></Link>
            <Link href="/propose"><Button size="lg" variant="outline">Propose Your Trip</Button></Link>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      {featuredPackages.length > 0 && (
        <section className="container mx-auto px-4 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Packages</h2>
              <p className="text-muted-foreground text-sm mt-1">Handpicked journeys for every traveller</p>
            </div>
            <Link href="/destinations" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
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
        </section>
      )}

      {/* Destinations grid */}
      {destinations.length > 0 && (
        <section className="bg-muted/30 py-14">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Explore Destinations</h2>
              <p className="text-muted-foreground text-sm mt-1">From the Himalayas to tropical shores</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {destinations.map((dest) => (
                <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow">
                  <div className="relative h-28 bg-muted overflow-hidden">
                    {dest.imageUrl ? (
                      <Image src={dest.imageUrl} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">{dest.name}</div>
                    )}
                  </div>
                  <p className="p-3 font-semibold text-sm">{dest.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Propose CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Can&apos;t find what you&apos;re looking for?</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">Tell us your dream destination and we&apos;ll craft a personalised itinerary just for you.</p>
        <Link href="/propose" className="mt-6 inline-block">
          <Button size="lg">Propose Your Trip</Button>
        </Link>
      </section>
    </main>
  );
}
