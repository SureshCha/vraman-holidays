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
    "mark",
  ]),
  allowedAttributes: {
    ...sanitizeHtmlLib.defaults.allowedAttributes,
    "*": ["style", "class"],
    a: ["href", "name", "target", "rel"],
    img: [
      "src", "alt", "width", "height", "loading", "style", "class",
      "containerstyle", "wrapperstyle",
    ],
    mark: ["data-color"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

/**
 * TipTap's tiptap-extension-resize-image stores layout in custom attributes
 * (containerstyle, wrapperstyle) on the <img> tag. The public site has no
 * TipTap — we reconstruct the wrapper here so alignment/float renders.
 */
function applyImageWrappers(html: string): string {
  return html.replace(
    /<img\b([^>]*?)\s*\/?>/gi,
    (match, attrs: string) => {
      const containerMatch = attrs.match(/containerstyle="([^"]*)"/i);
      const wrapperMatch = attrs.match(/wrapperstyle="([^"]*)"/i);

      if (!containerMatch && !wrapperMatch) return match;

      // Strip the custom attributes from the <img> tag
      let cleanAttrs = attrs
        .replace(/\s*containerstyle="[^"]*"/gi, "")
        .replace(/\s*wrapperstyle="[^"]*"/gi, "");

      const containerStyle = containerMatch?.[1] ?? "";
      const wrapperStyle = wrapperMatch?.[1] ?? "";

      return `<span style="${wrapperStyle}"><span style="${containerStyle}"><img${cleanAttrs} /></span></span>`;
    }
  );
}

export function sanitizeHtml(dirty: string): string {
  const sanitized = sanitizeHtmlLib(dirty, options);
  return applyImageWrappers(sanitized);
}
