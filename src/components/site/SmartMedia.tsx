"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { isVideoUrl, safeMediaUrl, posterFromVideo } from "@/lib/media";

interface SmartMediaProps {
  src: string;
  alt: string;
  /** Pass when the stored resourceType is known (avoids extension guessing). */
  resourceType?: string | null;
  className?: string;
  /** Fill the positioned parent (most card/thumbnail use). */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  /** Explicit poster for the video; otherwise derived from a Cloudinary URL. */
  poster?: string | null;
}

/**
 * Renders an uploaded media URL as either a Next.js <Image> or a muted, looping
 * <video>. Inline videos autoplay ONLY while in the viewport (IntersectionObserver)
 * and pause otherwise, so a grid of clips never all play at once. Under
 * prefers-reduced-motion the video is left paused, so its poster (or first frame)
 * shows as a still — never blank.
 */
export function SmartMedia({
  src,
  alt,
  resourceType,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  poster,
}: SmartMediaProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const safe = safeMediaUrl(src);
  const isVideo = isVideoUrl(safe, resourceType);

  useEffect(() => {
    if (!isVideo) return;
    const el = ref.current;
    if (!el) return;
    // Reduced-motion: leave the video paused so its poster/first frame shows.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isVideo]);

  if (!safe) return null;

  if (isVideo) {
    const posterUrl = safeMediaUrl(poster) ?? posterFromVideo(safe) ?? undefined;
    // For `fill`, own the absolute positioning so callers don't have to (a <video>
    // isn't auto-positioned the way next/image fill is).
    const videoClass = fill
      ? `absolute inset-0 h-full w-full object-cover ${className ?? ""}`
      : (className ?? "");
    return (
      <video
        ref={ref}
        className={videoClass}
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterUrl}
        aria-label={alt}
      >
        <source src={safe} />
      </video>
    );
  }

  if (fill) {
    return <Image src={safe} alt={alt} fill className={className} sizes={sizes} priority={priority} />;
  }
  return (
    <Image
      src={safe}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
