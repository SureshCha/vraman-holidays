"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { PackageCard } from "@/components/site/PackageCard";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PackageData {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  coverImage?: string | null;
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  currency: string;
  destinationName: string;
  tripTypeNames: string[];
}

export default function WishlistPage() {
  const { ids, clear, count } = useWishlist();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setPackages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/packages/by-ids?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setPackages(data.packages ?? []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-7 w-7 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground mt-1">
            {count} saved package{count !== 1 ? "s" : ""}
          </p>
        </div>
        {count > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-1" /> Clear all
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            No saved packages yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Browse our packages and click the heart icon to save your favorites here.
          </p>
          <Link href="/packages">
            <Button className="mt-4 gap-2">
              Browse Packages <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      )}
    </main>
  );
}
