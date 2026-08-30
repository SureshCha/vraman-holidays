"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  bookingDetailsSchema,
  travellerUpdateSchema,
  type BookingDetailsInput,
  type TravellerUpdateInput,
} from "@/lib/validators/booking";
import { updateBookingDetails, updateTraveller, addPaymentToBooking, updatePaymentTransaction } from "../../actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { FieldError } from "@/components/admin/FieldError";
import { Badge } from "@/components/ui/badge";
import { GATEWAY_OPTIONS, PAYMENT_STATUS_CREATE_OPTIONS, PAYMENT_STATUS_EDIT_OPTIONS } from "@/lib/payment-options";

type BookingData = {
  id: string;
  bookingRef: string;
  packageTitle: string;
  status: string;
  departureId: string | null;
  totalAmount: number;
  discountAmount: number;
  currency: string;
  travelInsurance: boolean;
  notes: string;
  departures: { id: string; label: string }[];
  payments: {
    id: string;
    gateway: string;
    status: string;
    gatewayTxnId: string | null;
    amount: number;
    currency: string;
    createdAt: string;
  }[];
  travellers: {
    id: string;
    isPrimary: boolean;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    passportNo: string;
    dob: string;
    specialRequests: string;
  }[];
};

// ── Booking Details Form ──────────────────────────────────────────────────────

function BookingDetailsSection({ booking }: { booking: BookingData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<BookingDetailsInput>({
      resolver: zodResolver(bookingDetailsSchema) as Resolver<BookingDetailsInput>,
      defaultValues: {
        status: booking.status as BookingDetailsInput["status"],
        departureId: booking.departureId,
        totalAmount: Math.round(booking.totalAmount / 100),
        discountAmount: Math.round(booking.discountAmount / 100),
        travelInsurance: booking.travelInsurance,
        notes: booking.notes,
      },
    });

  function onSubmit(data: BookingDetailsInput) {
    startTransition(async () => {
      const result = await updateBookingDetails(booking.id, {
        ...data,
        totalAmount: Math.round(data.totalAmount * 100),
        discountAmount: Math.round(data.discountAmount * 100),
      });
      if (result.success) {
        toast.success("Booking details saved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Status */}
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          defaultValue={booking.status}
          onValueChange={(v) => setValue("status", v as BookingDetailsInput["status"])}
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

      {/* Departure */}
      {booking.departures.length > 0 && (
        <div className="space-y-1.5">
          <Label>Departure</Label>
          <Select
            defaultValue={booking.departureId ?? "none"}
            onValueChange={(v) => setValue("departureId", v === "none" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No departure selected" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {booking.departures.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Total Amount ({booking.currency})</Label>
          <Input
            type="number"
            min={0}
            step={1}
            {...register("totalAmount")}
          />
          <FieldError error={errors.totalAmount} />
        </div>
        <div className="space-y-1.5">
          <Label>Discount ({booking.currency})</Label>
          <Input
            type="number"
            min={0}
            step={1}
            {...register("discountAmount")}
          />
          <FieldError error={errors.discountAmount} />
        </div>
      </div>

      {/* Travel Insurance */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="travelInsurance"
          defaultChecked={booking.travelInsurance}
          onCheckedChange={(v) => setValue("travelInsurance", Boolean(v))}
        />
        <Label htmlFor="travelInsurance">Travel Insurance included</Label>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label>Internal Notes</Label>
        <Textarea
          rows={3}
          placeholder="Any notes for this booking…"
          {...register("notes")}
        />
        <FieldError error={errors.notes} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Booking Details"}
      </Button>
    </form>
  );
}

// ── Single Traveller Form ─────────────────────────────────────────────────────

function TravellerForm({ traveller }: { traveller: BookingData["travellers"][number] }) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } =
    useForm<TravellerUpdateInput>({
      resolver: zodResolver(travellerUpdateSchema) as Resolver<TravellerUpdateInput>,
      defaultValues: {
        firstName: traveller.firstName,
        lastName: traveller.lastName,
        email: traveller.email,
        phone: traveller.phone,
        nationality: traveller.nationality,
        passportNo: traveller.passportNo,
        dob: traveller.dob,
        specialRequests: traveller.specialRequests,
      },
    });

  function onSubmit(data: TravellerUpdateInput) {
    startTransition(async () => {
      const result = await updateTraveller(traveller.id, data);
      if (result.success) {
        toast.success(`${traveller.firstName} ${traveller.lastName} updated`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>First Name</Label>
          <Input {...register("firstName")} />
          <FieldError error={errors.firstName} />
        </div>
        <div className="space-y-1.5">
          <Label>Last Name</Label>
          <Input {...register("lastName")} />
          <FieldError error={errors.lastName} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          <FieldError error={errors.email} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input {...register("phone")} />
          <FieldError error={errors.phone} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Nationality</Label>
          <Input {...register("nationality")} />
        </div>
        <div className="space-y-1.5">
          <Label>Passport No</Label>
          <Input {...register("passportNo")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Date of Birth</Label>
        <Input type="date" {...register("dob")} />
      </div>

      <div className="space-y-1.5">
        <Label>Special Requests</Label>
        <Textarea rows={2} {...register("specialRequests")} />
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Save Traveller"}
      </Button>
    </form>
  );
}

// ── Payment Row (edit existing transaction) ───────────────────────────────────

function PaymentRow({ txn, currency }: { txn: BookingData["payments"][number]; currency: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(txn.status);
  const [txnId, setTxnId] = useState(txn.gatewayTxnId ?? "");

  function handleSave() {
    startTransition(async () => {
      const result = await updatePaymentTransaction(txn.id, {
        status,
        gatewayTxnId: txnId || undefined,
      });
      if (result.success) {
        toast.success("Payment updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{txn.gateway}</Badge>
          <Badge variant={txn.status === "SUCCESS" ? "success" : txn.status === "PENDING" ? "warning" : "danger"}>
            {txn.status}
          </Badge>
          <span className="text-sm font-medium">
            {txn.currency} {(txn.amount / 100).toLocaleString()}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(txn.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as string)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_EDIT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Reference / Txn ID</Label>
          <Input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <Button size="sm" type="button" onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

// ── Add Payment Form ──────────────────────────────────────────────────────────

function AddPaymentForm({
  bookingId,
  defaultAmount,
  currency,
}: {
  bookingId: string;
  defaultAmount: number;
  currency: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [gateway, setGateway] = useState("BANK_TRANSFER");
  const [amount, setAmount] = useState(defaultAmount);
  const [status, setStatus] = useState("PENDING");
  const [txnId, setTxnId] = useState("");

  function handleAdd() {
    startTransition(async () => {
      const result = await addPaymentToBooking(bookingId, {
        gateway,
        amount,
        status,
        gatewayTxnId: txnId || undefined,
        currency,
      });
      if (result.success) {
        toast.success("Payment added");
        setTxnId("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="border border-dashed rounded-lg p-4 space-y-4">
      <p className="text-sm font-medium">Add Payment</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Gateway</Label>
          <Select value={gateway} onValueChange={(v) => setGateway(v as string)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {GATEWAY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Amount ({currency})</Label>
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as string)}>
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
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <Button size="sm" type="button" onClick={handleAdd} disabled={isPending}>
        {isPending ? "Adding…" : "Add Payment"}
      </Button>
    </div>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────

export function BookingEditForm({ booking }: { booking: BookingData }) {
  return (
    <Tabs defaultValue="booking">
      <TabsList>
        <TabsTrigger value="booking">Booking Details</TabsTrigger>
        <TabsTrigger value="travellers">
          Travellers ({booking.travellers.length})
        </TabsTrigger>
        <TabsTrigger value="payments">
          Payments ({booking.payments.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="booking" className="pt-6">
        <BookingDetailsSection booking={booking} />
      </TabsContent>

      <TabsContent value="travellers" className="pt-6 space-y-6">
        {booking.travellers.map((t) => (
          <div key={t.id} className="border rounded-lg p-4 space-y-1">
            <p className="font-medium text-sm mb-3">
              {t.firstName} {t.lastName}
              {t.isPrimary && (
                <span className="ml-2 text-[10px] font-normal text-muted-foreground border rounded px-1 py-0.5">
                  Primary
                </span>
              )}
            </p>
            <TravellerForm traveller={t} />
          </div>
        ))}
      </TabsContent>

      <TabsContent value="payments" className="pt-6 space-y-4">
        {booking.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          booking.payments.map((p) => (
            <PaymentRow key={p.id} txn={p} currency={booking.currency} />
          ))
        )}
        <AddPaymentForm
          bookingId={booking.id}
          defaultAmount={Math.round(booking.totalAmount / 100)}
          currency={booking.currency}
        />
      </TabsContent>
    </Tabs>
  );
}
