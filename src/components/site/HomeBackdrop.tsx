import { MediaBackground } from "./sections/MediaBackground";

interface HomeBackdropProps {
  imageUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
}

/**
 * A single hero image/video fixed behind the ENTIRE homepage, so the banner reads
 * as one continuous theme top-to-bottom. Sits at z-0 (above the body's background
 * canvas); homepage content renders with `relative z-10` over it. A strong dark
 * scrim keeps section text legible across the whole page. Desktop plays the video,
 * mobile/reduced-motion shows the poster (handled by MediaBackground).
 */
export function HomeBackdrop({ imageUrl, videoUrl, posterUrl }: HomeBackdropProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <MediaBackground
        imageUrl={imageUrl}
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        priority
        overlayClassName="bg-black/60"
      />
    </div>
  );
}
