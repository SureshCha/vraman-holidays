import { cacheTag } from "next/cache";
import { SmartMedia } from "@/components/site/SmartMedia";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { DestinationTabs, type DestinationCardData } from "@/components/site/DestinationTabs";
import type { Metadata } from "next";

async function getDestinations(query: string) {
  "use cache";
  cacheTag("destinations");
  return db.destination.findMany({
    where: {
      status: "PUBLISHED",
      ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
    },
    orderBy: { order: "asc" },
    include: { _count: { select: { packages: { where: { status: "PUBLISHED" } } } } },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Destinations | ${settings.brand.name}`,
    description:
      "Discover Nepal and the world with Vraman Holidays — handpicked destinations that inspire, transform, and create memories that last a lifetime.",
  };
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const [settings, destinations] = await Promise.all([getSettings(), getDestinations(query)]);

  const toCard = (d: (typeof destinations)[number]): DestinationCardData => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    tagline: d.tagline,
    imageUrl: d.imageUrl,
    packageCount: d._count.packages,
  });

  const nepal = destinations.filter((d) => d.region === "NEPAL").map(toCard);
  const world = destinations.filter((d) => d.region !== "NEPAL").map(toCard);

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Intro (hidden while searching) */}
      {!query && (
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Destinations</h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Every destination has a story. Some inspire adventure. Some awaken faith. Some reconnect
            us with nature, culture, and ourselves.
          </p>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Whether you are exploring the timeless beauty of Nepal or venturing across international
            borders, {settings.brand.name} helps you discover destinations that inspire, transform,
            and create memories that last a lifetime.
          </p>
          <p className="text-base font-medium text-primary mt-4">Propose Your Destination&trade;</p>
        </div>
      )}

      {query ? (
        <SearchResults query={query} nepal={nepal} world={world} />
      ) : (
        <DestinationTabs nepal={nepal} world={world} />
      )}
    </main>
  );
}

/** Flat, both-groups-visible view used when arriving via search. */
function SearchResults({
  query,
  nepal,
  world,
}: {
  query: string;
  nepal: DestinationCardData[];
  world: DestinationCardData[];
}) {
  const total = nepal.length + world.length;
  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">
          Showing results for &ldquo;<span className="font-medium text-foreground">{query}</span>&rdquo;
        </span>
        <Link href="/destinations" className="text-primary hover:underline text-xs">
          Clear
        </Link>
      </div>

      {total === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No destinations found matching &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-12">
          {nepal.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Discover Nepal</h2>
              <CardGrid items={nepal} />
            </section>
          )}
          {world.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Discover the World</h2>
              <CardGrid items={world} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function CardGrid({ items }: { items: DestinationCardData[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((dest) => (
        <Link
          key={dest.id}
          href={`/destinations/${dest.slug}`}
          className="group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow"
        >
          <div className="relative h-40 bg-muted overflow-hidden">
            {dest.imageUrl ? (
              <SmartMedia
                src={dest.imageUrl}
                alt={dest.name}
                fill
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
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
            {dest.tagline && <p className="text-xs text-primary mt-0.5 line-clamp-2">{dest.tagline}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {dest.packageCount} package{dest.packageCount !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
