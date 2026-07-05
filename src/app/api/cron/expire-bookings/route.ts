import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Auto-cancels PENDING bookings older than 24 hours and releases
 * their reserved seats. Runs every 4 hours via Vercel Cron.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find stale bookings with departures (need to release seats)
    const staleBookings = await db.booking.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      select: {
        id: true,
        departureId: true,
        travellers: { select: { id: true } },
      },
    });

    if (staleBookings.length === 0) {
      return NextResponse.json({ expired: 0 });
    }

    await db.$transaction(async (tx) => {
      // Release seats for bookings with departures
      for (const booking of staleBookings) {
        if (booking.departureId) {
          await tx.packageDeparture.update({
            where: { id: booking.departureId },
            data: { bookedSeats: { decrement: booking.travellers.length } },
          });
        }
      }

      // Cancel all stale PENDING bookings
      await tx.booking.updateMany({
        where: { status: "PENDING", createdAt: { lt: cutoff } },
        data: { status: "CANCELLED" },
      });
    });

    return NextResponse.json({ expired: staleBookings.length });
  } catch (e) {
    console.error("Expire bookings cron failed:", e);
    return NextResponse.json({ error: "Failed to expire bookings" }, { status: 500 });
  }
}
