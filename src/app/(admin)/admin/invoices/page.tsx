import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { InvoicesClient } from "./InvoicesClient";
import { computeInvoiceTotals } from "@/lib/invoice-utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  await connection();
  const session = await requireAdmin();
  if (!session) notFound();

  const invoices = await db.invoice.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = invoices.map((inv) => {
    const items = inv.items.map((it) => ({
      qty: Number(it.qty),
      rate: Number(it.rate),
      discountPercent: Number(it.discountPercent),
      taxable: it.taxable,
    }));
    const { netTotal } = computeInvoiceTotals(items, Number(inv.vatPercent));
    return {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      status: inv.status,
      clientName: inv.clientName,
      invoiceDate: inv.invoiceDate.toISOString(),
      currency: inv.currency,
      netTotal,
      itemCount: inv.items.length,
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
