import { connection } from "next/server";
import { db } from "@/lib/db";
import { TripTypesClient } from "./TripTypesClient";

export default async function TripTypesPage() {
  await connection();
  const tripTypes = await db.tripType.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trip Types</h1>
        <p className="text-muted-foreground text-sm">Manage categories like Adventure, Cultural, Honeymoon, etc.</p>
      </div>
      <TripTypesClient tripTypes={tripTypes} />
    </div>
  );
}
