import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { MapPin, Phone, Mail, Clock, Globe, Heart, Shield } from "lucide-react";
import { TrustBadges } from "@/components/site/TrustBadges";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `About Us | ${settings.brand.name}` };
}

export default async function AboutPage() {
  const [settings, teamMembers] = await Promise.all([
    getSettings(),
    db.teamMember.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            About {settings.brand.name}
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
            {settings.brand.tagline}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="prose prose-lg max-w-none">
          <p>
            <strong>{settings.brand.name}</strong> is a boutique travel agency based in Thamel,
            Kathmandu. We specialise in crafting personalised travel experiences across Nepal and
            international destinations including India, Maldives, Thailand, Singapore, Australia,
            the UK, and Pakistan.
          </p>
          <p>
            Whether you&apos;re looking for adventure in the Himalayas, a cultural immersion, a
            romantic honeymoon, or a pilgrimage journey — our team designs every trip around your
            preferences, schedule, and budget.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Globe, title: "Local Expertise", desc: "Deep knowledge of every destination — we live and breathe travel in Nepal and beyond." },
              { icon: Heart, title: "Personalised Service", desc: "No cookie-cutter tours. Every itinerary is tailored to your interests and pace." },
              { icon: Shield, title: "Trusted & Reliable", desc: "Licensed agency with verified guides, transparent pricing, and 24/7 support." },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border bg-card p-6 text-center space-y-3"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {teamMembers.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Our Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {teamMembers.map((m) => (
              <div key={m.id} className="text-center space-y-3 group">
                {m.imageUrl ? (
                  <Image
                    src={m.imageUrl}
                    alt={m.name}
                    width={120}
                    height={120}
                    className="h-28 w-28 rounded-full object-cover mx-auto ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto text-3xl font-bold text-white ring-4 ring-primary/10">
                    {m.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
                {m.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-3">{m.bio}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: MapPin, label: settings.contact.address },
              { icon: Phone, label: settings.contact.phone },
              { icon: Mail, label: settings.contact.email },
              { icon: Clock, label: settings.contact.officeHours },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <TrustBadges />
      </section>
    </main>
  );
}
