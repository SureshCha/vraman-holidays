/**
 * Shared media helpers. Every media field on the site stores a plain URL string,
 * so a video URL can live anywhere an image URL used to — these helpers let the
 * renderers (SmartMedia, MediaBackground) tell the two apart and derive a poster.
 */

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?|#|$)/i;
const URL_OK = /^(https?:\/\/|\/)/;

/** True when the URL points at a video (by stored resourceType or file extension). */
export function isVideoUrl(url?: string | null, resourceType?: string | null): boolean {
  if (resourceType === "video") return true;
  if (resourceType === "image") return false;
  return !!url && VIDEO_EXT.test(url);
}

/** Only allow http(s) or root-relative URLs (guards against script/data URIs). */
export function safeMediaUrl(url?: string | null): string | null {
  return url && URL_OK.test(url) ? url : null;
}

/**
 * Derive a still poster image from a video URL. For Cloudinary videos, swapping
 * the extension to .jpg returns the first frame; for other hosts we fall back to
 * the explicit poster the caller provides.
 */
export function posterFromVideo(url?: string | null): string | null {
  const safe = safeMediaUrl(url);
  if (!safe) return null;
  if (safe.includes("res.cloudinary.com")) {
    return safe.replace(VIDEO_EXT, ".jpg");
  }
  return null;
}
