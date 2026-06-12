import { getSettings } from "@/lib/settings";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">About {settings.brand.name}</h1>
      <p className="text-lg text-muted-foreground mb-8">{settings.brand.tagline}</p>

      <div className="prose prose-sm max-w-none mb-12">
        <p>
          {settings.brand.name} is a boutique travel agency based in Thamel, Kathmandu.
          We specialise in crafting personalised travel experiences across Nepal and international
          destinations including India, Maldives, Thailand, Singapore, Australia, the UK, and Pakistan.
        </p>
        <p>
          Whether you&apos;re looking for adventure in the Himalayas, a cultural immersion, a romantic
          honeymoon, or a pilgrimage journey — our team designs every trip around your preferences,
          schedule, and budget.
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span>{settings.contact.address}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-primary shrink-0" />
          <span>{settings.contact.phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-primary shrink-0" />
          <span>{settings.contact.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span>{settings.contact.officeHours}</span>
        </div>
      </div>
    </main>
  );
}
