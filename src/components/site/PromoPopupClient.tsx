"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  title: string;
}

export function PromoPopupClient({ slides }: { slides: Slide[] }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("promoPopupDismissed")) return;
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem("promoPopupDismissed", "1");
  }, []);

  const prev = () => setActiveIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

  const slide = slides[activeIndex]!;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent showCloseButton className="max-w-lg sm:max-w-xl p-0 overflow-hidden border-0 gap-0 bg-transparent shadow-none">
        <div className="relative rounded-xl overflow-hidden bg-background shadow-2xl">
          {/* Slide */}
          <Link href={slide.linkUrl} onClick={handleClose} className="block">
            <Image
              src={slide.imageUrl}
              alt={slide.alt || slide.title}
              width={600}
              height={600}
              className="w-full h-auto"
              sizes="(max-width: 640px) 95vw, 576px"
              priority
            />
          </Link>

          {/* Carousel controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Previous offer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Next offer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${i === activeIndex ? "bg-white" : "bg-white/40"}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
