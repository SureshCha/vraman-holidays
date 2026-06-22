import type { ParsedSettings } from "@/lib/settings";

/**
 * Resolve brand tokens in admin-editable copy so there is a single source of
 * truth. Supported tokens: {brand}, {tagline}, {philosophy}.
 */
export function resolveTokens(text: string | undefined | null, settings: ParsedSettings): string {
  if (!text) return "";
  return text
    .replace(/\{brand\}/g, settings.brand.name ?? "")
    .replace(/\{tagline\}/g, settings.brand.tagline ?? "")
    .replace(/\{philosophy\}/g, settings.brand.philosophy ?? "");
}
