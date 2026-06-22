import Link from "next/link";
import { getSettings } from "@/lib/settings";
import {
  Handshake, Globe2, Building2, School, CalendarDays, MapPinned, Check, ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Travel Trade Partners | ${settings.brand.name}`,
    description:
      "Partner with Vraman Holidays — DMC services in Nepal for Indian agents, international tour operators, corporate clients, schools, and event organisers.",
  };
}

const PARTNERS = [
  { icon: Handshake, title: "For Indian Travel Agents", desc: "Reliable, competitively priced Nepal packages with fast turnaround and dedicated B2B support." },
  { icon: Globe2, title: "For International Tour Operators", desc: "A trusted ground partner in Nepal delivering seamless operations and authentic experiences." },
  { icon: Building2, title: "For Corporate Clients", desc: "MICE, incentives, offsites, and corporate retreats managed end to end." },
  { icon: School, title: "For Schools & Universities", desc: "Safe, structured, and enriching educational tours and student programmes." },
  { icon: CalendarDays, title: "For Event Organizers", desc: "Logistics, accommodation, transport, and on-ground coordination for events of any scale." },
  { icon: MapPinned, title: "DMC Services in Nepal", desc: "Full destination-management services — accommodation, transport, guides, permits, and bespoke itineraries." },
];

const WHY_CLIENTS = [
  "Personalised Service",
  "Local Expertise",
  "Competitive Pricing",
  "Flexible Itineraries",
  "Reliable Operations",
  "24/7 Support",
  "Sustainable Tourism",
  "Trusted Industry Partnerships",
];

export default async function TravelTradePage() {
  const settings = await getSettings();

  return (
    <main>
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Travel Trade Partners</h1>
          <p className="text-lg text-muted-foreground mt-4">
            {settings.brand.name} is a trusted destination-management partner in Nepal. We work hand
            in hand with agents, operators, institutions, and corporates to deliver seamless,
            memorable journeys for their clients.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PARTNERS.map((p) => (
            <div key={p.title} className="rounded-2xl border bg-card p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <p.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-semibold">{p.title}</h2>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Why Partners Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {WHY_CLIENTS.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <h2 className="text-2xl font-bold">Let&apos;s Build a Partnership</h2>
        <p className="text-muted-foreground mt-3 mb-6">
          Tell us about your business and the journeys your clients are looking for. Our trade team
          will get back to you with rates, sample programmes, and support details.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Become a Partner
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
