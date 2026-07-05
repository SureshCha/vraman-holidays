import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { DestinationsClient } from "./DestinationsClient";

export default async function DestinationsPage() {
  await connection();
  const session = await auth();
  if (!session) notFound();

  const destinations = await db.destination.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { packages: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Destinations</h1>
          <p className="text-muted-foreground text-sm">
            Drag to reorder. Published destinations appear on the public site.
          </p>
        </div>
      </div>
      <DestinationsClient
        destinations={destinations.map((d) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          country: d.country,
          tagline: d.tagline ?? "",
          region: (d.region === "NEPAL" ? "NEPAL" : "WORLD") as "NEPAL" | "WORLD",
          description: d.description ?? "",
          imageUrl: d.imageUrl ?? "",
          order: d.order,
          status: d.status,
          packageCount: d._count.packages,
        }))}
      />
    </div>
  );
}
