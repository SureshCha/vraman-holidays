import Link from "next/link";
import { getSettings } from "@/lib/settings";
import {
  Mountain, Compass, Users, Flower2, GraduationCap, Briefcase, Gem, Camera, ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Experiences | ${settings.brand.name}`,
    description:
      "People don't buy destinations — they buy experiences. Explore our pilgrimage, adventure, wellness, family, luxury, and educational journeys.",
  };
}

const EXPERIENCES = [
  { icon: Mountain, title: "Pilgrimage & Spiritual Journeys", desc: "Sacred destinations and soulful journeys to Muktinath, Pashupatinath, Lumbini, and beyond." },
  { icon: Compass, title: "Adventure & Expeditions", desc: "Trekking, mountaineering, and high-altitude expeditions for those who chase the extraordinary." },
  { icon: Users, title: "Family Holidays", desc: "Thoughtfully paced journeys that delight every generation, from little ones to grandparents." },
  { icon: Flower2, title: "Wellness & Mindfulness", desc: "Yoga, Ayurveda, meditation, and Himalayan serenity to restore body and mind." },
  { icon: GraduationCap, title: "Educational Tours", desc: "Immersive, safe, and enriching learning journeys for schools, colleges, and universities." },
  { icon: Briefcase, title: "Corporate Travel", desc: "Offsites, incentives, MICE, and leadership retreats in inspiring settings." },
  { icon: Gem, title: "Luxury Experiences", desc: "The finest stays, private guides, and seamless, white-glove service throughout." },
  { icon: Camera, title: "Photography Expeditions", desc: "Guided journeys to Nepal's most photogenic landscapes, cultures, and wildlife." },
];

export default async function ExperiencesPage() {
  const settings = await getSettings();

  return (
    <main>
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Experiences</h1>
          <p className="text-xl font-medium text-primary mt-4">
            People don&apos;t buy destinations. People buy experiences.
          </p>
          <p className="text-lg text-muted-foreground mt-3">
            At {settings.brand.name}, every journey is built around the way you want to feel — whether
            that&apos;s awe, devotion, adventure, calm, or connection.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {EXPERIENCES.map((e) => (
            <div key={e.title} className="rounded-2xl border bg-card p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <e.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-semibold">{e.title}</h2>
              <p className="text-sm text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/propose"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Tell us the experience you&apos;re dreaming of
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
