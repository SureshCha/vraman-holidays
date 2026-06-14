import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BankTransferConfirm } from "@/components/admin/BankTransferConfirm";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await auth();
  if (!session || session.user.role === "EDITOR") notFound();

  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      package: { select: { title: true, slug: true } },
      departure: true,
      travellers: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!booking) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking #{booking.bookingRef}</h1>
          <p className="text-muted-foreground text-sm">{booking.package.title}</p>
        </div>
        <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
          {booking.status}
        </Badge>
      </div>

      {/* Travellers */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm">Travellers</h2>
        <div className="border rounded-lg divide-y">
          {booking.travellers.map((t) => (
            <div key={t.id} className="p-3 flex justify-between text-sm">
              <div>
                <p className="font-medium">{t.firstName} {t.lastName} {t.isPrimary && <Badge variant="outline" className="text-xs ml-1">Primary</Badge>}</p>
                <p className="text-muted-foreground text-xs">{t.email} · {t.phone}</p>
                {t.passportNo && <p className="text-xs text-muted-foreground">Passport: {t.passportNo}</p>}
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {t.nationality && <p>{t.nationality}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Departure */}
      {booking.departure && (
        <section className="space-y-2">
          <h2 className="font-semibold text-sm">Departure</h2>
          <div className="border rounded-lg p-3 text-sm">
            <p>{format(booking.departure.departureDate, "dd MMM yyyy")} → {format(booking.departure.returnDate, "dd MMM yyyy")}</p>
          </div>
        </section>
      )}

      {/* Payment history */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm">Payments</h2>
        {booking.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment recorded yet.</p>
        ) : (
          <div className="border rounded-lg divide-y">
            {booking.payments.map((p) => (
              <div key={p.id} className="p-3 flex justify-between text-sm">
                <div>
                  <p className="font-medium">{p.gateway}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.gatewayTxnId ?? "—"}</p>
                </div>
                <div className="text-right">
                  <Badge variant={p.status === "SUCCESS" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{p.currency} {(p.amount / 100).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bank transfer confirmation */}
      {booking.status === "PENDING" &&
        booking.payments.some(
          (p) => p.gateway === "BANK_TRANSFER" && p.status === "PENDING"
        ) && <BankTransferConfirm bookingId={booking.id} />}

      <div className="border rounded-lg p-4 bg-muted/20 flex justify-between">
        <p className="font-semibold">Total</p>
        <p className="font-bold">{booking.currency} {(booking.totalAmount / 100).toLocaleString()}</p>
      </div>
    </div>
  );
}
