import Image from "next/image";
import { safeMediaUrl, isVideoUrl, posterFromVideo } from "@/lib/media";

interface MediaBackgroundProps {
  /** Image URL (may itself be a video URL — detected automatically). */
  imageUrl?: string | null;
  /** Explicit video URL; takes precedence over imageUrl when set. */
  videoUrl?: string | null;
  /** Still shown under the video and on mobile; derived from a Cloudinary video if omitted. */
  posterUrl?: string | null;
  /** Scrim/overlay classes layered over the media (e.g. a gradient). */
  overlayClassName?: string;
  /** Parallax (bg-fixed) — image-only; ignored for video. */
  parallax?: boolean;
  /** Prioritise the image for LCP (hero). */
  priority?: boolean;
}

/**
 * Full-bleed background media for immersive sections. Renders a `<video>` on
 * desktop (muted autoplay loop) with a poster image underneath that is the sole
 * layer on mobile (keeps data light) and when prefers-reduced-motion is set.
 * Falls back to a still image, or renders nothing when no media is provided.
 * Place inside a `relative overflow-hidden` parent; section content sits above
 * it with `relative z-10`.
 */
export function MediaBackground({
  imageUrl,
  videoUrl,
  posterUrl,
  overlayClassName = "bg-black/40",
  parallax = false,
  priority = false,
}: MediaBackgroundProps) {
  const explicitVideo = safeMediaUrl(videoUrl);
  const video = explicitVideo ?? (isVideoUrl(imageUrl) ? safeMediaUrl(imageUrl) : null);
  const image = video ? null : safeMediaUrl(imageUrl);
  const poster = safeMediaUrl(posterUrl) ?? posterFromVideo(video);

  if (!video && !image) return null;

  return (
    <>
      {video ? (
        <>
          {poster && (
            <Image src={poster} alt="" fill className="object-cover" sizes="100vw" priority={priority} />
          )}
          {/* With a poster, the video is desktop-only (mobile shows the lighter
              poster). Without a poster there's no still to fall back to, so the
              video must render on mobile too — otherwise the band is blank. */}
          {/* `.bg-video` (hidden under reduced-motion) is only applied when a
              poster can show in its place — without one, keep the video visible. */}
          <video
            className={`absolute inset-0 h-full w-full object-cover ${poster ? "bg-video hidden md:block" : "block"}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster ?? undefined}
          >
            <source src={video} />
          </video>
        </>
      ) : parallax ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed"
          style={{ backgroundImage: `url("${image}")` }}
        />
      ) : (
        <Image src={image!} alt="" fill className="object-cover" sizes="100vw" priority={priority} />
      )}
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </>
  );
}
