import { connection } from "next/server";
import Image from "next/image";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PackageCard } from "@/components/site/PackageCard";
import { cacheTag } from "next/cache";
import type { Metadata } from "next";

async function getDestination(slug: string) {
  "use cache";
  cacheTag("destinations");
  return db.destination.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      packages: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: { tripTypes: { select: { name: true } } },
      },
    },
  });
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestination(slug);
  if (!dest) return {};
  return { title: dest.name, description: dest.description ?? `Explore ${dest.name} travel packages.` };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) notFound();

  return (
    <main>
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-muted overflow-hidden">
        {destination.imageUrl && (
          <Image src={destination.imageUrl} alt={destination.name} fill className="object-cover" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{destination.name}</h1>
            {destination.description && (
              <p className="text-white/80 mt-2 max-w-xl text-sm">{destination.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-6">
          {destination.packages.length} Package{destination.packages.length !== 1 ? "s" : ""} in {destination.name}
        </h2>
        {destination.packages.length === 0 ? (
          <p className="text-muted-foreground">No packages available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {destination.packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
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
                  destinationName: destination.name,
                  tripTypeNames: pkg.tripTypes.map((t) => t.name),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
