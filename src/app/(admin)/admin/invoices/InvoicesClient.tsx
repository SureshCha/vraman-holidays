"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { deleteInvoice, updateInvoiceStatus } from "./actions";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { InvoiceStatusSelect } from "@/components/admin/InvoiceStatusSelect";

interface InvoiceRow {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  clientName: string;
  invoiceDate: string;
  currency: string;
  netTotal: number;
  itemCount: number;
}


export function InvoicesClient({ invoices: initial }: { invoices: InvoiceRow[] }) {
  const [invoices, setInvoices] = useState(initial);
  useEffect(() => setInvoices(initial), [initial]);
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteInvoice(id);
      if (result.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        toast.success("Invoice deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleStatusChange(id: string, status: InvoiceStatus) {
    startTransition(async () => {
      const result = await updateInvoiceStatus(id, status);
      if (result.success) {
        setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status } : inv));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/admin/invoices/new")}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground text-sm">
          No invoices yet. Create your first invoice.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice No</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-xs">{inv.invoiceNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.clientName}</p>
                    <p className="text-xs text-muted-foreground">{inv.itemCount} item{inv.itemCount !== 1 ? "s" : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(inv.invoiceDate), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {inv.currency} {inv.netTotal.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusSelect
                      value={inv.status}
                      onValueChange={(v) => handleStatusChange(inv.id, v)}
                      triggerClassName="h-7 w-32 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/invoices/${inv.id}`)}
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/invoices/${inv.id}/edit`)}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="sm" title="Delete">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        }
                        title="Delete Invoice"
                        description={`Delete invoice ${inv.invoiceNo}? This cannot be undone.`}
                        onConfirm={() => handleDelete(inv.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
