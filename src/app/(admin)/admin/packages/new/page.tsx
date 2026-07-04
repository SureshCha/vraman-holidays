import { connection } from "next/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { PackageEditor } from "@/components/admin/PackageEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewPackagePage() {
  await connection();

  const [destinations, tripTypes] = await Promise.all([
    db.destination.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.tripType.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/packages">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Package</h1>
          <p className="text-muted-foreground text-sm">Fill in the details below then publish when ready.</p>
        </div>
      </div>
      <PackageEditor destinations={destinations} tripTypes={tripTypes} />
    </div>
  );
}
