import { MapPin, Users, Globe, Star, Mountain, Plane, Heart, Calendar } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { AnimatedCounter } from "./AnimatedCounter";

const ICON_MAP: Record<string, React.ElementType> = {
  destinations: MapPin,
  travellers: Users,
  travelers: Users,
  happy: Heart,
  countries: Globe,
  tours: Plane,
  packages: Mountain,
  years: Calendar,
  rating: Star,
  reviews: Star,
};

function pickIcon(label: string): React.ElementType {
  const lower = label.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Star;
}

interface StatItem {
  label?: string;
  value?: string;
}

interface StatsData {
  stats?: StatItem[];
}

export function StatsSection({ data }: { data: StatsData }) {
  const stats = data.stats ?? [];
  if (stats.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => {
              const Icon = pickIcon(stat.label ?? "");
              return (
                <div key={i} className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-4xl font-bold text-primary tracking-tight">
                    <AnimatedCounter value={stat.value ?? "0"} />
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label ?? ""}
                  </p>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
