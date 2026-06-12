import { z } from "zod";
import { ContentStatus } from "@/generated/prisma/enums";

export const destinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().int().default(0),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
});

export type DestinationInput = z.infer<typeof destinationSchema>;
