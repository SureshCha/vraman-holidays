"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { proposeSchema, type ProposeInput } from "@/lib/validators/enquiry";

export default function ProposePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ProposeInput>({
    resolver: zodResolver(proposeSchema) as Resolver<ProposeInput>,
  });

  async function onSubmit(data: ProposeInput) {
    setLoading(true);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: "PROPOSE" }),
    });
    setLoading(false);
    if (res.ok) { setSubmitted(true); toast.success("Proposal sent!"); }
    else { const j = await res.json().catch(() => ({})) as { error?: string }; toast.error(j.error ?? "Failed to send"); }
  }

  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-20 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">We&apos;ll make it happen!</h1>
        <p className="text-muted-foreground">Our team will craft a personalised itinerary and get back to you within 24 hours.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Propose Your Trip</h1>
      <p className="text-muted-foreground mb-8">Tell us your dream destination and we&apos;ll design a trip just for you.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1"><Label>Name *</Label><Input {...form.register("name")} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Email *</Label><Input type="email" {...form.register("email")} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input type="tel" {...form.register("phone")} /></div>
        </div>
        <div className="space-y-1"><Label>Destination</Label><Input {...form.register("destination")} placeholder="e.g. Nepal, Thailand…" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Travel Dates</Label><Input {...form.register("travelDates")} placeholder="e.g. Mar 2027" /></div>
          <div className="space-y-1"><Label>Group Size</Label><Input type="number" min={1} {...form.register("groupSize")} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Budget</Label><Input type="number" {...form.register("budget")} placeholder="Amount" /></div>
          <div className="space-y-1"><Label>Currency</Label><Input {...form.register("budgetCurrency")} placeholder="NPR" /></div>
        </div>
        <div className="space-y-1"><Label>Message *</Label><Textarea {...form.register("message")} rows={4} placeholder="Tell us about your dream trip…" /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Submit Proposal"}</Button>
      </form>
    </main>
  );
}
