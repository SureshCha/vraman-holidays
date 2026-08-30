import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import {
  computeInvoiceTotals,
  normaliseInvoiceItems,
  computeLineAmount,
  amountInWords,
  fmtNPR,
  STATUS_VARIANTS,
} from "@/lib/invoice-utils";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Invoice" };

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await requireAdmin();
  if (!session) notFound();

  const { id } = await params;
  const [invoice, settings] = await Promise.all([
    db.invoice.findUnique({
      where: { id },
      include: { items: { orderBy: { order: "asc" } } },
    }),
    getSettings(),
  ]);
  if (!invoice) notFound();

  const items = normaliseInvoiceItems(invoice.items);
  const { subtotal, taxableAmount, nonTaxableAmount, vatAmount, netTotal } =
    computeInvoiceTotals(items, Number(invoice.vatPercent));

  return (
    <>
      {/* Admin toolbar */}
      <div className="print:hidden mb-6 flex items-center justify-between gap-4">
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Invoices
        </Link>
        <div className="flex gap-2 items-center">
          <Link
            href={`/invoice/${invoice.invoiceNo}`}
            target="_blank"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Open Shareable Link
          </Link>
          <Link
            href={`/admin/invoices/${id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Link>
          <Badge variant={STATUS_VARIANTS[invoice.status]}>
            {invoice.status}
          </Badge>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        :root {
          --brand-primary: ${settings.theme?.primaryColor || "#1A7A50"};
        }
      `}</style>

      {/* Invoice document */}
      <div className="max-w-3xl mx-auto border rounded-lg p-8 print:border-none print:p-0 bg-white text-gray-900 text-sm">

        {/* Header */}
        <div className="flex justify-between items-start gap-6 mb-6">
          <div>
            {settings.brand.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.brand.logoUrl} alt={settings.brand.name} className="h-12 w-auto mb-2 object-contain" />
            )}
            <p className="font-bold text-base" style={{ color: "var(--brand-primary)" }}>{settings.brand.name}</p>
            {settings.contact.address && <p className="text-xs text-gray-500">{settings.contact.address}</p>}
            {settings.contact.phone && <p className="text-xs text-gray-500">{settings.contact.phone}</p>}
            {settings.contact.email && <p className="text-xs text-gray-500">{settings.contact.email}</p>}
            {settings.contact.vatNo && <p className="text-xs text-gray-500">VAT: {settings.contact.vatNo}</p>}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold tracking-wide border-b-2 pb-1 mb-2" style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}>
              TAX INVOICE
            </p>
          </div>
        </div>

        {/* Bill To + Meta */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
          <div className="border p-3 rounded">
            <p className="font-semibold text-[10px] uppercase tracking-wider text-gray-500 mb-2">Bill To</p>
            <p className="font-semibold">{invoice.clientName}</p>
            {invoice.clientAddress && <p className="text-gray-600">{invoice.clientAddress}</p>}
            {invoice.clientPhone && <p className="text-gray-600">{invoice.clientPhone}</p>}
            {invoice.clientEmail && <p className="text-gray-600">{invoice.clientEmail}</p>}
            {invoice.clientPanVat && <p className="text-gray-600">PAN/VAT: {invoice.clientPanVat}</p>}
          </div>
          <div className="border p-3 rounded">
            <table className="w-full">
              <tbody className="space-y-1">
                <tr>
                  <td className="text-gray-500 pr-4 pb-1">Invoice No:</td>
                  <td className="font-semibold text-right">{invoice.invoiceNo}</td>
                </tr>
                <tr>
                  <td className="text-gray-500 pr-4 pb-1">Invoice Date:</td>
                  <td className="text-right">{format(invoice.invoiceDate, "dd-MM-yyyy")}</td>
                </tr>
                {invoice.dueDate && (
                  <tr>
                    <td className="text-gray-500 pr-4 pb-1">Due Date:</td>
                    <td className="text-right">{format(invoice.dueDate, "dd-MM-yyyy")}</td>
                  </tr>
                )}
                <tr>
                  <td className="text-gray-500 pr-4">Payment Mode:</td>
                  <td className="text-right">{invoice.paymentMode}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-xs mb-6 border-collapse">
          <thead>
            <tr style={{ background: "var(--brand-primary)", color: "#fff" }}>
              <th className="text-left px-2 py-2 w-6">#</th>
              <th className="text-left px-2 py-2 w-20">HS Code</th>
              <th className="text-left px-2 py-2">Item Name</th>
              <th className="text-center px-2 py-2 w-12">Qty</th>
              <th className="text-right px-2 py-2 w-20">Rate</th>
              <th className="text-center px-2 py-2 w-16">Discount</th>
              <th className="text-center px-2 py-2 w-16">Tax</th>
              <th className="text-right px-2 py-2 w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="px-2 py-2 text-center text-gray-500">{i + 1}</td>
                <td className="px-2 py-2 text-gray-500">{item.hsCode || "—"}</td>
                <td className="px-2 py-2">
                  <p className="font-medium">{item.itemName}</p>
                  {item.description && <p className="text-gray-400 italic">{item.description}</p>}
                </td>
                <td className="px-2 py-2 text-center">{item.qty} {item.unit}</td>
                <td className="px-2 py-2 text-right tabular-nums">{fmtNPR(item.rate)}</td>
                <td className="px-2 py-2 text-center">{item.discountPercent.toFixed(2)} %</td>
                <td className="px-2 py-2 text-center">{item.taxable ? `${Number(invoice.vatPercent)}% Vat` : "—"}</td>
                <td className="px-2 py-2 text-right tabular-nums font-medium">
                  {fmtNPR(computeLineAmount(item.qty, item.rate, item.discountPercent))}
                </td>
              </tr>
            ))}
            {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-gray-200">
                <td className="px-2 py-4" colSpan={8}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes + Totals */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
            {invoice.notes && (
              <>
                <p className="font-semibold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Notes</p>
                <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Subtotal</span>
              <span className="tabular-nums">{fmtNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Non-Taxable Total</span>
              <span className="tabular-nums">{fmtNPR(nonTaxableAmount)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Taxable Amount</span>
              <span className="tabular-nums">{fmtNPR(taxableAmount)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">VAT ({Number(invoice.vatPercent)}%)</span>
              <span className="tabular-nums">{fmtNPR(vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1" style={{ color: "var(--brand-primary)" }}>
              <span>Net Total</span>
              <span className="tabular-nums">{invoice.currency} {fmtNPR(netTotal)}</span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mt-4 border-t pt-3 text-xs text-center text-gray-600 italic">
          <span className="font-semibold not-italic">Amount in Words: </span>
          {amountInWords(netTotal)}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 border-t pt-3">
          Thank you for your business with {settings.brand.name}.
        </div>
      </div>
    </>
  );
}
