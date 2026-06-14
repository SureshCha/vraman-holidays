import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const [settings, teamMembers] = await Promise.all([
    getSettings(),
    db.teamMember.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
  ]);

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

      {teamMembers.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-12 mb-6">Our Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {teamMembers.map((m) => (
              <div key={m.id} className="text-center space-y-2">
                {m.imageUrl ? (
                  <Image
                    src={m.imageUrl}
                    alt={m.name}
                    width={120}
                    height={120}
                    className="h-24 w-24 rounded-full object-cover mx-auto"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                    {m.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
                {m.bio && <p className="text-xs text-muted-foreground">{m.bio}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
