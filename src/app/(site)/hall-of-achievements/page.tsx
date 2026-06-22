import { getSettings } from "@/lib/settings";
import { Mountain, Users, Globe2, Briefcase, GraduationCap, CalendarClock, BarChart3 } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Hall of Achievements | ${settings.brand.name}`,
    description:
      "Milestones that define us — Everest expeditions, major group departures, international partnerships, and years of trusted service.",
  };
}

// `stat` is intentionally a placeholder ("—") until the client supplies real figures.
const ACHIEVEMENTS = [
  { icon: Mountain, stat: "—", title: "Everest Expeditions", desc: "Successfully organised treks and expeditions to Everest and other iconic Himalayan peaks." },
  { icon: Users, stat: "—", title: "Major Group Departures", desc: "Large-scale group journeys delivered with seamless coordination and care." },
  { icon: Globe2, stat: "—", title: "International Partnerships", desc: "Trusted relationships with agents and operators across the globe." },
  { icon: Briefcase, stat: "—", title: "Corporate Events", desc: "Offsites, incentives, and corporate retreats hosted across Nepal." },
  { icon: GraduationCap, stat: "—", title: "Student Tours", desc: "Educational journeys delivered for schools, colleges, and universities." },
  { icon: CalendarClock, stat: "—", title: "Years of Service", desc: "Years of crafting meaningful journeys since our founding in 2020." },
  { icon: BarChart3, stat: "—", title: "Happy Travellers", desc: "Guests who have trusted us to design their journeys." },
];

export default async function HallOfAchievementsPage() {
  const settings = await getSettings();

  return (
    <main>
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Hall of Achievements</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Milestones that reflect the trust travellers and partners place in {settings.brand.name}
            — and the journeys we&apos;re proud to have made possible.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.title} className="rounded-2xl border bg-card p-6 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <a.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{a.stat}</p>
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          Figures will be updated with verified statistics.
        </p>
      </section>
    </main>
  );
}
