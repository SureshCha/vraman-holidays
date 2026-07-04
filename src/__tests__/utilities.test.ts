import { describe, it, expect } from "vitest";
import { convertPrice, formatPrice, NPR_RATES, SUPPORTED_CURRENCIES } from "@/lib/currency";
import { resolveIcon, ICON_MAP, ICON_KEYS } from "@/components/site/sections/icons";

// ─── Currency Conversion ─────────────────────────────────────────────────────

describe("convertPrice", () => {
  it("returns same amount for same currency", () => {
    expect(convertPrice(850000, "NPR", "NPR")).toBe(850000);
  });

  it("converts NPR to USD", () => {
    const result = convertPrice(850000, "NPR", "USD");
    // 850000 paisa = 8500 NPR * 0.0075 = 63.75 USD
    expect(result).toBeCloseTo(63.75, 1);
  });

  it("converts NPR to GBP", () => {
    const result = convertPrice(1000000, "NPR", "GBP");
    // 1000000 paisa = 10000 NPR * 0.006 = 60 GBP
    expect(result).toBeCloseTo(60, 1);
  });

  it("handles zero amount", () => {
    expect(convertPrice(0, "NPR", "USD")).toBe(0);
  });
});

describe("formatPrice", () => {
  it("formats NPR with locale separator", () => {
    const result = formatPrice(8500, "NPR");
    expect(result).toBe("NPR 8,500");
  });

  it("formats USD with currency symbol", () => {
    const result = formatPrice(64, "USD");
    expect(result).toContain("64");
  });

  it("formats zero", () => {
    const result = formatPrice(0, "NPR");
    expect(result).toBe("NPR 0");
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("includes NPR, USD, GBP, AUD, EUR", () => {
    expect(SUPPORTED_CURRENCIES).toContain("NPR");
    expect(SUPPORTED_CURRENCIES).toContain("USD");
    expect(SUPPORTED_CURRENCIES).toContain("GBP");
    expect(SUPPORTED_CURRENCIES).toContain("AUD");
    expect(SUPPORTED_CURRENCIES).toContain("EUR");
  });

  it("has rates for all supported currencies", () => {
    for (const currency of SUPPORTED_CURRENCIES) {
      expect(NPR_RATES[currency]).toBeDefined();
      expect(NPR_RATES[currency]).toBeGreaterThan(0);
    }
  });
});

// ─── Icon Resolver ───────────────────────────────────────────────────────────

describe("resolveIcon", () => {
  it("resolves known icon names", () => {
    expect(resolveIcon("heart")).toBeDefined();
    expect(resolveIcon("compass")).toBeDefined();
    expect(resolveIcon("leaf")).toBeDefined();
    expect(resolveIcon("target")).toBeDefined();
  });

  it("returns fallback (Sparkles) for unknown names", () => {
    const fallback = resolveIcon("nonexistent-icon");
    const sparkles = resolveIcon(undefined);
    expect(fallback).toBe(sparkles); // both return Sparkles
  });

  it("handles null and undefined", () => {
    expect(resolveIcon(null)).toBeDefined();
    expect(resolveIcon(undefined)).toBeDefined();
  });

  it("has sorted ICON_KEYS list", () => {
    const sorted = [...ICON_KEYS].sort();
    expect(ICON_KEYS).toEqual(sorted);
  });

  it("ICON_MAP has 30+ icons", () => {
    expect(Object.keys(ICON_MAP).length).toBeGreaterThanOrEqual(30);
  });
});
