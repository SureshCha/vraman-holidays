import { describe, it, expect } from "vitest";
import { resolveTokens } from "@/lib/tokens";
import type { ParsedSettings } from "@/lib/settings";

const mockSettings = {
  brand: {
    name: "Vraman Holidays",
    tagline: "Propose Your Destination™",
    logoUrl: "",
    faviconUrl: "",
    philosophy: "Stop Selling. Start Compelling.",
  },
} as ParsedSettings;

describe("resolveTokens", () => {
  it("replaces {brand} with brand name", () => {
    expect(resolveTokens("Welcome to {brand}", mockSettings)).toBe("Welcome to Vraman Holidays");
  });

  it("replaces {tagline} with tagline", () => {
    expect(resolveTokens("{tagline}", mockSettings)).toBe("Propose Your Destination™");
  });

  it("replaces {philosophy} with philosophy", () => {
    expect(resolveTokens("{philosophy}", mockSettings)).toBe("Stop Selling. Start Compelling.");
  });

  it("replaces multiple tokens in one string", () => {
    const result = resolveTokens("{brand} — {tagline} · {philosophy}", mockSettings);
    expect(result).toBe("Vraman Holidays — Propose Your Destination™ · Stop Selling. Start Compelling.");
  });

  it("replaces multiple occurrences of the same token", () => {
    expect(resolveTokens("{brand} loves {brand}", mockSettings)).toBe("Vraman Holidays loves Vraman Holidays");
  });

  it("returns empty string for null input", () => {
    expect(resolveTokens(null, mockSettings)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(resolveTokens(undefined, mockSettings)).toBe("");
  });

  it("returns original text when no tokens present", () => {
    expect(resolveTokens("No tokens here", mockSettings)).toBe("No tokens here");
  });

  it("handles missing philosophy gracefully", () => {
    const settings = {
      brand: { name: "Test", tagline: "Tag", logoUrl: "", faviconUrl: "" },
    } as ParsedSettings;
    expect(resolveTokens("{philosophy}", settings)).toBe("");
  });
});
