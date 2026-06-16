import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ packages: [] });

  const ids = idsParam.split(",").filter(Boolean).slice(0, 50); // Cap at 50
  if (ids.length === 0) return NextResponse.json({ packages: [] });

  const packages = await db.package.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    include: {
      destination: { select: { name: true } },
      tripTypes: { select: { name: true } },
    },
  });

  return NextResponse.json({
    packages: packages.map((pkg) => ({
      id: pkg.id,
      slug: pkg.slug,
      title: pkg.title,
      subtitle: pkg.subtitle,
      coverImage: pkg.coverImage,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      priceFrom: pkg.priceFrom,
      currency: pkg.currency,
      destinationName: pkg.destination.name,
      tripTypeNames: pkg.tripTypes.map((t) => t.name),
    })),
  });
}
