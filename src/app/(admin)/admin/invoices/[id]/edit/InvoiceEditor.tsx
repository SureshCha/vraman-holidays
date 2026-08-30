"use client";

import { useTransition } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { invoiceSchema, type InvoiceInput } from "@/lib/validators/invoice";
import { computeInvoiceTotals } from "@/lib/invoice-utils";
import { createInvoice, updateInvoice } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { FieldError } from "@/components/admin/FieldError";

interface Props {
  invoiceId?: string;
  initialData?: InvoiceInput & { invoiceNo?: string };
}

const PRESET_ITEMS = [
  "Airfare Charges",
  "Hotel Booking Charges",
  "Visa Processing Fee",
  "Service Charges",
  "Guide Fee",
  "Transport Charges",
  "Travel Insurance",
];

const today = new Date().toISOString().slice(0, 10);

export function InvoiceEditor({ invoiceId, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(invoiceId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceInput>,
    defaultValues: initialData ?? {
      clientName:    "",
      clientAddress: "",
      clientEmail:   "",
      clientPhone:   "",
      clientPanVat:  "",
      invoiceDate:   today,
      dueDate:       "",
      paymentMode:   "Credit",
      currency:      "NPR",
      vatPercent:    13,
      notes:         "",
      items: [{ order: 0, hsCode: "", itemName: "", description: "", qty: 1, unit: "Pcs", rate: 0, discountPercent: 0, taxable: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const watchedVat = useWatch({ control, name: "vatPercent" }) ?? 13;

  const totals = computeInvoiceTotals(
    watchedItems.map((it) => ({
      qty: Number(it?.qty ?? 0),
      rate: Number(it?.rate ?? 0),
      discountPercent: Number(it?.discountPercent ?? 0),
      taxable: Boolean(it?.taxable ?? true),
    })),
    Number(watchedVat)
  );

  function onSubmit(data: InvoiceInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateInvoice(invoiceId!, data)
        : await createInvoice(data);

      if (result.success) {
        toast.success(isEdit ? "Invoice updated" : `Invoice created`);
        router.push("/admin/invoices");
      } else {
        toast.error(result.error);
      }
    });
  }

  function addPreset(name: string | null) {
    if (!name) return;
    append({ order: fields.length, hsCode: "", itemName: name, description: "", qty: 1, unit: "Pcs", rate: 0, discountPercent: 0, taxable: true });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">

      {/* ── Invoice Meta ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm border-b pb-2">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Invoice Date *</Label>
            <Input type="date" {...register("invoiceDate")} />
            <FieldError error={errors.invoiceDate} />
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input type="date" {...register("dueDate")} />
          </div>
          <div className="space-y-1.5">
            <Label>Payment Mode</Label>
            <Select
              defaultValue={initialData?.paymentMode ?? "Credit"}
              onValueChange={(v) => v && setValue("paymentMode", v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="eSewa">eSewa</SelectItem>
                <SelectItem value="Khalti">Khalti</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>VAT %</Label>
            <Input type="number" min={0} max={100} step={0.01} {...register("vatPercent")} />
          </div>
        </div>
      </section>

      {/* ── Bill To ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm border-b pb-2">Bill To</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Client Name *</Label>
            <Input {...register("clientName")} placeholder="Company or person name" />
            <FieldError error={errors.clientName} />
          </div>
          <div className="space-y-1.5">
            <Label>PAN / VAT No</Label>
            <Input {...register("clientPanVat")} placeholder="Client PAN or VAT number" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address</Label>
            <Input {...register("clientAddress")} placeholder="Street, City" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register("clientEmail")} />
            <FieldError error={errors.clientEmail} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input {...register("clientPhone")} />
          </div>
        </div>
      </section>

      {/* ── Line Items ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="font-semibold text-sm">Line Items</h2>
          <div className="flex items-center gap-2">
            <Select onValueChange={addPreset}>
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue placeholder="Add preset item…" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_ITEMS.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ order: fields.length, hsCode: "", itemName: "", description: "", qty: 1, unit: "Pcs", rate: 0, discountPercent: 0, taxable: true })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Item
            </Button>
          </div>
        </div>

        {errors.items && typeof errors.items.message === "string" && (
          <p className="text-destructive text-xs">{errors.items.message}</p>
        )}

        <div className="space-y-3">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr_0.6fr_auto_auto] gap-2 text-[10px] uppercase tracking-wide text-muted-foreground px-1">
            <span>Item Name / Description</span>
            <span>HS Code</span>
            <span>Qty / Unit</span>
            <span>Rate (NPR)</span>
            <span>Disc %</span>
            <span>Taxable</span>
            <span></span>
            <span></span>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-3 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_0.6fr_0.6fr_auto_auto] sm:gap-2 sm:items-start">
              {/* Item name + description */}
              <div className="space-y-1">
                <Input
                  placeholder="Item name *"
                  {...register(`items.${index}.itemName`)}
                  className="text-sm"
                />
                <Input
                  placeholder="Description (optional)"
                  {...register(`items.${index}.description`)}
                  className="text-xs text-muted-foreground"
                />
                <FieldError error={errors.items?.[index]?.itemName} />
              </div>

              <div>
                <Input placeholder="HS Code" {...register(`items.${index}.hsCode`)} className="text-sm" />
              </div>

              <div className="flex gap-1">
                <Input
                  type="number"
                  min={0.001}
                  step={0.001}
                  placeholder="Qty"
                  {...register(`items.${index}.qty`)}
                  className="text-sm w-16"
                />
                <Input
                  placeholder="Unit"
                  {...register(`items.${index}.unit`)}
                  className="text-sm w-16"
                />
              </div>

              <div>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  {...register(`items.${index}.rate`)}
                  className="text-sm"
                />
              </div>

              <div>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="0"
                  {...register(`items.${index}.discountPercent`)}
                  className="text-sm"
                />
              </div>

              <div className="flex items-center justify-center pt-2">
                <Checkbox
                  defaultChecked={field.taxable !== false}
                  onCheckedChange={(v) => setValue(`items.${index}.taxable`, Boolean(v))}
                />
              </div>

              <div className="flex items-center justify-center pt-1">
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>

              {/* Line amount preview */}
              <div className="text-right text-xs text-muted-foreground pt-2 sm:pt-2">
                {(() => {
                  const it = watchedItems[index];
                  if (!it) return null;
                  const amt = Number(it.qty ?? 0) * Number(it.rate ?? 0) * (1 - Number(it.discountPercent ?? 0) / 100);
                  return amt.toLocaleString("en-NP", { minimumFractionDigits: 2 });
                })()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Totals Preview ───────────────────────────────────────── */}
      <section className="space-y-2 max-w-sm ml-auto">
        <h2 className="font-semibold text-sm border-b pb-2">Summary</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{totals.subtotal.toLocaleString("en-NP", { minimumFractionDigits: 2 })}</span>
          </div>
          {totals.nonTaxableAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Non-Taxable</span>
              <span className="tabular-nums">{totals.nonTaxableAmount.toLocaleString("en-NP", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Taxable Amount</span>
            <span className="tabular-nums">{totals.taxableAmount.toLocaleString("en-NP", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>VAT ({watchedVat}%)</span>
            <span className="tabular-nums">{totals.vatAmount.toLocaleString("en-NP", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-1">
            <span>Net Total</span>
            <span className="tabular-nums">NPR {totals.netTotal.toLocaleString("en-NP", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </section>

      {/* ── Notes ────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <Label>Notes</Label>
        <Textarea rows={3} placeholder="Any notes or payment instructions…" {...register("notes")} />
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Invoice")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/invoices")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
