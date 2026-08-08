import { connection } from "next/server";
import { db } from "@/lib/db";
import { XCircle, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Failed" };

export default async function FailedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; reason?: string }>;
}) {
  await connection();
  const { ref, reason } = await searchParams;

  const booking = ref
    ? await db.booking.findUnique({
        where: { bookingRef: ref },
        select: {
          bookingRef: true,
          status: true,
          totalAmount: true,
          currency: true,
          package: { select: { id: true, title: true } },
          departure: { select: { id: true, departureDate: true, returnDate: true } },
        },
      })
    : null;

  // Only offer a retry when the booking is still retryable — a stale ref (already
  // confirmed, or auto-cancelled by the 24h expiry cron) gets the generic fallback
  // below instead of a broken link.
  const canRetry = booking?.status === "PENDING";

  return (
    <main className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
      <div className="flex justify-center">
        <XCircle className="h-16 w-16 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground mt-1">
          {reason === "amount_mismatch"
            ? "The payment amount didn't match your booking. No charges have been made."
            : "Your payment could not be processed. No charges have been made."}
        </p>
      </div>

      {booking && (
        <div className="border rounded-xl p-6 text-left space-y-4 bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Booking Reference</p>
            <p className="font-mono font-bold text-xl">{booking.bookingRef}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{booking.package.title}</span>
          </div>
          {booking.departure && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                {format(booking.departure.departureDate, "dd MMM yyyy")} —{" "}
                {format(booking.departure.returnDate, "dd MMM yyyy")}
              </span>
            </div>
          )}
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-bold text-lg">
              {booking.currency} {(booking.totalAmount / 100).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {booking && !canRetry && (
        <p className="text-sm text-muted-foreground">
          This booking is no longer available to retry — please start a new booking below.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {canRetry && booking && (
          <Link
            href={`/booking?packageId=${booking.package.id}${booking.departure ? `&departureId=${booking.departure.id}` : ""}&ref=${booking.bookingRef}`}
          >
            <Button>Try Again</Button>
          </Link>
        )}
        <Link href="/destinations"><Button variant="outline">Browse Packages</Button></Link>
        <Link href="/propose"><Button variant={canRetry ? "outline" : "default"}>Contact Us</Button></Link>
      </div>
    </main>
  );
}
