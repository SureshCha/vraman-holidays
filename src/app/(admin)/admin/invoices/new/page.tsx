import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InvoiceEditor } from "../[id]/edit/InvoiceEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Invoice" };

export default async function NewInvoicePage() {
  await connection();
  const session = await requireAdmin();
  if (!session) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Invoices
        </Link>
        <h1 className="text-2xl font-bold">New Invoice</h1>
      </div>
      <InvoiceEditor />
    </div>
  );
}
