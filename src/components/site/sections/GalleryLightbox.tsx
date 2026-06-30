"use client";

import { useState } from "react";
import { SmartMedia } from "../SmartMedia";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  images: string[];
  title?: string;
}

export function GalleryLightbox({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted cursor-pointer group"
            onClick={() => setLightboxIndex(i)}
          >
            <SmartMedia
              src={src}
              alt={title ? `${title} ${i + 1}` : `Gallery image ${i + 1}`}
              fill
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
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
            <button
              type="button"
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
            >
              <X className="h-8 w-8" />
            </button>

            {lightboxIndex > 0 && (
              <button
                type="button"
                className="absolute left-4 text-white/70 hover:text-white z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
            )}

            {lightboxIndex < images.length - 1 && (
              <button
                type="button"
                className="absolute right-4 text-white/70 hover:text-white z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                aria-label="Next image"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] w-full mx-4 aspect-[4/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartMedia
                src={images[lightboxIndex]!}
                alt={title ? `${title} ${lightboxIndex + 1}` : `Gallery image ${lightboxIndex + 1}`}
                fill
                className="absolute inset-0 h-full w-full object-contain"
                sizes="100vw"
              />
            </motion.div>

            <p className="absolute bottom-4 text-white/50 text-sm">
              {lightboxIndex + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
