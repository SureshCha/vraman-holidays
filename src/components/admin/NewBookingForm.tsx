"use client";

import { useEffect, useTransition, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  adminCreateBookingSchema,
  type AdminCreateBookingInput,
} from "@/lib/validators/booking";
import { createManualBooking } from "@/app/(admin)/admin/bookings/actions";
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
import { FieldError } from "./FieldError";
import { GATEWAY_OPTIONS, PAYMENT_STATUS_CREATE_OPTIONS } from "@/lib/payment-options";

type PackageOption = {
  id: string;
  title: string;
  priceFrom: number;
  currency: string;
  departures: { id: string; label: string; priceOverride: number | null }[];
};

export function NewBookingForm({ packages }: { packages: PackageOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optional payment section state
  const [includePayment, setIncludePayment] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState("BANK_TRANSFER");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [paymentTxnId, setPaymentTxnId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
    formState: { errors },
  } = useForm<AdminCreateBookingInput>({
    resolver: zodResolver(adminCreateBookingSchema) as Resolver<AdminCreateBookingInput>,
    defaultValues: {
      packageId: "",
      departureId: null,
      status: "PENDING",
      currency: "NPR",
      totalAmount: 0,
      discountAmount: 0,
      travelInsurance: false,
      notes: "",
      travellers: [{ firstName: "", lastName: "", email: "", phone: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "travellers" });

  const watchedPackageId = watch("packageId");
  const watchedDepartureId = watch("departureId");
  const watchedTravellerCount = fields.length;

  // Auto-fill total amount when package / departure / traveller count changes.
  // Admin can still manually override the field afterwards.
  useEffect(() => {
    const pkg = packages.find((p) => p.id === watchedPackageId);
    if (!pkg) return;
    const dep = pkg.departures.find((d) => d.id === watchedDepartureId);
    const effectivePrice = dep?.priceOverride ?? pkg.priceFrom; // paisa
    const totalNPR = Math.round((effectivePrice / 100) * watchedTravellerCount);
    setValue("totalAmount", totalNPR, { shouldValidate: false, shouldDirty: false });
  }, [watchedPackageId, watchedDepartureId, watchedTravellerCount, packages, setValue]);

  const selectedPackage = packages.find((p) => p.id === watchedPackageId);

  function onSubmit(data: AdminCreateBookingInput) {
    startTransition(async () => {
      const payment = includePayment
        ? {
            gateway: paymentGateway,
            amount: paymentAmount,
            status: paymentStatus,
            gatewayTxnId: paymentTxnId || undefined,
            currency: "NPR",
          }
        : undefined;
      const result = await createManualBooking({ ...data, payment });
      if (result.success) {
        toast.success(`Booking ${result.data.bookingRef} created`);
        router.push(`/admin/bookings/${result.data.bookingId}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Booking Details ─────────────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="font-semibold text-sm border-b pb-2">Booking Details</h2>

        <div className="space-y-1.5">
          <Label>Package *</Label>
          <Select
            onValueChange={(v) => {
              setValue("packageId", v as string, { shouldValidate: true });
              setValue("departureId", null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError error={errors.packageId} />
        </div>

        {selectedPackage && selectedPackage.departures.length > 0 && (
          <div className="space-y-1.5">
            <Label>Departure</Label>
            <Select
              onValueChange={(v) => setValue("departureId", (v as string) === "none" ? null : v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="— None —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {selectedPackage.departures.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            defaultValue="PENDING"
            onValueChange={(v) => setValue("status", v as AdminCreateBookingInput["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <FieldError error={errors.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Total Amount (NPR)</Label>
            <Input type="number" min={0} step={1} {...register("totalAmount")} />
            <FieldError error={errors.totalAmount} />
          </div>
          <div className="space-y-1.5">
            <Label>Discount (NPR)</Label>
            <Input type="number" min={0} step={1} {...register("discountAmount")} />
            <FieldError error={errors.discountAmount} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="travelInsurance"
            onCheckedChange={(v) => setValue("travelInsurance", Boolean(v))}
          />
          <Label htmlFor="travelInsurance">Travel Insurance included</Label>
        </div>

        <div className="space-y-1.5">
          <Label>Internal Notes</Label>
          <Textarea rows={3} placeholder="Any notes…" {...register("notes")} />
          <FieldError error={errors.notes} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="includePayment"
              checked={includePayment}
              onCheckedChange={(v) => {
                const checked = Boolean(v);
                setIncludePayment(checked);
                if (checked) setPaymentAmount(getValues("totalAmount") ?? 0);
              }}
            />
            <Label htmlFor="includePayment">Record a payment</Label>
          </div>

          {includePayment && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Gateway</Label>
                  <Select value={paymentGateway} onValueChange={(v) => setPaymentGateway(v as string)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GATEWAY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount (NPR)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as string)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_CREATE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Reference / Txn ID</Label>
                  <Input
                    value={paymentTxnId}
                    onChange={(e) => setPaymentTxnId(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Travellers ──────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm border-b pb-2">
          Travellers ({fields.length})
        </h2>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {index === 0 ? "Primary Traveller" : `Traveller ${index + 1}`}
              </p>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input {...register(`travellers.${index}.firstName`)} />
                <FieldError error={errors.travellers?.[index]?.firstName} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input {...register(`travellers.${index}.lastName`)} />
                <FieldError error={errors.travellers?.[index]?.lastName} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...register(`travellers.${index}.email`)} />
                <FieldError error={errors.travellers?.[index]?.email} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input {...register(`travellers.${index}.phone`)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nationality</Label>
                <Input {...register(`travellers.${index}.nationality`)} />
              </div>
              <div className="space-y-1.5">
                <Label>Passport No</Label>
                <Input {...register(`travellers.${index}.passportNo`)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" {...register(`travellers.${index}.dob`)} />
            </div>

            <div className="space-y-1.5">
              <Label>Special Requests</Label>
              <Textarea rows={2} {...register(`travellers.${index}.specialRequests`)} />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ firstName: "", lastName: "", email: "", phone: "" })}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Traveller
        </Button>
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create Booking"}
      </Button>
    </form>
  );
}
