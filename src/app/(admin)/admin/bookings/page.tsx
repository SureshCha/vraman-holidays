import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookingsClient } from "./BookingsClient";

export default async function BookingsPage() {
  await connection();
  const session = await auth();
  if (!session || session.user.role === "EDITOR") notFound();

  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      package: { select: { title: true } },
      travellers: { where: { isPrimary: true }, take: 1 },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground text-sm">Manage and track all booking requests.</p>
      </div>
      <BookingsClient
        bookings={bookings.map((b) => ({
          id: b.id,
          bookingRef: b.bookingRef,
          packageTitle: b.package.title,
          primaryName: b.travellers[0] ? `${b.travellers[0].firstName} ${b.travellers[0].lastName}` : "—",
          primaryEmail: b.travellers[0]?.email ?? "—",
          status: b.status,
          paymentStatus: b.payments[0]?.status ?? null,
          totalAmount: b.totalAmount,
          currency: b.currency,
          createdAt: b.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
