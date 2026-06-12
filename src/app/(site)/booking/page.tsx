import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/site/booking/BookingFlow";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Book Your Trip" };

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ packageId?: string; departureId?: string }>;
}) {
  await connection();
  const { packageId, departureId } = await searchParams;

  if (!packageId) notFound();

  const pkg = await db.package.findUnique({
    where: { id: packageId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      durationDays: true,
      durationNights: true,
      priceFrom: true,
      currency: true,
      destination: { select: { name: true } },
    },
  });
  if (!pkg) notFound();

  let departure = null;
  if (departureId) {
    departure = await db.packageDeparture.findUnique({
      where: { id: departureId },
      select: {
        id: true,
        departureDate: true,
        returnDate: true,
        maxSeats: true,
        bookedSeats: true,
        priceOverride: true,
        currency: true,
      },
    });
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-2xl">
      <BookingFlow
        package={{
          id: pkg.id,
          title: pkg.title,
          slug: pkg.slug,
          coverImage: pkg.coverImage ?? "",
          durationDays: pkg.durationDays,
          durationNights: pkg.durationNights,
          priceFrom: pkg.priceFrom,
          currency: pkg.currency,
          destinationName: pkg.destination.name,
        }}
        departure={
          departure
            ? {
                id: departure.id,
                departureDate: departure.departureDate.toISOString(),
                returnDate: departure.returnDate.toISOString(),
                maxSeats: departure.maxSeats,
                bookedSeats: departure.bookedSeats,
                priceOverride: departure.priceOverride ?? undefined,
                currency: departure.currency,
              }
            : undefined
        }
      />
    </main>
  );
}
