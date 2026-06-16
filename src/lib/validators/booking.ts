import { z } from "zod";

export const travellerSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName:  z.string().min(1, "Last name required"),
  email:     z.string().email("Valid email required"),
  phone:     z.string().min(7, "Phone number required"),
  nationality:     z.string().optional(),
  passportNo:      z.string().optional(),
  dob:             z.string().optional(),
  address:         z.string().optional(),
  specialRequests: z.string().optional(),
  isPrimary:       z.boolean().default(false),
});

export const createBookingSchema = z.object({
  packageId:       z.string().min(1),
  departureId:     z.string().optional(),
  travellers:      z.array(travellerSchema).min(1, "At least one traveller required"),
  currency:        z.string().default("NPR"),
  notes:           z.string().optional(),
  travelInsurance: z.boolean().default(false),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type TravellerInput    = z.infer<typeof travellerSchema>;
