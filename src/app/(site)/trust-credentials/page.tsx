import { getSettings } from "@/lib/settings";
import { BadgeCheck, ShieldCheck, Building2, Leaf, Globe2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Trust, Credentials & Industry Memberships | ${settings.brand.name}`,
    description:
      "Vraman Holidays is a legally registered tourism company in Nepal, affiliated with leading national and international tourism organisations. Verify our credentials.",
  };
}

type Credential = {
  title: string;
  detail?: string;
  description: string;
  verifyLabel?: string;
  verifyUrl?: string;
};

const REGISTRATIONS: Credential[] = [
  {
    title: "OCR Registration",
    detail: "Company Registration Number: 242444/077/078",
    description:
      "Vraman Holidays Private Limited is duly registered with the Office of the Company Registrar (OCR), Government of Nepal.",
    verifyLabel: "Verify with the Office of the Company Registrar (OCR) Nepal",
    verifyUrl: "https://application.ocr.gov.np/faces/CompanyDetails.jsp",
  },
  {
    title: "PAN / VAT Registration",
    detail: "PAN/VAT Number: 609801851",
    description:
      "Our company operates under a valid PAN/VAT registration issued by the Government of Nepal.",
    verifyLabel: "Verify with the Inland Revenue Department (IRD) Nepal – PAN Search",
    verifyUrl: "https://ird.gov.np/pan-search/",
  },
];

const MEMBERSHIPS: Credential[] = [
  {
    title: "Nepal Association of Tour & Travel Agents (NATTA)",
    description:
      "As a member of NATTA, we are part of Nepal's leading umbrella organisation representing travel agencies and tour operators nationwide.",
    verifyLabel: "NATTA Member Directory – Vraman Holidays Pvt. Ltd.",
    verifyUrl: "https://natta.org.np/member/vraman-holidays-pvt-ltd/",
  },
  {
    title: "Pacific Asia Travel Association (PATA) Nepal Chapter",
    description:
      "We proudly support responsible tourism development, destination marketing, and international tourism cooperation through our affiliation with the PATA Nepal Chapter.",
  },
  {
    title: "Nepal Tourism Board (NTB)",
    description:
      "Working in alignment with Nepal's national tourism vision and destination promotion initiatives.",
  },
  {
    title: "Nepal Germany Chamber of Commerce & Industry (NGCCI)",
    description:
      "As a member of NGCCI, we actively engage with international business networks and foster stronger commercial and tourism ties.",
    verifyLabel: "NGCCI Registered Members Directory",
    verifyUrl: "https://www.ngcci.org/registered-members/",
  },
  {
    title: "British Nepal Chamber of Commerce (BNCC)",
    description:
      "Supporting stronger tourism, trade, and business relationships between Nepal and international markets.",
  },
  {
    title: "Kathmandu Environmental Education Project (KEEP)",
    description:
      "Committed to responsible tourism, environmental stewardship, and sustainable travel practices throughout Nepal.",
  },
];

const SUSTAINABILITY: Credential[] = [
  {
    title: "One Planet Network",
    description:
      "Vraman Holidays is proudly recognised by the One Planet Sustainable Tourism Programme, a global initiative supporting sustainable consumption and production practices in tourism. This recognition reflects our commitment to responsible travel, environmental integrity, and creating positive impacts for local communities.",
    verifyLabel: "View profile – One Planet Network",
    verifyUrl: "https://www.oneplanetnetwork.org/organisations/vraman-holidays-pvt-ltd",
  },
];

const TRADE: Credential[] = [
  {
    title: "EVINTRA – Global DMC Network",
    description:
      "EVINTRA is an international tourism marketplace connecting travel professionals, event planners, tour operators, and destination management companies around the world. Vraman Holidays is proudly featured among Nepal's recognised destination management companies.",
    verifyLabel: "View listing – EVINTRA (Nepal DMC Directory)",
    verifyUrl: "https://www.evintra.com/search/country/np/nepal/dmc",
  },
];

function CredentialCard({ c }: { c: Credential }) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-2">
      <div className="flex items-start gap-3">
        <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-semibold">{c.title}</h3>
          {c.detail && <p className="text-sm font-medium text-primary">{c.detail}</p>}
          <p className="text-sm text-muted-foreground">{c.description}</p>
          {c.verifyUrl ? (
            <a
              href={c.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline pt-1"
            >
              {c.verifyLabel ?? "Verify"}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            c.verifyLabel && (
              <p className="text-sm text-muted-foreground pt-1">{c.verifyLabel}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  columns = 2,
}: {
  icon: typeof BadgeCheck;
  title: string;
  items: Credential[];
  columns?: 1 | 2;
}) {
  return (
    <section className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className={`grid grid-cols-1 ${columns === 2 ? "md:grid-cols-2" : ""} gap-5`}>
        {items.map((c) => (
          <CredentialCard key={c.title} c={c} />
        ))}
      </div>
    </section>
  );
}

export default async function TrustCredentialsPage() {
  const settings = await getSettings();

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Trust, Credentials &amp; Industry Memberships
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            At {settings.brand.name}, trust, transparency, and professionalism form the foundation
            of everything we do. We are a legally registered tourism company in Nepal, proudly
            affiliated with leading national and international tourism organisations.
          </p>
          <p className="text-base text-muted-foreground mt-3">
            We encourage our valued guests, travel partners, and corporate clients to independently
            verify our credentials through the official links below.
          </p>
        </div>
      </section>

      <Section icon={ShieldCheck} title="Government Registration & Compliance" items={REGISTRATIONS} />
      <div className="bg-muted/30">
        <Section icon={Building2} title="Industry Memberships & Affiliations" items={MEMBERSHIPS} />
      </div>
      <Section icon={Leaf} title="Sustainability & Responsible Tourism" items={SUSTAINABILITY} columns={1} />
      <div className="bg-muted/30">
        <Section icon={Globe2} title="International Travel Trade Presence" items={TRADE} columns={1} />
      </div>

      {/* Closing */}
      <section className="container mx-auto px-4 py-16 max-w-3xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Travel With Confidence</h2>
        <p className="text-muted-foreground">
          At {settings.brand.name}, trust is not claimed — it is earned through professionalism,
          transparency, accountability, and consistently delivering exceptional travel experiences.
          Our registrations, memberships, and affiliations reflect our ongoing commitment to
          operating at the highest standards within Nepal&apos;s tourism industry and beyond.
        </p>
        <p className="text-muted-foreground">
          When you choose {settings.brand.name}, you are partnering with a professionally managed
          tourism company that values transparency, accountability, and exceptional service.
        </p>
        {settings.brand.philosophy && (
          <p className="text-base font-medium text-primary pt-2">
            {settings.brand.tagline} &nbsp;·&nbsp; {settings.brand.philosophy}
          </p>
        )}
      </section>
    </main>
  );
}
