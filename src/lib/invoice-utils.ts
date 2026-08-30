import type { PrismaClient } from "@/generated/prisma/client";
import type { InvoiceStatus } from "@/generated/prisma/client";

export const STATUS_VARIANTS: Record<InvoiceStatus, "success" | "warning" | "default" | "danger"> = {
  PAID:      "success",
  SENT:      "warning",
  DRAFT:     "default",
  CANCELLED: "danger",
};

export const fmtNPR = (n: number): string =>
  n.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Returns the Nepal fiscal year suffix (e.g. "83-84") for a given CE date.
 *  Nepal fiscal year starts ~Shrawan 1 (≈ July 16). */
export function fiscalYearSuffix(date: Date): string {
  const year = date.getFullYear();
  const fiscalStart = new Date(year, 6, 16); // July 16
  const bsYear = date >= fiscalStart ? year + 57 : year + 56;
  const yy = String(bsYear % 100).padStart(2, "0");
  const yy1 = String((bsYear + 1) % 100).padStart(2, "0");
  return `${yy}-${yy1}`;
}

/** Generates the next sequential invoice number for the fiscal year, e.g. "INV003/83-84". */
export async function nextInvoiceNo(db: PrismaClient, date: Date): Promise<string> {
  const fy = fiscalYearSuffix(date);
  const count = await db.invoice.count({ where: { invoiceNo: { endsWith: `/${fy}` } } });
  return `INV${String(count + 1).padStart(3, "0")}/${fy}`;
}

/** Converts Prisma Decimal fields to plain numbers for computation. */
export function normaliseInvoiceItems<T extends { qty: unknown; rate: unknown; discountPercent: unknown }>(
  items: T[]
): (Omit<T, "qty" | "rate" | "discountPercent"> & { qty: number; rate: number; discountPercent: number })[] {
  return items.map((it) => ({
    ...it,
    qty:             Number(it.qty),
    rate:            Number(it.rate),
    discountPercent: Number(it.discountPercent),
  }));
}

/** Computes the pre-tax amount for a single line item. */
export function computeLineAmount(qty: number, rate: number, discountPercent: number): number {
  return qty * rate * (1 - discountPercent / 100);
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function wordsUnder1000(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n] ?? "";
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + wordsUnder1000(n % 100) : "");
}

/** Converts a NPR amount (e.g. 3049.87) to words. */
export function amountInWords(amount: number): string {
  const wholePart = Math.floor(amount);
  const paisaPart = Math.round((amount - wholePart) * 100);

  const chunks: string[] = [];
  const crore = Math.floor(wholePart / 10_000_000);
  const lakh = Math.floor((wholePart % 10_000_000) / 100_000);
  const thousand = Math.floor((wholePart % 100_000) / 1_000);
  const remainder = wholePart % 1_000;

  if (crore) chunks.push(wordsUnder1000(crore) + " Crore");
  if (lakh) chunks.push(wordsUnder1000(lakh) + " Lakh");
  if (thousand) chunks.push(wordsUnder1000(thousand) + " Thousand");
  if (remainder) chunks.push(wordsUnder1000(remainder));

  const words = chunks.join(" ").trim() || "Zero";
  return `${words} and ${String(paisaPart).padStart(2, "0")}/100 Nepalese Rupee`;
}

/** Compute invoice totals from line items. */
export function computeInvoiceTotals(items: {
  qty: number;
  rate: number;
  discountPercent: number;
  taxable: boolean;
}[], vatPercent: number) {
  let subtotal = 0;
  let taxableAmount = 0;
  let nonTaxableAmount = 0;

  for (const item of items) {
    const lineAmt = computeLineAmount(item.qty, item.rate, item.discountPercent);
    subtotal += lineAmt;
    if (item.taxable) taxableAmount += lineAmt;
    else nonTaxableAmount += lineAmt;
  }

  const vatAmount = taxableAmount * (vatPercent / 100);
  const netTotal = subtotal + vatAmount;

  return { subtotal, taxableAmount, nonTaxableAmount, vatAmount, netTotal };
}
