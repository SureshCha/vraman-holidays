import { z } from "zod";
import { BookingStatus, PaymentGateway, PaymentStatus } from "@/generated/prisma/enums";

// ── Booking creation (used by the booking flow + /api/bookings) ───────────────

const travellerBaseFields = {
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  nationality: z.string().optional(),
  passportNo: z.string().optional(),
  dob: z.string().optional(),
  specialRequests: z.string().optional(),
};

const travellerInputSchema = z.object({
  ...travellerBaseFields,
  email: z.string().email("Valid email required").or(z.literal("")),
  phone: z.string().or(z.literal("")),
  address: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const createBookingSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  departureId: z.string().optional(),
  currency: z.string().default("NPR"),
  notes: z.string().optional(),
  travelInsurance: z.boolean().optional(),
  travellers: z.array(travellerInputSchema).min(1, "At least one traveller is required"),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ── Booking amendment (used by admin edit forms + admin actions) ──────────────

export const bookingDetailsSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  departureId: z.string().nullable(),
  totalAmount: z.coerce.number().int().min(0),
  discountAmount: z.coerce.number().int().min(0),
  travelInsurance: z.boolean(),
  notes: z.string().max(2000).optional(),
});
export type BookingDetailsInput = z.infer<typeof bookingDetailsSchema>;

export const travellerUpdateSchema = z.object({
  ...travellerBaseFields,
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone is required"),
});
export type TravellerUpdateInput = z.infer<typeof travellerUpdateSchema>;

// ── Admin payment schemas ─────────────────────────────────────────────────────

export const adminPaymentSchema = z.object({
  gateway: z.nativeEnum(PaymentGateway),
  amount: z.coerce.number().min(0),        // NPR display value; action × 100
  status: z.nativeEnum(PaymentStatus).default("PENDING"),
  gatewayTxnId: z.string().optional(),
  currency: z.string().default("NPR"),
});
export type AdminPaymentInput = z.infer<typeof adminPaymentSchema>;

export const updatePaymentSchema = adminPaymentSchema.pick({ status: true, gatewayTxnId: true });
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

// ── Admin manual booking creation ─────────────────────────────────────────────

export const adminCreateBookingSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  departureId: z.string().nullable(),
  status: z.nativeEnum(BookingStatus),
  currency: z.string().default("NPR"),
  totalAmount: z.coerce.number().min(0),    // NPR display value; action converts × 100
  discountAmount: z.coerce.number().min(0).default(0),
  travelInsurance: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
  travellers: z.array(travellerInputSchema).min(1, "At least one traveller is required"),
  payment: adminPaymentSchema.optional(),
});
export type AdminCreateBookingInput = z.infer<typeof adminCreateBookingSchema>;
