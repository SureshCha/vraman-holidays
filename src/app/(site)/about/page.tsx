import Image from "next/image";
import { cacheTag } from "next/cache";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import {
  MapPin, Phone, Mail, Clock, Target, Eye, Gem, Check,
  Heart, DollarSign, Compass, ShieldCheck, CalendarCheck, Headphones, BadgeCheck, Leaf,
} from "lucide-react";
import { TrustBadges } from "@/components/site/TrustBadges";
import { ExpandableBio } from "@/components/site/ExpandableBio";
import type { Metadata } from "next";

async function getTeamMembers() {
  "use cache";
  cacheTag("team");
  return db.teamMember.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `About Us | ${settings.brand.name}` };
}

const VALUES = [
  { name: "Integrity", desc: "We conduct business honestly, transparently, and responsibly." },
  { name: "Sustainability", desc: "We promote tourism that benefits people, communities, and the environment." },
  { name: "Hospitality", desc: "Every guest is welcomed with genuine care and respect." },
  { name: "Excellence", desc: "We continuously strive to exceed expectations." },
  { name: "Community", desc: "We believe travel should create positive impacts beyond the journey itself." },
];

const TEAM_DIFFERENTIATORS = [
  "Local Expertise",
  "Global Perspective",
  "Multilingual Support",
  "24/7 Assistance",
  "Personalised Service",
  "Strong Industry Network",
  "Responsible Tourism Commitment",
  "Passion for Travel",
];

const WHY_CHOOSE_US = [
  { icon: Heart, title: "Personalised Travel Experiences", desc: "Every traveller is unique. We design journeys around your interests, preferences, and travel goals." },
  { icon: DollarSign, title: "Competitive Pricing", desc: "Strong partnerships with airlines, hotels, transport providers, and tourism stakeholders allow us to deliver exceptional value." },
  { icon: Compass, title: "Trusted Local Expertise", desc: "Our experienced team and certified guides possess extensive destination knowledge throughout Nepal." },
  { icon: ShieldCheck, title: "Reliable Service Delivery", desc: "From airport arrival to departure, we ensure seamless coordination and support." },
  { icon: CalendarCheck, title: "Flexible Itineraries", desc: "Need additional nights, special experiences, or customised arrangements? We make it happen." },
  { icon: Headphones, title: "Dedicated Customer Support", desc: "We understand global time zones and respond promptly to enquiries from around the world." },
  { icon: BadgeCheck, title: "Safety & Professionalism", desc: "Experienced guides, reliable transportation, and carefully selected partners ensure peace of mind." },
  { icon: Leaf, title: "Sustainable Tourism Commitment", desc: "We support responsible tourism that benefits local communities, preserves cultural heritage, and protects the natural environment." },
];

export default async function AboutPage() {
  const [settings, teamMembers] = await Promise.all([getSettings(), getTeamMembers()]);

  return (
    <main>
      {/* Hero */}
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

      {/* Story */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="prose prose-lg max-w-none">
          <p>
            At <strong>{settings.brand.name}</strong>, we believe travel is far more than moving
            from one destination to another — it is about creating meaningful experiences,
            discovering new perspectives, and building memories that last a lifetime.
          </p>
          <p>
            The word <em>&ldquo;Vraman&rdquo;</em> in Nepali means <em>&ldquo;to travel&rdquo;</em>{" "}
            or <em>&ldquo;to embark upon a journey&rdquo;</em>. Inspired by this philosophy, we are
            committed to designing journeys that are personal, authentic, and memorable.
          </p>
          <p>
            Based in the heart of Thamel, Kathmandu, Vraman Holidays is a professionally managed
            travel and tourism company founded by passionate tourism professionals from Western
            Nepal. Our team brings years of expertise in destination management, adventure tourism,
            cultural experiences, pilgrimage journeys, corporate travel, leisure holidays, luxury
            escapes, educational tours, and Himalayan expeditions.
          </p>
          <p>
            Our philosophy is simple: <strong>&ldquo;Stop Selling. Start Compelling.&rdquo;</strong>{" "}
            We do not merely arrange trips; we curate experiences that connect people with places,
            cultures, communities, and emotions.
          </p>
          <p>
            From sacred pilgrimage journeys and family holidays to high-altitude Himalayan
            expeditions and international travel experiences, our goal is to help every traveller
            confidently <strong>Propose Your Destination&trade;</strong> while we take care of every
            detail along the way. Over the years, we have successfully operated countless journeys
            throughout Nepal and beyond, including major trekking adventures and expeditions to
            Mount Everest and other iconic Himalayan peaks.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="rounded-2xl border bg-card p-8 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Our Mission</h2>
            <p className="text-sm text-muted-foreground">
              To create meaningful travel experiences that showcase the beauty, culture,
              spirituality, and adventure of Nepal while contributing positively to local
              communities and sustainable tourism development.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-8 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Our Vision</h2>
            <p className="text-sm text-muted-foreground">
              To become one of Nepal&apos;s most trusted and inspiring travel brands by delivering
              exceptional experiences, fostering meaningful connections, and creating lasting value
              for travellers, communities, and partners.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Gem className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-center">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {VALUES.map((v) => (
            <div key={v.name} className="rounded-2xl border bg-card p-5 space-y-2">
              <h3 className="font-semibold text-primary">{v.name}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Why Travel With {settings.brand.name}?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {WHY_CHOOSE_US.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-card p-6 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
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
          <h2 className="text-2xl font-bold text-center mb-2">Our Team &bull; Our Pride</h2>
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
            <p className="text-lg font-medium">
              13 passionate professionals. One shared mission: creating extraordinary travel
              experiences.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At {settings.brand.name}, we believe exceptional journeys begin with exceptional
              people. Behind every itinerary, airport transfer, pilgrimage, expedition, family
              holiday, corporate event, and unforgettable experience is a dedicated team committed
              to one simple mission — creating journeys that inspire, connect, and leave lasting
              memories.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              United by our philosophy, <strong>&ldquo;Stop Selling. Start Compelling.&rdquo;</strong>,
              our team combines local expertise, global perspective, and genuine Nepalese
              hospitality to help travellers confidently Propose Your Destination&trade;. We are more
              than colleagues — we are travellers, storytellers, planners, guides, strategists, and
              passionate ambassadors of Nepal, sharing one purpose: helping every guest experience a
              journey worth remembering.
            </p>
          </div>

          {/* What Makes Our Team Different? */}
          <div className="max-w-4xl mx-auto mb-14">
            <h3 className="text-lg font-semibold text-center mb-6">What Makes Our Team Different?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TEAM_DIFFERENTIATORS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3"
                >
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
                {m.bio && <ExpandableBio bio={m.bio} />}
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
