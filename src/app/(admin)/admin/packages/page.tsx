import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PackagesClient } from "./PackagesClient";

export default async function PackagesPage() {
  await connection();
  const session = await auth();
  if (!session) notFound();

  const packages = await db.package.findMany({
    orderBy: { createdAt: "desc" },
    include: { destination: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
        <p className="text-muted-foreground text-sm">Create and manage travel packages.</p>
      </div>
      <PackagesClient
        packages={packages.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          destinationName: p.destination.name,
          status: p.status,
          durationDays: p.durationDays,
          priceFrom: p.priceFrom,
          currency: p.currency,
          featured: p.featured,
          coverImage: p.coverImage ?? "",
        }))}
      />
    </div>
  );
}
