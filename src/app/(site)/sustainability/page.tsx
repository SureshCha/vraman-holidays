import { getSettings } from "@/lib/settings";
import { Leaf, HeartHandshake, TreePine, BookOpen, Scale } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Sustainability | ${settings.brand.name}`,
    description:
      "Travel with purpose. Vraman Holidays is committed to responsible tourism, community empowerment, environmental stewardship, and ethical business.",
  };
}

const COMMITMENTS = [
  { icon: Leaf, title: "Responsible Tourism", desc: "We design journeys that respect local cultures, minimise impact, and give back to the places we visit." },
  { icon: HeartHandshake, title: "Community Empowerment", desc: "We partner with local guides, families, and businesses so tourism benefits the communities that host it." },
  { icon: TreePine, title: "Environmental Stewardship", desc: "We protect Nepal's natural heritage — its mountains, forests, rivers, and wildlife — for generations to come." },
  { icon: BookOpen, title: "Tourism Education", desc: "We invest in training and awareness, raising standards across the industry and within communities." },
  { icon: Scale, title: "Ethical Business Practices", desc: "We operate with honesty, transparency, and fairness toward our travellers, partners, and team." },
];

export default async function SustainabilityPage() {
  const settings = await getSettings();

  return (
    <main>
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Travel with Purpose</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Most companies write a paragraph about sustainability. We&apos;re building a movement.
          </p>
          <p className="text-lg text-muted-foreground mt-3">
            At {settings.brand.name}, we believe tourism should enrich travellers while creating
            positive impacts for local communities, cultures, and the environment.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Our Commitments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {COMMITMENTS.map((c) => (
            <div key={c.title} className="rounded-2xl border bg-card p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <c.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
