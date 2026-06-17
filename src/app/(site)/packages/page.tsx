import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { PackageCard } from "@/components/site/PackageCard";
import { PackageFilters } from "@/components/site/PackageFilters";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Packages | ${settings.brand.name}`,
    description: "Browse our curated travel experiences across the globe.",
  };
}

function parseDuration(d: string): { min: number; max: number } | null {
  if (d === "15+") return { min: 15, max: 999 };
  const parts = d.split("-");
  const lo = Number(parts[0]);
  const hi = Number(parts[1]);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  return { min: lo, max: hi };
}

type SortKey = "newest" | "price-asc" | "price-desc" | "duration-asc" | "duration-desc";

function buildOrderBy(sort: SortKey): Prisma.PackageOrderByWithRelationInput {
  switch (sort) {
    case "price-asc": return { priceFrom: "asc" };
    case "price-desc": return { priceFrom: "desc" };
    case "duration-asc": return { durationDays: "asc" };
    case "duration-desc": return { durationDays: "desc" };
    default: return { createdAt: "desc" };
  }
}

interface SearchParams {
  destination?: string;
  tripType?: string;
  duration?: string;
  sort?: string;
  q?: string;
}

export default async function PackagesPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();
  const sp = await searchParamsPromise;

  // Build dynamic where
  const where: Prisma.PackageWhereInput = { status: "PUBLISHED" };

  if (sp.destination) {
    where.destination = { slug: sp.destination };
  }
  if (sp.tripType) {
    where.tripTypes = { some: { slug: sp.tripType } };
  }
  const dur = sp.duration ? parseDuration(sp.duration) : null;
  if (dur) {
    where.durationDays = { gte: dur.min, lte: dur.max };
  }
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q } },
      { destination: { name: { contains: sp.q } } },
    ];
  }

  const sort = (sp.sort as SortKey) || "newest";

  // Parallel fetch: packages + filter options
  const [packages, destinations, tripTypes] = await Promise.all([
    db.package.findMany({
      where,
      orderBy: buildOrderBy(sort),
      include: {
        destination: { select: { name: true } },
        tripTypes: { select: { name: true } },
      },
    }),
    db.destination.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    db.tripType.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">All Packages</h1>
        <p className="text-muted-foreground mt-2">
          Browse our curated travel experiences across the globe.
        </p>
      </div>

      <Suspense>
        <PackageFilters
          destinations={destinations.map((d) => ({ value: d.slug, label: d.name }))}
          tripTypes={tripTypes.map((t) => ({ value: t.slug, label: t.name }))}
          totalCount={packages.length}
        />
      </Suspense>

      {packages.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-lg">
            No packages match your filters.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
