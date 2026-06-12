import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const proposeSchema = contactSchema.extend({
  destination: z.string().optional(),
  travelDates: z.string().optional(),
  groupSize: z.coerce.number().int().min(1).optional(),
  budget: z.coerce.number().int().optional(),
  budgetCurrency: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ProposeInput = z.infer<typeof proposeSchema>;
