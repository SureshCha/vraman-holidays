import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { BookingEditForm } from "./BookingEditForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BookingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await requireAdmin();
  if (!session) notFound();

  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      package: {
        select: {
          id: true,
          title: true,
          departures: { orderBy: { departureDate: "asc" } },
        },
      },
      travellers: { orderBy: { isPrimary: "desc" } },
      payments: {
        orderBy: { createdAt: "desc" },
        select: { id: true, gateway: true, status: true, gatewayTxnId: true, amount: true, currency: true, createdAt: true },
      },
    },
  });
  if (!booking) notFound();

  // Serialise dates to strings for the client component
  const serialised = {
    id: booking.id,
    bookingRef: booking.bookingRef,
    packageTitle: booking.package.title,
    status: booking.status,
    departureId: booking.departureId ?? null,
    totalAmount: booking.totalAmount,
    discountAmount: booking.discountAmount,
    currency: booking.currency,
    travelInsurance: booking.travelInsurance,
    notes: booking.notes ?? "",
    travellers: booking.travellers.map((t) => ({
      id: t.id,
      isPrimary: t.isPrimary,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phone: t.phone,
      nationality: t.nationality ?? "",
      passportNo: t.passportNo ?? "",
      dob: t.dob ? format(t.dob, "yyyy-MM-dd") : "",
      specialRequests: t.specialRequests ?? "",
    })),
    departures: booking.package.departures.map((d) => ({
      id: d.id,
      label: `${format(d.departureDate, "dd MMM yyyy")} → ${format(d.returnDate, "dd MMM yyyy")}`,
    })),
    payments: booking.payments.map((p) => ({
      id: p.id,
      gateway: p.gateway,
      status: p.status,
      gatewayTxnId: p.gatewayTxnId ?? null,
      amount: p.amount,
      currency: p.currency,
      createdAt: p.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/admin/bookings/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Booking</h1>
          <p className="text-muted-foreground text-sm">
            {booking.bookingRef} — {booking.package.title}
          </p>
        </div>
      </div>

      <BookingEditForm booking={serialised} />
    </div>
  );
}
