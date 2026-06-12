"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";

interface Departure {
  id: string;
  departureDate: string;
  returnDate: string;
  maxSeats: number;
  bookedSeats: number;
  priceOverride: number | null;
  currency: string;
  basePrice: number;
}

export function DeparturePicker({ departures, packageId, currency, basePrice }: {
  departures: Departure[];
  packageId: string;
  currency: string;
  basePrice: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const upcoming = departures.filter((d) => new Date(d.departureDate) > new Date());

  if (upcoming.length === 0) {
    return (
      <div className="border rounded-xl p-6 text-center space-y-3">
        <p className="text-muted-foreground text-sm">No upcoming departures available.</p>
        <Link href="/propose">
          <Button variant="outline" size="sm">Request a Custom Date</Button>
        </Link>
      </div>
    );
  }

  const selectedDep = upcoming.find((d) => d.id === selected);
  const price = selectedDep?.priceOverride ?? basePrice;

  return (
    <div className="border rounded-xl p-5 space-y-4">
      <h3 className="font-semibold text-sm">Select Departure Date</h3>
      <div className="space-y-2">
        {upcoming.map((dep) => {
          const available = dep.maxSeats - dep.bookedSeats;
          const depPrice = dep.priceOverride ?? basePrice;
          const isSelected = selected === dep.id;

          return (
            <button
              key={dep.id}
              onClick={() => setSelected(dep.id)}
              disabled={available === 0}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              } ${available === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {format(new Date(dep.departureDate), "dd MMM yyyy")} — {format(new Date(dep.returnDate), "dd MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {available > 0 ? `${available} seats left` : "Sold out"}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">{dep.currency} {(depPrice / 100).toLocaleString()}</p>
                  {available <= 3 && available > 0 && <Badge variant="destructive" className="text-xs">Almost full</Badge>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Link href={selected ? `/booking?packageId=${packageId}&departureId=${selected}` : "#"}>
        <Button className="w-full" disabled={!selected} size="lg">
          {selected ? `Book Now — ${currency} ${(price / 100).toLocaleString()}` : "Select a departure date"}
        </Button>
      </Link>
    </div>
  );
}
