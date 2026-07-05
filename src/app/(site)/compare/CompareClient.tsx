"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SmartMedia } from "@/components/site/SmartMedia";
import { useCompare } from "@/lib/hooks/useCompare";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, MapPin, Clock } from "lucide-react";

interface PackageDetail {
  id: string;
  slug: string;
  title: string;
  coverImage: string | null;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  currency: string;
  destination: { name: string };
  tripTypes: { name: string }[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
}

export default function ComparePage() {
  const { ids, clear } = useCompare();
  const [packages, setPackages] = useState<PackageDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) { setPackages([]); return; }
    setLoading(true);
    fetch(`/api/packages/by-ids?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setPackages(data as PackageDetail[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids]);

  if (ids.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Package Comparison</h1>
        <p className="text-muted-foreground">No packages selected for comparison.</p>
        <Link href="/destinations"><Button>Browse Packages</Button></Link>
      </main>
    );
  }

  if (loading || packages.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading comparison…</p>
      </main>
    );
  }

  const rows = [
    {
      label: "Destination",
      render: (p: PackageDetail) => (
        <span className="flex items-center gap-1 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{p.destination.name}</span>
      ),
    },
    {
      label: "Duration",
      render: (p: PackageDetail) => (
        <span className="flex items-center gap-1 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{p.durationDays}D / {p.durationNights}N</span>
      ),
    },
    {
      label: "Price From",
      render: (p: PackageDetail) => (
        <span className="font-bold text-primary">{p.currency} {(p.priceFrom / 100).toLocaleString()}</span>
      ),
    },
    {
      label: "Trip Types",
      render: (p: PackageDetail) => (
        <div className="flex flex-wrap gap-1">
          {p.tripTypes.map((t) => <Badge key={t.name} variant="secondary" className="text-xs">{t.name}</Badge>)}
        </div>
      ),
    },
    {
      label: "Highlights",
      render: (p: PackageDetail) => (
        <ul className="space-y-1">
          {(p.highlights as string[]).slice(0, 5).map((h, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />{h}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Inclusions",
      render: (p: PackageDetail) => (
        <span className="text-sm font-medium">{(p.inclusions as string[]).length} items included</span>
      ),
    },
    {
      label: "Exclusions",
      render: (p: PackageDetail) => (
        <span className="text-sm text-muted-foreground">{(p.exclusions as string[]).length} exclusions</span>
      ),
    },
  ];

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Package Comparison</h1>
        <Button variant="outline" size="sm" onClick={clear}>Clear All</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-32 p-3 text-left text-sm font-semibold text-muted-foreground border-b" />
              {packages.map((p) => (
                <th key={p.id} className="p-3 border-b min-w-[200px]">
                  <div className="space-y-2">
                    <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                      {p.coverImage ? (
                        <SmartMedia src={p.coverImage} alt={p.title} fill className="absolute inset-0 h-full w-full object-cover" sizes="220px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-left leading-snug">{p.title}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b hover:bg-muted/30">
                <td className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide align-top">
                  {row.label}
                </td>
                {packages.map((p) => (
                  <td key={p.id} className="p-3 align-top">{row.render(p)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-3" />
              {packages.map((p) => (
                <td key={p.id} className="p-3">
                  <Link href={`/packages/${p.slug}`}>
                    <Button size="sm" className="w-full">View Package</Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
