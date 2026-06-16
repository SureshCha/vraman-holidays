"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  imageUrl: string;
  headline?: string;
  subheadline?: string;
}

interface HeroCarouselProps {
  slides: Slide[];
  fallbackHeadline: string;
  fallbackSubheadline: string;
}

export function HeroCarousel({
  slides,
  fallbackHeadline,
  fallbackSubheadline,
}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const currentSlide = slides[selectedIndex];
  const headline = currentSlide?.headline || fallbackHeadline;
  const subheadline = currentSlide?.subheadline || fallbackSubheadline;

  return (
    <div className="relative min-h-[75vh] overflow-hidden">
      {/* Image carousel */}
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div key={i} className="relative flex-[0_0_100%] min-w-0 h-full">
              <Image
                src={slide.imageUrl}
                alt={slide.headline || `Slide ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      {/* Animated text content */}
      <div className="relative z-10 flex items-center justify-center min-h-[75vh] px-4">
        <div className="text-center max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`h-${selectedIndex}`}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {headline}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={`p-${selectedIndex}`}
              className="mt-4 text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            >
              {subheadline}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
