import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { format } from "date-fns";
import { ReceiptActions } from "./ReceiptActions";
import { GATEWAY_LABEL } from "@/lib/payments/labels";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking Receipt" };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h2>
  );
}

function statusVariant(status: string): "success" | "warning" | "danger" {
  if (status === "CONFIRMED" || status === "SUCCESS") return "success";
  if (status === "PENDING") return "warning";
  return "danger";
}

async function ReceiptContent({ params }: { params: Promise<{ ref: string }> }) {
  await connection();
  const { ref } = await params;

  const [booking, settings] = await Promise.all([
    db.booking.findUnique({
      where: { bookingRef: ref },
      include: {
        package: { select: { title: true } },
        departure: { select: { departureDate: true, returnDate: true } },
        travellers: { orderBy: { isPrimary: "desc" } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    }),
    getSettings(),
  ]);

  if (!booking) notFound();

  // Show the most-recent successful payment; fall back to most-recent of any status.
  const successPayment = booking.payments.find((p) => p.status === "SUCCESS");
  const payment = successPayment ?? booking.payments[0];

  return (
    <>
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden bg-muted/30 border-b px-6 py-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>
          Booking receipt for <span className="font-mono font-semibold text-foreground">{booking.bookingRef}</span>
          {" — "}share this link or print to PDF
        </span>
        <ReceiptActions bookingRef={booking.bookingRef} />
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 18mm 18mm 18mm 18mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <main className="max-w-2xl mx-auto px-6 py-10 print:py-0 space-y-8 text-sm">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex justify-between items-start gap-6">
          <div className="space-y-0.5">
            {settings.brand.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.brand.logoUrl}
                alt={settings.brand.name}
                className="h-10 w-auto mb-1 object-contain"
              />
            )}
            <p className="text-xl font-bold leading-tight">{settings.brand.name}</p>
            <p className="text-muted-foreground text-xs">{settings.contact.address}</p>
            <p className="text-muted-foreground text-xs">{settings.contact.email}</p>
            <p className="text-muted-foreground text-xs">{settings.contact.phone}</p>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Booking Receipt</p>
            <p className="font-mono font-bold text-lg">{booking.bookingRef}</p>
            <p className="text-xs text-muted-foreground">
              Issued: {format(booking.createdAt, "dd MMM yyyy")}
            </p>
            <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
          </div>
        </div>

        <hr className="border-border" />

        {/* ── Booking Details ───────────────────────────────────── */}
        <section className="space-y-3">
          <SectionLabel>Booking Details</SectionLabel>
          <div className="rounded-lg border bg-muted/20 p-4 grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Package</p>
              <p className="font-medium">{booking.package.title}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Travellers</p>
              <p className="font-medium">{booking.travellers.length}</p>
            </div>
            {booking.departure && (
              <>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Departure</p>
                  <p className="font-medium">{format(booking.departure.departureDate, "dd MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Return</p>
                  <p className="font-medium">{format(booking.departure.returnDate, "dd MMM yyyy")}</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Travellers ────────────────────────────────────────── */}
        <section className="space-y-3">
          <SectionLabel>Travellers</SectionLabel>
          <div className="rounded-lg border divide-y">
            {booking.travellers.map((t) => (
              <div key={t.id} className="px-4 py-3 flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <p className="font-medium">
                    {t.firstName} {t.lastName}
                    {t.isPrimary && (
                      <span className="ml-2 text-[10px] font-normal text-muted-foreground border rounded px-1 py-0.5">
                        Primary
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                  {t.phone && <p className="text-xs text-muted-foreground">{t.phone}</p>}
                </div>
                {t.nationality && (
                  <p className="text-xs text-muted-foreground shrink-0">{t.nationality}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Payment Summary ───────────────────────────────────── */}
        <section className="space-y-3">
          <SectionLabel>Payment</SectionLabel>
          <div className="rounded-lg border p-4 space-y-2">
            {payment && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{GATEWAY_LABEL[payment.gateway] ?? payment.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
                </div>
              </>
            )}
            <div className="border-t my-2" />

            {booking.discountAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {booking.currency}{" "}
                    {((booking.totalAmount + booking.discountAmount) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>− {booking.currency} {(booking.discountAmount / 100).toLocaleString()}</span>
                </div>
              </>
            )}

            <div className="flex justify-between font-bold text-base">
              <span>Total {booking.status === "CONFIRMED" ? "Paid" : "Due"}</span>
              <span>
                {booking.currency} {(booking.totalAmount / 100).toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* ── Footer note ───────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground text-center pt-2 print:pt-6">
          This receipt is issued by {settings.brand.name}.{" "}
          For queries contact {settings.contact.email} or {settings.contact.phone}.
        </p>
      </main>
    </>
  );
}

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading receipt…
        </div>
      }
    >
      <ReceiptContent params={params} />
    </Suspense>
  );
}
