import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { InvoicesClient } from "./InvoicesClient";
import { computeInvoiceTotals, normaliseInvoiceItems } from "@/lib/invoice-utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  await connection();
  const session = await requireAdmin();
  if (!session) notFound();

  const invoices = await db.invoice.findMany({
    include: {
      items: { select: { qty: true, rate: true, discountPercent: true, taxable: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = invoices.map((inv) => {
    const { netTotal } = computeInvoiceTotals(normaliseInvoiceItems(inv.items), Number(inv.vatPercent));
    return {
      id:          inv.id,
      invoiceNo:   inv.invoiceNo,
      status:      inv.status,
      clientName:  inv.clientName,
      invoiceDate: inv.invoiceDate.toISOString(),
      currency:    inv.currency,
      netTotal,
      itemCount:   inv.items.length,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage tax invoices</p>
        </div>
      </div>
      <InvoicesClient invoices={rows} />
    </div>
  );
}
