import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { NewBookingForm } from "@/components/admin/NewBookingForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewBookingPage() {
  await connection();
  const session = await requireAdmin();
  if (!session) notFound();

  const packages = await db.package.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      priceFrom: true,
      currency: true,
      departures: {
        where: { departureDate: { gte: new Date() } },
        orderBy: { departureDate: "asc" },
        select: { id: true, departureDate: true, returnDate: true, priceOverride: true },
      },
    },
    orderBy: { title: "asc" },
  });

  const serialisedPackages = packages.map(({ departures, ...p }) => ({
    ...p,
    departures: departures.map(({ departureDate, returnDate, ...d }) => ({
      ...d,
      label: `${format(departureDate, "dd MMM yyyy")} → ${format(returnDate, "dd MMM yyyy")}`,
    })),
  }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Booking</h1>
          <p className="text-muted-foreground text-sm">
            Create a manual booking on behalf of a customer
          </p>
        </div>
      </div>

      <NewBookingForm packages={serialisedPackages} />
    </div>
  );
}
