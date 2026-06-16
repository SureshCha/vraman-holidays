import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createBookingSchema } from "@/lib/validators/booking";
import { nanoid } from "nanoid";
import { sendBookingConfirmation, sendAdminNotification } from "@/lib/email/send";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`booking:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { packageId, departureId, travellers, currency, notes, travelInsurance } = parsed.data;

  // Fetch package to get price
  const pkg = await db.package.findUnique({
    where: { id: packageId, status: "PUBLISHED" },
    select: { priceFrom: true, currency: true },
  });
  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // If departure specified, validate it exists and has seats
  let totalAmount = pkg.priceFrom * travellers.length;
  if (departureId) {
    const dep = await db.packageDeparture.findUnique({ where: { id: departureId } });
    if (!dep) return NextResponse.json({ error: "Departure not found" }, { status: 404 });
    const available = dep.maxSeats - dep.bookedSeats;
    if (available < travellers.length) {
      return NextResponse.json({ error: "Not enough seats available" }, { status: 409 });
    }
    if (dep.priceOverride) totalAmount = dep.priceOverride * travellers.length;
  }

  // Create booking + travellers in a transaction
  const booking = await db.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        bookingRef: nanoid(10).toUpperCase(),
        packageId,
        departureId: departureId ?? null,
        status: "PENDING",
        totalAmount,
        currency: currency ?? pkg.currency,
        notes: notes ?? null,
        travelInsurance: travelInsurance ?? false,
        travellers: {
          create: travellers.map((t, i) => ({
            firstName: t.firstName,
            lastName: t.lastName,
            email: t.email,
            phone: t.phone,
            nationality: t.nationality ?? null,
            passportNo: t.passportNo ?? null,
            dob: t.dob ? new Date(t.dob) : null,
            address: t.address ?? null,
            specialRequests: t.specialRequests ?? null,
            isPrimary: i === 0,
          })),
        },
      },
    });

    // Reserve seats on departure
    if (departureId) {
      await tx.packageDeparture.update({
        where: { id: departureId },
        data: { bookedSeats: { increment: travellers.length } },
      });
    }

    return b;
  });

  // Fire-and-forget emails — don't block the API response
  sendBookingConfirmation(booking.id).catch(() => {});
  sendAdminNotification("booking", booking.id).catch(() => {});

  return NextResponse.json(
    { bookingRef: booking.bookingRef, bookingId: booking.id, totalAmount },
    { status: 201 }
  );
}
