import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { cacheTag } from "next/cache";
import type { Metadata } from "next";

async function getDestinations() {
  "use cache";
  cacheTag("destinations");
  return db.destination.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: { _count: { select: { packages: { where: { status: "PUBLISHED" } } } } },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Destinations | ${settings.brand.name}`,
    description: "Explore our hand-picked destinations across the world.",
  };
}

export default async function DestinationsPage() {
  await connection();
  const destinations = await getDestinations();

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Explore Destinations</h1>
        <p className="text-muted-foreground mt-2">Discover amazing places across the globe</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {destinations.map((dest) => (
          <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow">
            <div className="relative h-36 bg-muted overflow-hidden">
              {dest.imageUrl ? (
                <Image src={dest.imageUrl} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">{dest.name}</div>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm">{dest.name}</p>
              <p className="text-xs text-muted-foreground">{dest._count.packages} package{dest._count.packages !== 1 ? "s" : ""}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
