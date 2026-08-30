import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InvoiceEditor } from "./InvoiceEditor";
import type { Metadata } from "next";
import { format } from "date-fns";

export const metadata: Metadata = { title: "Edit Invoice" };

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await requireAdmin();
  if (!session) notFound();

  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!invoice) notFound();

  const initialData = {
    invoiceNo:     invoice.invoiceNo,
    clientName:    invoice.clientName,
    clientAddress: invoice.clientAddress,
    clientEmail:   invoice.clientEmail,
    clientPhone:   invoice.clientPhone,
    clientPanVat:  invoice.clientPanVat,
    invoiceDate:   format(invoice.invoiceDate, "yyyy-MM-dd"),
    dueDate:       invoice.dueDate ? format(invoice.dueDate, "yyyy-MM-dd") : "",
    paymentMode:   invoice.paymentMode,
    currency:      invoice.currency,
    vatPercent:    Number(invoice.vatPercent),
    notes:         invoice.notes,
    items: invoice.items.map((it) => ({
      id:              it.id,
      order:           it.order,
      hsCode:          it.hsCode,
      itemName:        it.itemName,
      description:     it.description,
      qty:             Number(it.qty),
      unit:            it.unit,
      rate:            Number(it.rate),
      discountPercent: Number(it.discountPercent),
      taxable:         it.taxable,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/invoices/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {invoice.invoiceNo}
        </Link>
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <p className="text-sm text-muted-foreground">{invoice.invoiceNo} · {invoice.clientName}</p>
      </div>
      <InvoiceEditor invoiceId={id} initialData={initialData} />
    </div>
  );
}
