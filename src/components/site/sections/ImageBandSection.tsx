import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";
import { MediaBackground } from "./MediaBackground";
import { safeMediaUrl } from "@/lib/media";

interface ImageBandData {
  eyebrow?: string;
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
  parallax?: boolean;
}

/**
 * Full-bleed photographic/video band with an overlay — the immersive,
 * Elite-Exped-style interstitial. Renders nothing until a media URL is set
 * (safe for empty admin sections).
 */
export async function ImageBandSection({ data }: { data: ImageBandData }) {
  if (!safeMediaUrl(data.videoUrl) && !safeMediaUrl(data.imageUrl)) return null;
  const settings = await getSettings();
  const t = (s?: string) => resolveTokens(s, settings);

  return (
    <section className="relative overflow-hidden">
      {/* Dark scrim for legible white text over any photo/video */}
      <MediaBackground
        imageUrl={data.imageUrl}
        videoUrl={data.videoUrl}
        posterUrl={data.posterUrl}
        parallax={data.parallax}
        overlayClassName="bg-gradient-to-t from-black/80 via-black/50 to-black/45"
      />
      <div className="relative z-10 container mx-auto px-4 py-28 sm:py-36 text-center text-white max-w-3xl">
        {data.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80 mb-4">
            {t(data.eyebrow)}
          </p>
        )}
        {data.heading && (
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-balance drop-shadow">
            {t(data.heading)}
          </h2>
        )}
        {data.subtext && (
          <p className="text-base sm:text-lg text-white/90 mt-4 leading-relaxed">{t(data.subtext)}</p>
        )}
        {data.ctaLabel && data.ctaHref && (
          <Link
            href={data.ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-primary mt-8 shadow-lg hover:bg-white/90 transition-colors"
          >
            {t(data.ctaLabel)}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
