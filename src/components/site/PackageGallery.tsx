"use client";

import { useState } from "react";
import { SmartMedia } from "./SmartMedia";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PackageGallery({ images }: { images: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  function prev() { setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : 0)); }
  function next() { setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : 0)); }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.slice(0, 6).map((url, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-video overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity"
          >
            <SmartMedia src={url} alt={`Gallery image ${i + 1}`} fill className="absolute inset-0 h-full w-full object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
            {i === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                +{images.length - 6} more
              </div>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/10" onClick={() => setLightboxIndex(null)}>
              <X className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute left-4 text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); prev(); }}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] w-full mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartMedia
                src={images[lightboxIndex]!}
                alt={`Image ${lightboxIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] w-full rounded-lg"
              />
              <p className="text-center text-white/60 text-sm mt-2">{lightboxIndex + 1} / {images.length}</p>
            </motion.div>
            <Button variant="ghost" size="icon" className="absolute right-4 text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); next(); }}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
