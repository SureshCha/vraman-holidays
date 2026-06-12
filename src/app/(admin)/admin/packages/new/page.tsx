import { connection } from "next/server";
import { db } from "@/lib/db";
import { PackageEditor } from "@/components/admin/PackageEditor";

export default async function NewPackagePage() {
  await connection();

  const [destinations, tripTypes] = await Promise.all([
    db.destination.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.tripType.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Package</h1>
        <p className="text-muted-foreground text-sm">Fill in the details below then publish when ready.</p>
      </div>
      <PackageEditor destinations={destinations} tripTypes={tripTypes} />
    </div>
  );
}
