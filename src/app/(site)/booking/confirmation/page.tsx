import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle2, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Confirmed" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  await connection();
  const { ref } = await searchParams;
  if (!ref) notFound();

  const booking = await db.booking.findUnique({
    where: { bookingRef: ref },
    include: {
      package: { select: { title: true, slug: true } },
      departure: { select: { departureDate: true, returnDate: true } },
      travellers: { where: { isPrimary: true }, take: 1 },
    },
  });
  if (!booking) notFound();

  const primary = booking.travellers[0];

  return (
    <main className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <p className="text-muted-foreground mt-1">
          Thank you{primary ? `, ${primary.firstName}` : ""}. We&apos;ll be in touch shortly.
        </p>
      </div>

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
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>Status: <span className="font-medium text-green-600">{booking.status}</span></span>
        </div>
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="font-bold text-lg">
            {booking.currency} {(booking.totalAmount / 100).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        A confirmation email will be sent to {primary?.email ?? "your email address"}.
      </p>

      <div className="flex justify-center gap-3">
        <Link href="/destinations"><Button variant="outline">Explore More</Button></Link>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    </main>
  );
}
