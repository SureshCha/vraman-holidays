"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createBookingSchema, type CreateBookingInput } from "@/lib/validators/booking";

interface Props {
  packageId: string;
  departureId?: string;
  onComplete: (bookingId: string, bookingRef: string, totalAmount: number) => void;
}

export function StepTravellerInfo({ packageId, departureId, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema) as Resolver<CreateBookingInput>,
    defaultValues: {
      packageId,
      departureId,
      currency: "NPR",
      travellers: [{ firstName: "", lastName: "", email: "", phone: "", isPrimary: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "travellers",
  });

  async function onSubmit(data: CreateBookingInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json() as { bookingId?: string; bookingRef?: string; totalAmount?: number; error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Failed to create booking");
        return;
      }
      onComplete(json.bookingId!, json.bookingRef!, json.totalAmount ?? 0);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {index === 0 ? "Primary Traveller" : `Traveller ${index + 1}`}
            </h3>
            {index > 0 && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(index)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name *</Label>
              <Input {...form.register(`travellers.${index}.firstName`)} />
              {form.formState.errors.travellers?.[index]?.firstName && (
                <p className="text-xs text-destructive">{form.formState.errors.travellers[index]?.firstName?.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Last Name *</Label>
              <Input {...form.register(`travellers.${index}.lastName`)} />
            </div>
          </div>

          {index === 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" {...form.register(`travellers.${index}.email`)} />
                {form.formState.errors.travellers?.[index]?.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.travellers[index]?.email?.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input type="tel" {...form.register(`travellers.${index}.phone`)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nationality</Label>
              <Input {...form.register(`travellers.${index}.nationality`)} placeholder="Nepali" />
            </div>
            <div className="space-y-1">
              <Label>Passport No.</Label>
              <Input {...form.register(`travellers.${index}.passportNo`)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <Input type="date" {...form.register(`travellers.${index}.dob`)} />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input {...form.register(`travellers.${index}.address`)} placeholder="City, Country" />
            </div>
          </div>

          {index === 0 && (
            <div className="space-y-1">
              <Label>Special Requests</Label>
              <Textarea
                {...form.register(`travellers.${index}.specialRequests`)}
                placeholder="Dietary requirements, accessibility needs, room preferences…"
                rows={2}
              />
            </div>
          )}

          {index < fields.length - 1 && <Separator />}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ firstName: "", lastName: "", email: "", phone: "", isPrimary: false })}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Traveller
      </Button>

      <div className="flex items-start gap-3 rounded-xl border p-4 bg-muted/30">
        <Checkbox
          id="travelInsurance"
          checked={form.watch("travelInsurance")}
          onCheckedChange={(v) => form.setValue("travelInsurance", !!v)}
        />
        <label htmlFor="travelInsurance" className="text-sm leading-tight cursor-pointer">
          <span className="font-medium">Add travel insurance</span>
          <br />
          <span className="text-xs text-muted-foreground">
            Protect your trip against cancellations, medical emergencies, and lost luggage.
          </span>
        </label>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Creating Booking…" : "Continue to Payment →"}
      </Button>
    </form>
  );
}
