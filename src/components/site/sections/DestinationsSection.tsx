import Link from "next/link";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";
import { SmartMedia } from "../SmartMedia";

interface DestinationsData {
  title?: string;
  subtitle?: string;
}

async function getPublishedDestinations() {
  "use cache";
  cacheTag("destinations");
  return db.destination.findMany({
    where: { status: "PUBLISHED" },
    take: 8,
    orderBy: { order: "asc" },
    include: {
      _count: { select: { packages: { where: { status: "PUBLISHED" } } } },
    },
  });
}

export async function DestinationsSection({ data, immersive = false }: { data: DestinationsData; immersive?: boolean }) {
  const destinations = await getPublishedDestinations();

  if (destinations.length === 0) return null;

  return (
    <section className={`py-20 ${immersive ? "" : "bg-muted/30"}`}>
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              Where to next
            </p>
            <h2 className={`text-3xl sm:text-4xl font-semibold tracking-tight ${immersive ? "text-white drop-shadow" : ""}`}>
              {data.title ?? "Explore Destinations"}
            </h2>
            <div className="mx-auto mt-5 h-px w-12 bg-accent/60" />
            {data.subtitle && (
              <p className={`mt-5 ${immersive ? "text-white/80" : "text-muted-foreground"}`}>{data.subtitle}</p>
            )}
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {destinations.map((dest, i) => (
            <AnimatedSection key={dest.id} delay={i * 0.06}>
              <Link
                href={`/destinations/${dest.slug}`}
                className="group relative block rounded-2xl overflow-hidden h-44 sm:h-52"
              >
                {dest.imageUrl ? (
                  <SmartMedia
                    src={dest.imageUrl}
                    alt={dest.name}
                    fill
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                )}

                {/* Gradient overlay — always visible, darkens on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-500" />

                {/* Text overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-white font-bold text-base sm:text-lg leading-tight drop-shadow-sm">
                    {dest.name}
                  </h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    {dest._count.packages}{" "}
                    {dest._count.packages === 1 ? "package" : "packages"}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
