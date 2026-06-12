import { connection } from "next/server";
import { db } from "@/lib/db";
import { PackageCard } from "@/components/site/PackageCard";
import { cacheTag } from "next/cache";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Packages" };

async function getPackages() {
  "use cache";
  cacheTag("packages");
  return db.package.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true } },
      tripTypes: { select: { name: true } },
    },
  });
}

export default async function PackagesPage() {
  await connection();
  const packages = await getPackages();

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">All Packages</h1>
        <p className="text-muted-foreground mt-2">
          Browse our curated travel experiences across the globe.
        </p>
      </div>

      {packages.length === 0 ? (
        <p className="text-center text-muted-foreground">No packages available yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
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
                destinationName: pkg.destination.name,
                tripTypeNames: pkg.tripTypes.map((t) => t.name),
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
