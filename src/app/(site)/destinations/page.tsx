import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Destinations | ${settings.brand.name}`,
    description: "Explore our hand-picked destinations across the world.",
  };
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const destinations = await db.destination.findMany({
    where: {
      status: "PUBLISHED",
      ...(query
        ? { name: { contains: query, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { packages: { where: { status: "PUBLISHED" } } } },
    },
  });

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Explore Destinations</h1>
        <p className="text-muted-foreground mt-2">Discover amazing places across the globe</p>
      </div>

      {query && (
        <div className="mb-6 flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">
            Showing results for &ldquo;<span className="font-medium text-foreground">{query}</span>&rdquo;
          </span>
          <Link href="/destinations" className="text-primary hover:underline text-xs">
            Clear
          </Link>
        </div>
      )}

      {destinations.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No destinations found{query ? ` matching "${query}"` : ""}.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.slug}`}
              className="group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow"
            >
              <div className="relative h-36 bg-muted overflow-hidden">
                {dest.imageUrl ? (
                  <Image
                    src={dest.imageUrl}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    {dest.name}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm">{dest.name}</p>
                <p className="text-xs text-muted-foreground">
                  {dest._count.packages} package{dest._count.packages !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
