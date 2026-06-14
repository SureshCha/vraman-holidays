import Link from "next/link";
import Image from "next/image";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";

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
  });
}

export async function DestinationsSection({ data }: { data: DestinationsData }) {
  const destinations = await getPublishedDestinations();

  if (destinations.length === 0) return null;

  return (
    <section className="bg-muted/30 py-14">
      <div className="container mx-auto px-4">
        <AnimatedSection>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">{data.title ?? "Explore Destinations"}</h2>
          {data.subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{data.subtitle}</p>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.slug}`}
              className="group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow"
            >
              <div className="relative h-28 bg-muted overflow-hidden">
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
              <p className="p-3 font-semibold text-sm">{dest.name}</p>
            </Link>
          ))}
        </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
