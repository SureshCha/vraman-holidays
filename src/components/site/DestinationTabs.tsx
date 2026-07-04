"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartMedia } from "./SmartMedia";
import { AnimatedSection } from "./sections/AnimatedSection";
import Link from "next/link";

export interface DestinationCardData {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  imageUrl: string | null;
  packageCount: number;
}

type Region = "NEPAL" | "WORLD";

const TAB_META: Record<Region, { label: string; subtitle: string; blurb: string }> = {
  NEPAL: {
    label: "Discover Nepal",
    subtitle: "From Sacred Temples to Himalayan Summits",
    blurb:
      "Where spirituality, adventure, culture, and nature converge to create journeys of a lifetime — explore Nepal's rich tapestry of experiences.",
  },
  WORLD: {
    label: "Discover the World",
    subtitle: "Inspiring Journeys Beyond Borders",
    blurb:
      "Handpicked international destinations, thoughtfully curated experiences, and seamless travel planning for travellers seeking the extraordinary.",
  },
};

function Grid({ items }: { items: DestinationCardData[] }) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No destinations here yet. Check back soon!</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((dest, i) => (
        <AnimatedSection key={dest.id} delay={i * 0.06}>
        <Link
          href={`/destinations/${dest.slug}`}
          className="group block rounded-2xl overflow-hidden border bg-card hover:shadow-lg hover:-translate-y-1 hover:border-accent/40 transition-all duration-300"
        >
          <div className="relative h-44 bg-muted overflow-hidden">
            {dest.imageUrl ? (
              <SmartMedia
                src={dest.imageUrl}
                alt={dest.name}
                fill
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                {dest.name}
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm">{dest.name}</p>
            {dest.tagline && <p className="text-xs text-primary mt-0.5 line-clamp-2">{dest.tagline}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {dest.packageCount} package{dest.packageCount !== 1 ? "s" : ""}
            </p>
          </div>
        </Link>
        </AnimatedSection>
      ))}
    </div>
  );
}

export function DestinationTabs({
  nepal,
  world,
}: {
  nepal: DestinationCardData[];
  world: DestinationCardData[];
}) {
  const [active, setActive] = useState<Region>("NEPAL");
  const groups: Record<Region, DestinationCardData[]> = { NEPAL: nepal, WORLD: world };
  const meta = TAB_META[active];

  return (
    <div>
      {/* Toggle buttons */}
      <div className="flex justify-center mb-8">
        <div
          role="tablist"
          aria-label="Destination categories"
          className="inline-flex rounded-full border bg-muted/40 p-1"
        >
          {(["NEPAL", "WORLD"] as Region[]).map((region) => {
            const selected = active === region;
            return (
              <button
                key={region}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(region)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {TAB_META[region].label}
                <span className={`ml-2 text-xs ${selected ? "opacity-80" : "opacity-60"}`}>
                  {groups[region].length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active group header with fade transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold">{meta.label}</h2>
          <p className="text-sm font-medium text-primary mt-1">{meta.subtitle}</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">{meta.blurb}</p>
        </motion.div>
      </AnimatePresence>

      {/* Both grids stay mounted for SEO; inactive fades out */}
      <div className="relative">
        <motion.div
          animate={{ opacity: active === "NEPAL" ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className={active === "NEPAL" ? "" : "pointer-events-none absolute inset-x-0 top-0"}
          aria-hidden={active !== "NEPAL"}
        >
          <Grid items={nepal} />
        </motion.div>
        <motion.div
          animate={{ opacity: active === "WORLD" ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className={active === "WORLD" ? "" : "pointer-events-none absolute inset-x-0 top-0"}
          aria-hidden={active !== "WORLD"}
        >
          <Grid items={world} />
        </motion.div>
      </div>
    </div>
  );
}
