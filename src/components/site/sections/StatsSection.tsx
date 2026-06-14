import { AnimatedSection } from "./AnimatedSection";

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
    <section className="bg-primary/5 py-14">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl font-bold text-primary">{stat.value ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{stat.label ?? ""}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
