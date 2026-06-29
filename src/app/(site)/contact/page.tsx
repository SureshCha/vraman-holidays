"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { contactSchema, type ContactInput } from "@/lib/validators/enquiry";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema) as Resolver<ContactInput>,
  });

  async function onSubmit(data: ContactInput) {
    setLoading(true);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: "CONTACT" }),
    });
    setLoading(false);
    if (res.ok) { setSubmitted(true); toast.success("Message sent!"); }
    else { const j = await res.json().catch(() => ({})) as { error?: string }; toast.error(j.error ?? "Failed to send"); }
  }

  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-20 text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Thank you!</h1>
        <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Let&apos;s Plan Your Journey</h1>
      <p className="text-muted-foreground mb-8">
        Every unforgettable journey begins with a conversation. Tell us where you wish to go, and
        we&apos;ll help you confidently Propose Your Destination&trade;.
      </p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1"><Label>Name *</Label><Input {...form.register("name")} />{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
        <div className="space-y-1"><Label>Email *</Label><Input type="email" {...form.register("email")} />{form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}</div>
        <div className="space-y-1"><Label>Phone *</Label><Input type="tel" {...form.register("phone")} />{form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}</div>
        <div className="space-y-1"><Label>Message *</Label><Textarea {...form.register("message")} rows={5} />{form.formState.errors.message && <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>}</div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send Message"}</Button>
      </form>
    </main>
  );
}
