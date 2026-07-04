import { describe, it, expect } from "vitest";
import {
  packageDetailsSchema,
  packageSeoSchema,
  itineraryDaySchema,
  departureSchema,
} from "@/lib/validators/package";

// ─── Package Details Schema ──────────────────────────────────────────────────

describe("packageDetailsSchema", () => {
  const validInput = {
    title: "Thailand Tour",
    slug: "thailand-tour",
    destinationId: "dest-123",
    durationDays: 5,
    durationNights: 4,
    priceFrom: 9900000,
  };

  it("accepts valid minimal input", () => {
    const result = packageDetailsSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = packageDetailsSchema.safeParse({
      ...validInput,
      subtitle: "A vibrant journey",
      departureCity: "Kathmandu",
      priceBasis: "Per person, double sharing",
      minGroupSize: 5,
      validUntil: "2026-07-31",
      description: "<p>Amazing trip</p>",
      highlights: ["Beach", "Temple"],
      inclusions: ["Hotel", "Flights"],
      exclusions: ["Insurance"],
      terms: "<p>Non-refundable</p>",
      tripTypeIds: ["tt-1", "tt-2"],
      currency: "NPR",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = packageDetailsSchema.safeParse({ ...validInput, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    const result = packageDetailsSchema.safeParse({ ...validInput, slug: "Has Spaces!" });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = packageDetailsSchema.safeParse({ ...validInput, priceFrom: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects zero days", () => {
    const result = packageDetailsSchema.safeParse({ ...validInput, durationDays: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers to integers", () => {
    const result = packageDetailsSchema.safeParse({
      ...validInput,
      durationDays: "5",
      durationNights: "4",
      priceFrom: "9900000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationDays).toBe(5);
      expect(result.data.priceFrom).toBe(9900000);
    }
  });

  it("defaults currency to NPR", () => {
    const result = packageDetailsSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("NPR");
    }
  });

  it("defaults arrays to empty", () => {
    const result = packageDetailsSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.highlights).toEqual([]);
      expect(result.data.inclusions).toEqual([]);
      expect(result.data.exclusions).toEqual([]);
    }
  });
});

// ─── Package SEO Schema ──────────────────────────────────────────────────────

describe("packageSeoSchema", () => {
  it("accepts empty input with defaults", () => {
    const result = packageSeoSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(false);
      expect(result.data.status).toBe("DRAFT");
      expect(result.data.galleryImages).toEqual([]);
    }
  });

  it("accepts full SEO data", () => {
    const result = packageSeoSchema.safeParse({
      metaTitle: "Thailand Tour | Vraman",
      metaDescription: "Experience Thailand",
      coverImage: "https://res.cloudinary.com/img.jpg",
      galleryImages: ["img1.jpg", "img2.jpg"],
      featured: true,
      status: "PUBLISHED",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = packageSeoSchema.safeParse({ status: "INVALID" });
    expect(result.success).toBe(false);
  });
});

// ─── Itinerary Day Schema ────────────────────────────────────────────────────

describe("itineraryDaySchema", () => {
  const validDay = {
    dayNumber: 1,
    title: "Arrive Bangkok",
    description: "Transfer to hotel",
  };

  it("accepts valid minimal day", () => {
    const result = itineraryDaySchema.safeParse(validDay);
    expect(result.success).toBe(true);
  });

  it("accepts all optional day fields", () => {
    const result = itineraryDaySchema.safeParse({
      ...validDay,
      subtitle: "A Vibrant Seaside Escape",
      summaryStrip: "Airport → Van → Hotel",
      meals: { breakfast: true, lunch: false, dinner: true },
      accommodation: "Golden Beach Pattaya",
      imageUrl: "https://img.jpg",
      images: ["img1.jpg", "img2.jpg"],
      alert: "Safari World closed on Mondays",
      latitude: 13.7563,
      longitude: 100.5018,
      elevation: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = itineraryDaySchema.safeParse({ ...validDay, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing description", () => {
    const result = itineraryDaySchema.safeParse({ ...validDay, description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects day number 0", () => {
    const result = itineraryDaySchema.safeParse({ ...validDay, dayNumber: 0 });
    expect(result.success).toBe(false);
  });

  it("defaults images to empty array", () => {
    const result = itineraryDaySchema.safeParse(validDay);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.images).toEqual([]);
    }
  });
});

// ─── Departure Schema ────────────────────────────────────────────────────────

describe("departureSchema", () => {
  it("accepts valid departure", () => {
    const result = departureSchema.safeParse({
      departureDate: "2026-08-01",
      returnDate: "2026-08-05",
      maxSeats: 12,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing departure date", () => {
    const result = departureSchema.safeParse({
      departureDate: "",
      returnDate: "2026-08-05",
      maxSeats: 12,
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero seats", () => {
    const result = departureSchema.safeParse({
      departureDate: "2026-08-01",
      returnDate: "2026-08-05",
      maxSeats: 0,
    });
    expect(result.success).toBe(false);
  });
});
