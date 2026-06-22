import Link from "next/link";
import { getSettings } from "@/lib/settings";
import {
  Landmark, Mountain, Flower2, Users, PawPrint, Drama, UtensilsCrossed, PartyPopper, ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Why Nepal? | ${settings.brand.name}`,
    description:
      "Spiritual, Himalayan, wellness, family, wildlife, cultural, culinary, and festival Nepal — discover why Nepal belongs at the top of your travel list.",
  };
}

const THEMES = [
  { icon: Landmark, title: "Spiritual Nepal", desc: "The birthplace of Buddha and a land of countless temples, stupas, and sacred shrines — a journey for the soul." },
  { icon: Mountain, title: "Himalayan Nepal", desc: "Home to eight of the world's fourteen highest peaks, including Everest — the ultimate playground for adventurers." },
  { icon: Flower2, title: "Wellness Nepal", desc: "Yoga, Ayurveda, meditation retreats, and mountain air that heals body and mind alike." },
  { icon: Users, title: "Family Nepal", desc: "Safe, warm, and wonder-filled experiences that create memories for every generation." },
  { icon: PawPrint, title: "Wildlife Nepal", desc: "One-horned rhinos, Bengal tigers, and rich biodiversity across Chitwan, Bardia, and beyond." },
  { icon: Drama, title: "Cultural Nepal", desc: "Living heritage, ancient cities, diverse ethnic traditions, and timeless craftsmanship." },
  { icon: UtensilsCrossed, title: "Culinary Nepal", desc: "From momos and dal bhat to Newari feasts — a flavourful journey through Himalayan kitchens." },
  { icon: PartyPopper, title: "Festival Nepal", desc: "Dashain, Tihar, Holi, and a calendar bursting with colour, devotion, and celebration." },
];

export default async function WhyNepalPage() {
  const settings = await getSettings();

  return (
    <main>
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Why Nepal?</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Few places on earth pack so much into one country. Nepal is spiritual and adventurous,
            serene and exhilarating, ancient and alive. Here are eight reasons travellers fall in
            love with it — and why {settings.brand.name} loves sharing it.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {THEMES.map((t) => (
            <div key={t.title} className="rounded-2xl border bg-card p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <t.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-semibold">{t.title}</h2>
              <p className="text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Explore Nepal Destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
