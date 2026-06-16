"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface PackageFiltersProps {
  destinations: FilterOption[];
  tripTypes: FilterOption[];
  totalCount: number;
}

const DURATION_OPTIONS = [
  { value: "1-3", label: "1–3 days" },
  { value: "4-7", label: "4–7 days" },
  { value: "8-14", label: "8–14 days" },
  { value: "15+", label: "15+ days" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "duration-asc", label: "Shortest first" },
  { value: "duration-desc", label: "Longest first" },
];

export function PackageFilters({
  destinations,
  tripTypes,
  totalCount,
}: PackageFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentDest = searchParams.get("destination") ?? "";
  const currentType = searchParams.get("tripType") ?? "";
  const currentDuration = searchParams.get("duration") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";
  const currentQ = searchParams.get("q") ?? "";

  const activeCount = [currentDest, currentType, currentDuration, currentQ].filter(Boolean).length;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        setMobileOpen(false);
      });
    },
    [router, pathname, searchParams, startTransition],
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
      setMobileOpen(false);
    });
  }, [router, pathname, startTransition]);

  const filterControls = (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search packages..."
          defaultValue={currentQ}
          className="pl-9"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") updateFilter("q", e.currentTarget.value);
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            if (e.currentTarget.value !== currentQ) updateFilter("q", e.currentTarget.value);
          }}
        />
      </div>

      {/* Destination */}
      <Select value={currentDest || "all"} onValueChange={(v) => updateFilter("destination", v ?? "")}>
        <SelectTrigger>
          <SelectValue placeholder="All Destinations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Destinations</SelectItem>
          {destinations.map((d) => (
            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Trip Type */}
      <Select value={currentType || "all"} onValueChange={(v) => updateFilter("tripType", v ?? "")}>
        <SelectTrigger>
          <SelectValue placeholder="All Trip Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Trip Types</SelectItem>
          {tripTypes.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Duration */}
      <Select value={currentDuration || "all"} onValueChange={(v) => updateFilter("duration", v ?? "")}>
        <SelectTrigger>
          <SelectValue placeholder="Any Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Duration</SelectItem>
          {DURATION_OPTIONS.map((d) => (
            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={currentSort} onValueChange={(v) => updateFilter("sort", v ?? "newest")}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full" onClick={clearAll}>
          <X className="h-3.5 w-3.5 mr-1" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mb-8">
      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            defaultValue={currentQ}
            className="pl-9 h-9"
            onKeyDown={(e) => { if (e.key === "Enter") updateFilter("q", e.currentTarget.value); }}
            onBlur={(e) => { if (e.target.value !== currentQ) updateFilter("q", e.target.value); }}
          />
        </div>
        <Select value={currentDest || "all"} onValueChange={(v) => updateFilter("destination", v ?? "")}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Destination" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Destinations</SelectItem>
            {destinations.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={currentType || "all"} onValueChange={(v) => updateFilter("tripType", v ?? "")}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Trip Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {tripTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={currentDuration || "all"} onValueChange={(v) => updateFilter("duration", v ?? "")}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Duration" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Duration</SelectItem>
            {DURATION_OPTIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={currentSort} onValueChange={(v) => updateFilter("sort", v ?? "newest")}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-9">
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Mobile filters */}
      <div className="md:hidden flex items-center justify-between gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {activeCount}
                </Badge>
              )}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Packages</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{filterControls}</div>
          </SheetContent>
        </Sheet>

        <Select value={currentSort} onValueChange={(v) => updateFilter("sort", v ?? "newest")}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <div className="mt-4 flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {isPending ? "Searching..." : `Showing ${totalCount} package${totalCount !== 1 ? "s" : ""}`}
        </p>
        {activeCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeCount} filter{activeCount !== 1 ? "s" : ""} active
          </Badge>
        )}
      </div>
    </div>
  );
}
