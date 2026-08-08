import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/site/booking/BookingFlow";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Book Your Trip" };

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ packageId?: string; departureId?: string; ref?: string }>;
}) {
  await connection();
  const { packageId, departureId, ref } = await searchParams;

  if (!packageId) notFound();

  // Resuming a previous attempt (from /booking/failed's "Try Again") — only
  // honor it if the booking is still PENDING and actually belongs to this
  // package/departure, so a stale or mismatched ref just falls through to a
  // normal fresh booking instead of resuming the wrong one.
  const resumeBooking = ref
    ? await db.booking.findUnique({
        where: { bookingRef: ref },
        select: { id: true, bookingRef: true, status: true, totalAmount: true, packageId: true, departureId: true },
      })
    : null;
  const resume =
    resumeBooking &&
    resumeBooking.status === "PENDING" &&
    resumeBooking.packageId === packageId &&
    (departureId ? resumeBooking.departureId === departureId : true)
      ? { bookingId: resumeBooking.id, bookingRef: resumeBooking.bookingRef, totalAmount: resumeBooking.totalAmount }
      : undefined;

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
        resume={resume}
      />
    </main>
  );
}
