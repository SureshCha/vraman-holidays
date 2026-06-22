import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Signature Journeys | ${settings.brand.name}`,
    description:
      "Our signature programmes — curated journeys through Nepal's festivals, faith, wellness, and luxury, crafted by Vraman Holidays.",
  };
}

const JOURNEYS = [
  { title: "Aafno Desh, Aafno Dashain™", subtitle: "A festival homecoming — celebrate Dashain in your homeland, surrounded by family, tradition, and joy." },
  { title: "Aafno Desh, Aafno Muktinath™", subtitle: "A sacred return for the Nepali diaspora and devotees — a soulful pilgrimage to Muktinath." },
  { title: "Muktinath Divine Journey™", subtitle: "A guided spiritual journey to the holy shrine of Muktinath, where faith meets the Himalayas." },
  { title: "Nepal Wellness Tour 2027", subtitle: "Yoga, Ayurveda, meditation, and Himalayan serenity — a journey to restore body and mind." },
  { title: "Luxury Nepal Collection", subtitle: "Nepal's finest stays, private experiences, and seamless service, curated for discerning travellers." },
  { title: "Educational & Student Tours", subtitle: "Immersive, safe, and enriching learning journeys for schools, colleges, and universities." },
  { title: "Corporate Retreats", subtitle: "Team offsites, incentives, and leadership retreats set against inspiring Himalayan backdrops." },
];

export default async function SignatureJourneysPage() {
  const settings = await getSettings();

  return (
    <main>
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Signature Journeys</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Journeys Worth Remembering
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            Our signature programmes are the heart of {settings.brand.name} — distinctive journeys
            crafted around Nepal&apos;s festivals, faith, wellness, and luxury. Detailed itineraries
            for each programme are on their way; reach out and we&apos;ll share the full plan.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {JOURNEYS.map((j) => (
            <div key={j.title} className="rounded-2xl border bg-card p-7 flex flex-col">
              <h2 className="text-xl font-bold">{j.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 flex-1">{j.subtitle}</p>
              <Link
                href={`/propose?journey=${encodeURIComponent(j.title)}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-4"
              >
                Enquire about this journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-muted-foreground mb-4">
            Have a different vision? We design bespoke journeys around your dreams.
          </p>
          <Link
            href="/propose"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Propose Your Destination&trade;
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
