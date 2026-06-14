import { db } from "@/lib/db";
import { PackageCard } from "./PackageCard";

interface Props {
  destinationId: string;
  currentPackageId: string;
}

export async function RelatedPackages({ destinationId, currentPackageId }: Props) {
  const packages = await db.package.findMany({
    where: {
      destinationId,
      status: "PUBLISHED",
      NOT: { id: currentPackageId },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true } },
      tripTypes: { select: { name: true } },
    },
  });

  if (packages.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </section>
  );
}
