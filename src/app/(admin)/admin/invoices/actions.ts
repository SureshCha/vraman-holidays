"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { invoiceSchema, type InvoiceItemInput } from "@/lib/validators/invoice";
import { nextInvoiceNo } from "@/lib/invoice-utils";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { sendInvoiceEmail as sendInvoiceEmailLib } from "@/lib/email/send";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toItemPayload(items: InvoiceItemInput[]) {
  return items.map((item, i) => ({
    order:           item.order ?? i,
    hsCode:          item.hsCode,
    itemName:        item.itemName,
    description:     item.description,
    qty:             item.qty,
    unit:            item.unit,
    rate:            item.rate,
    discountPercent: item.discountPercent,
    taxable:         item.taxable,
  }));
}

function prismaCode(err: unknown): string | undefined {
  return (err as { code?: string })?.code;
}

export async function createInvoice(
  input: unknown
): Promise<ActionResult<{ id: string; invoiceNo: string }>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const data = parsed.data;
  const invoiceDate = new Date(data.invoiceDate);

  // Retry up to 3 times on P2002 (concurrent invoice number collision)
  for (let attempt = 0; attempt < 3; attempt++) {
    const invoiceNo = await nextInvoiceNo(db, invoiceDate);
    try {
      const invoice = await db.invoice.create({
        data: {
          invoiceNo,
          clientName:    data.clientName,
          clientAddress: data.clientAddress,
          clientEmail:   data.clientEmail,
          clientPhone:   data.clientPhone,
          clientPanVat:  data.clientPanVat,
          invoiceDate,
          dueDate:       data.dueDate ? new Date(data.dueDate) : null,
          paymentMode:   data.paymentMode,
          currency:      data.currency,
          vatPercent:    data.vatPercent,
          notes:         data.notes,
          items: { create: toItemPayload(data.items) },
        },
      });
      revalidatePath("/admin/invoices");
      return { success: true, data: { id: invoice.id, invoiceNo: invoice.invoiceNo } };
    } catch (err: unknown) {
      if (prismaCode(err) === "P2002" && attempt < 2) continue;
      throw err;
    }
  }
  // Unreachable — loop always returns or throws
  return { success: false, error: "Failed to generate invoice number" };
}

export async function updateInvoice(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const data = parsed.data;

  let invoiceNo: string;
  try {
    const updated = await db.invoice.update({
      where: { id },
      select: { invoiceNo: true },
      data: {
        clientName:    data.clientName,
        clientAddress: data.clientAddress,
        clientEmail:   data.clientEmail,
        clientPhone:   data.clientPhone,
        clientPanVat:  data.clientPanVat,
        invoiceDate:   new Date(data.invoiceDate),
        dueDate:       data.dueDate ? new Date(data.dueDate) : null,
        paymentMode:   data.paymentMode,
        currency:      data.currency,
        vatPercent:    data.vatPercent,
        notes:         data.notes,
        items: { deleteMany: {}, create: toItemPayload(data.items) },
      },
    });
    invoiceNo = updated.invoiceNo;
  } catch (err: unknown) {
    if (prismaCode(err) === "P2025") return { success: false, error: "Invoice not found" };
    throw err;
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath(`/invoice/${encodeURIComponent(invoiceNo)}`);
  return { success: true, data: undefined };
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.invoice.update({ where: { id }, data: { status } });
  } catch (err: unknown) {
    if (prismaCode(err) === "P2025") return { success: false, error: "Invoice not found" };
    throw err;
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  return { success: true, data: undefined };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.invoice.delete({ where: { id } });
  } catch (err: unknown) {
    if (prismaCode(err) === "P2025") return { success: false, error: "Invoice not found" };
    throw err;
  }

  revalidatePath("/admin/invoices");
  return { success: true, data: undefined };
}

export async function sendInvoiceEmail(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const invoice = await db.invoice.findUnique({ where: { id }, select: { clientEmail: true, status: true } });
  if (!invoice) return { success: false, error: "Invoice not found" };
  if (!invoice.clientEmail) return { success: false, error: "No client email on file" };

  try {
    await sendInvoiceEmailLib(id);
  } catch (e) {
    console.error("Invoice email delivery failed:", e);
    return { success: false, error: "Failed to send email — check SMTP/Resend configuration" };
  }

  if (invoice.status === "DRAFT") {
    await db.invoice.update({ where: { id }, data: { status: "SENT" } });
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  return { success: true, data: undefined };
}
