"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ContactFormData {
  title?: string;
}

export function ContactFormSection({ data }: { data: ContactFormData }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "CONTACT", name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        toast.error(data.error ?? "Failed to send message");
        return;
      }
      setSubmitted(true);
      toast.success("Message sent!");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="container mx-auto px-4 py-14 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <h3 className="text-xl font-semibold">Thank you!</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ve received your message and will get back to you soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-14">
      <div className="max-w-md mx-auto space-y-6">
        {data.title && (
          <h2 className="text-2xl font-bold text-center">{data.title}</h2>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cf-name">Name</Label>
            <Input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cf-email">Email</Label>
            <Input id="cf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cf-message">Message</Label>
            <textarea
              id="cf-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border rounded-md p-3 text-sm resize-y"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </section>
  );
}
