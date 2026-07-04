import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PackageEditor } from "@/components/admin/PackageEditor";

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;

  const [pkg, destinations, tripTypes] = await Promise.all([
    db.package.findUnique({
      where: { id },
      include: {
        tripTypes: { select: { id: true } },
        itinerary: { orderBy: { dayNumber: "asc" } },
        departures: { orderBy: { departureDate: "asc" } },
      },
    }),
    db.destination.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.tripType.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!pkg) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Package</h1>
        <p className="text-muted-foreground text-sm">{pkg.title}</p>
      </div>
      <PackageEditor
        destinations={destinations}
        tripTypes={tripTypes}
        package={{
          id: pkg.id,
          slug: pkg.slug,
          title: pkg.title,
          subtitle: pkg.subtitle ?? "",
          destinationId: pkg.destinationId,
          tripTypeIds: pkg.tripTypes.map((t) => t.id),
          durationDays: pkg.durationDays,
          durationNights: pkg.durationNights,
          priceFrom: pkg.priceFrom,
          currency: pkg.currency,
          departureCity: pkg.departureCity ?? "",
          priceBasis: pkg.priceBasis ?? "",
          minGroupSize: pkg.minGroupSize,
          validUntil: pkg.validUntil?.toISOString().split("T")[0] ?? "",
          terms: pkg.terms ?? "",
          description: pkg.description ?? "",
          highlights: pkg.highlights as string[],
          inclusions: pkg.inclusions as string[],
          exclusions: pkg.exclusions as string[],
          galleryImages: pkg.galleryImages as string[],
          coverImage: pkg.coverImage ?? "",
          metaTitle: pkg.metaTitle ?? "",
          metaDescription: pkg.metaDescription ?? "",
          featured: pkg.featured,
          status: pkg.status,
          itinerary: pkg.itinerary.map((d) => ({
            id: d.id,
            dayNumber: d.dayNumber,
            title: d.title,
            subtitle: d.subtitle ?? "",
            summaryStrip: d.summaryStrip ?? "",
            description: d.description,
            meals: d.meals as { breakfast: boolean; lunch: boolean; dinner: boolean } | null,
            accommodation: d.accommodation ?? "",
            imageUrl: d.imageUrl ?? "",
            images: d.images as string[] ?? [],
            alert: d.alert ?? "",
          })),
          departures: pkg.departures.map((d) => ({
            id: d.id,
            departureDate: d.departureDate.toISOString().split("T")[0]!,
            returnDate: d.returnDate.toISOString().split("T")[0]!,
            maxSeats: d.maxSeats,
            bookedSeats: d.bookedSeats,
            priceOverride: d.priceOverride ?? undefined,
            currency: d.currency,
          })),
        }}
      />
    </div>
  );
}
