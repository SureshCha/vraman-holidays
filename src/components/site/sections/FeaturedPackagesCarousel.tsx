"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PackageCard } from "@/components/site/PackageCard";

interface SerializedPackage {
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
  seatsLeft?: number;
  isTrending?: boolean;
}

export function FeaturedPackagesCarousel({
  packages,
}: {
  packages: SerializedPackage[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group/carousel">
      <div className="overflow-hidden -mx-2" ref={emblaRef}>
        <div className="flex">
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className="flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_33.333%] min-w-0 px-2"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <PackageCard package={pkg} variant="featured" seatsLeft={pkg.seatsLeft} isTrending={pkg.isTrending} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows — visible on hover */}
      {canPrev && (
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-10 w-10 rounded-full bg-background/90 shadow-lg border flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-10 w-10 rounded-full bg-background/90 shadow-lg border flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
