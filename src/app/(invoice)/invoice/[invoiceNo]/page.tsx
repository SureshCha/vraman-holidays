import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { computeInvoiceTotals, amountInWords } from "@/lib/invoice-utils";
import { format } from "date-fns";
import { InvoiceActions } from "./InvoiceActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tax Invoice" };

async function InvoiceContent({ params }: { params: Promise<{ invoiceNo: string }> }) {
  await connection();
  const { invoiceNo } = await params;
  const decodedNo = decodeURIComponent(invoiceNo);

  const [invoice, settings] = await Promise.all([
    db.invoice.findUnique({
      where: { invoiceNo: decodedNo },
      include: { items: { orderBy: { order: "asc" } } },
    }),
    getSettings(),
  ]);
  if (!invoice) notFound();

  const items = invoice.items.map((it) => ({
    ...it,
    qty:             Number(it.qty),
    rate:            Number(it.rate),
    discountPercent: Number(it.discountPercent),
  }));
  const { subtotal, taxableAmount, nonTaxableAmount, vatAmount, netTotal } =
    computeInvoiceTotals(items, Number(invoice.vatPercent));

  const fmt = (n: number) => n.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-muted/30 border-b px-6 py-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>
          Tax invoice{" "}
          <span className="font-mono font-semibold text-foreground">{invoice.invoiceNo}</span>
          {" — "}share this link or print to PDF
        </span>
        <InvoiceActions invoiceNo={invoice.invoiceNo} />
      </div>

      {settings.theme?.fontFamily && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(settings.theme.fontFamily)}:wght@400;500;600;700&display=swap`}
        />
      )}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        :root {
          --brand-primary: ${settings.theme?.primaryColor || "#1A7A50"};
        }
      `}</style>

      {/* 4px top brand bar */}
      <div style={{ height: 4, background: "var(--brand-primary)" }} />

      <main
        className="max-w-3xl mx-auto px-6 py-8 print:py-0 text-sm bg-white text-gray-900"
        style={{ fontFamily: settings.theme?.fontFamily ? `'${settings.theme.fontFamily}', sans-serif` : undefined }}
      >

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
            <p
              className="text-xl font-bold tracking-wide border-b-2 pb-1"
              style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}
            >
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
              <tbody>
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
              <th className="text-center px-2 py-2 w-16">Qty</th>
              <th className="text-right px-2 py-2 w-20">Rate</th>
              <th className="text-center px-2 py-2 w-16">Discount</th>
              <th className="text-center px-2 py-2 w-16">Tax</th>
              <th className="text-right px-2 py-2 w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const amt = item.qty * item.rate * (1 - item.discountPercent / 100);
              return (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-2 py-2.5 text-center text-gray-500">{i + 1}</td>
                  <td className="px-2 py-2.5 text-gray-500">{item.hsCode || "—"}</td>
                  <td className="px-2 py-2.5">
                    <p className="font-medium">{item.itemName}</p>
                    {item.description && <p className="text-gray-400 italic">{item.description}</p>}
                  </td>
                  <td className="px-2 py-2.5 text-center">{item.qty} {item.unit}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{fmt(item.rate)}</td>
                  <td className="px-2 py-2.5 text-center">{item.discountPercent.toFixed(2)} %</td>
                  <td className="px-2 py-2.5 text-center">{item.taxable ? `${Number(invoice.vatPercent)}% Vat` : "—"}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums font-medium">{fmt(amt)}</td>
                </tr>
              );
            })}
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
              <span className="tabular-nums">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Discount (0.00%)</span>
              <span className="tabular-nums">(0.00)</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Non-Taxable Total</span>
              <span className="tabular-nums">{fmt(nonTaxableAmount)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Taxable Amount</span>
              <span className="tabular-nums">{fmt(taxableAmount)}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-500">VAT ({Number(invoice.vatPercent)}%)</span>
              <span className="tabular-nums">{fmt(vatAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1" style={{ color: "var(--brand-primary)" }}>
              <span>Net Total</span>
              <span className="tabular-nums">{invoice.currency} {fmt(netTotal)}</span>
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
      </main>
    </>
  );
}

export default function InvoicePage({ params }: { params: Promise<{ invoiceNo: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading invoice…
      </div>
    }>
      <InvoiceContent params={params} />
    </Suspense>
  );
}
