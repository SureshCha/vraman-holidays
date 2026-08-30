import { z } from "zod";

export const invoiceItemSchema = z.object({
  id:              z.string().optional(),
  order:           z.number().int().default(0),
  hsCode:          z.string().max(20).default(""),
  itemName:        z.string().min(1, "Item name is required"),
  description:     z.string().max(500).default(""),
  qty:             z.coerce.number().min(0.001, "Qty must be > 0"),
  unit:            z.string().default("Pcs"),
  rate:            z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  taxable:         z.boolean().default(true),
});

export const invoiceSchema = z.object({
  clientName:    z.string().min(1, "Client name is required"),
  clientAddress: z.string().default(""),
  clientEmail:   z.string().email("Invalid email").or(z.literal("")).default(""),
  clientPhone:   z.string().default(""),
  clientPanVat:  z.string().default(""),
  invoiceDate:   z.string().min(1, "Invoice date is required"),
  dueDate:       z.string().optional(),
  paymentMode:   z.string().default("Credit"),
  currency:      z.string().default("NPR"),
  vatPercent:    z.coerce.number().min(0).max(100).default(13),
  notes:         z.string().max(2000).default(""),
  items:         z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
