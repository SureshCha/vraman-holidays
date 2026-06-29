import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { resolveTokens } from "@/lib/tokens";

interface ImageBandData {
  eyebrow?: string;
  heading?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  parallax?: boolean;
}

/**
 * Full-bleed photographic band with an overlay — the immersive, Elite-Exped-style
 * interstitial. Uses a CSS background so it can optionally be a fixed/parallax
 * layer. Renders nothing until an image is set (safe for empty admin sections).
 */
export async function ImageBandSection({ data }: { data: ImageBandData }) {
  // Only accept http(s) or root-relative image URLs.
  const img = data.imageUrl && /^(https?:\/\/|\/)/.test(data.imageUrl) ? data.imageUrl : null;
  if (!img) return null;
  const settings = await getSettings();
  const t = (s?: string) => resolveTokens(s, settings);

  return (
    <section
      className={`relative overflow-hidden bg-cover bg-center ${data.parallax ? "bg-scroll md:bg-fixed" : ""}`}
      style={{ backgroundImage: `url("${img}")` }}
    >
      {/* Dark scrim for legible white text over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/45" />
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
