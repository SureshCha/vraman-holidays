import { z } from "zod";
import { ContentStatus } from "@/generated/prisma/enums";

export const packageDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  subtitle: z.string().optional(),
  destinationId: z.string().min(1, "Destination is required"),
  tripTypeIds: z.array(z.string()).default([]),
  durationDays: z.coerce.number().int().min(1, "Must be at least 1 day"),
  durationNights: z.coerce.number().int().min(0),
  priceFrom: z.coerce.number().int().min(0, "Price must be a positive number"),
  currency: z.string().default("NPR"),
  departureCity: z.string().optional(),
  priceBasis: z.string().optional(),
  minGroupSize: z.coerce.number().int().min(1).optional(),
  validUntil: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  terms: z.string().optional(),
});

export const packageSeoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  coverImage: z.string().optional(),
  galleryImages: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
});

export const itineraryDaySchema = z.object({
  id: z.string().optional(),
  dayNumber: z.coerce.number().int().min(1),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  summaryStrip: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  meals: z.object({
    breakfast: z.boolean().default(false),
    lunch: z.boolean().default(false),
    dinner: z.boolean().default(false),
  }).optional(),
  accommodation: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).default([]),
  alert: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  elevation: z.coerce.number().int().optional(),
});

export const departureSchema = z.object({
  id: z.string().optional(),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().min(1, "Return date is required"),
  maxSeats: z.coerce.number().int().min(1),
  priceOverride: z.coerce.number().int().optional(),
  currency: z.string().default("NPR"),
});

export type PackageDetailsInput = z.infer<typeof packageDetailsSchema>;
export type PackageSeoInput = z.infer<typeof packageSeoSchema>;
export type ItineraryDayInput = z.infer<typeof itineraryDaySchema>;
export type DepartureInput = z.infer<typeof departureSchema>;
