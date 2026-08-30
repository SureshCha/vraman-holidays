"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { invoiceSchema, type InvoiceItemInput } from "@/lib/validators/invoice";
import { nextInvoiceNo } from "@/lib/invoice-utils";
import type { InvoiceStatus } from "@/generated/prisma/client";

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

export async function createInvoice(
  input: unknown
): Promise<ActionResult<{ id: string; invoiceNo: string }>> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const data = parsed.data;
  const invoiceDate = new Date(data.invoiceDate);
  const invoiceNo = await nextInvoiceNo(db, invoiceDate);

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

  try {
    await db.invoice.update({
      where: { id },
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
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P2025") return { success: false, error: "Invoice not found" };
    throw err;
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  return { success: true, data: undefined };
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  await db.invoice.update({ where: { id }, data: { status } });
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  return { success: true, data: undefined };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  await db.invoice.delete({ where: { id } });
  revalidatePath("/admin/invoices");
  return { success: true, data: undefined };
}
