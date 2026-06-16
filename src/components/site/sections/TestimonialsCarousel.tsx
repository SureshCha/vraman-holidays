"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, BadgeCheck } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: string;
  name: string;
  location?: string | null;
  rating: number;
  content: string;
  imageUrl?: string | null;
}

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary/20">
        <Image src={imageUrl} alt={name} fill className="object-cover" sizes="48px" />
      </div>
    );
  }
  // Initials avatar with gradient
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary/20">
      {initials}
    </div>
  );
}

export function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: true })],
  );
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
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group/carousel">
      <div className="overflow-hidden -mx-2" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex-[0_0_88%] sm:flex-[0_0_48%] lg:flex-[0_0_33.333%] min-w-0 px-2"
            >
              <div className="rounded-2xl border bg-card p-6 h-full flex flex-col gap-4">
                {/* Decorative quote */}
                <Quote className="h-8 w-8 text-primary/20 -mb-2" />

                {/* Content */}
                <p className="text-sm leading-relaxed text-muted-foreground flex-1 line-clamp-5">
                  {t.content}
                </p>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < t.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <Avatar name={t.name} imageUrl={t.imageUrl} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">{t.name}</p>
                      <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    </div>
                    {t.location && (
                      <p className="text-xs text-muted-foreground truncate">
                        {t.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
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
