import sanitizeHtmlLib from "sanitize-html";

/**
 * Server-safe HTML sanitizer for admin-authored rich text. Uses sanitize-html
 * (pure JS, no jsdom) — isomorphic-dompurify pulled in jsdom, which fails to
 * load on Vercel (ERR_REQUIRE_ESM in a transitive dependency).
 */
const options: sanitizeHtmlLib.IOptions = {
  allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "u",
    "span",
    "figure",
    "figcaption",
  ]),
  allowedAttributes: {
    ...sanitizeHtmlLib.defaults.allowedAttributes,
    "*": ["style", "class"],
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, options);
}
