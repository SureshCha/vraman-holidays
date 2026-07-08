import { SmartMedia } from "@/components/site/SmartMedia";
import { cacheTag } from "next/cache";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { TrustBadges } from "@/components/site/TrustBadges";
import { ExpandableBio } from "@/components/site/ExpandableBio";
import { SectionRenderer } from "@/components/site/sections";
import type { Metadata } from "next";

async function getTeamMembers() {
  "use cache";
  cacheTag("team");
  return db.teamMember.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
}

async function getAboutSections() {
  "use cache";
  cacheTag("pages");
  const page = await db.page.findUnique({
    where: { slug: "about", status: "PUBLISHED" },
    include: { sections: { where: { visible: true }, orderBy: { order: "asc" } } },
  });
  return page?.sections ?? [];
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `About Us | ${settings.brand.name}` };
}

export default async function AboutPage() {
  const [settings, teamMembers, sections] = await Promise.all([
    getSettings(),
    getTeamMembers(),
    getAboutSections(),
  ]);

  return (
    <main>
      {/* Hero (brand settings — already admin-editable via Settings) */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            About {settings.brand.name}
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            {settings.brand.tagline}
          </p>
          {settings.brand.philosophy && (
            <p className="text-base font-medium text-primary mt-2">{settings.brand.philosophy}</p>
          )}
        </div>
      </section>

      {/* Editable content blocks (Admin → Pages → About): story, mission/vision,
          values, why-choose-us, team intro, what-makes-us-different */}
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={{
            id: section.id,
            type: section.type,
            order: section.order,
            data: section.data as Record<string, unknown>,
          }}
        />
      ))}

      {/* Team grid (dynamic — managed in Admin → Team) */}
      {teamMembers.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((m) => (
              <div key={m.id} className="text-center space-y-3 group">
                {m.imageUrl ? (
                  <SmartMedia
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
                {m.bio && <ExpandableBio bio={m.bio} />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact (settings) */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: MapPin, label: settings.contact.address },
              { icon: Phone, label: settings.contact.phone },
              ...(settings.contact.phones ?? []).map((p) => ({
                icon: Phone, label: `${p.name}: ${p.number}`,
              })),
              { icon: Mail, label: settings.contact.email },
              { icon: Clock, label: settings.contact.officeHours },
            ].map((item, i) => (
              <div
                key={i}
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
