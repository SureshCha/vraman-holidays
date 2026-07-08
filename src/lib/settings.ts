import "server-only";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface SiteBrand {
  name: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  /** Brand philosophy line, e.g. "Stop Selling. Start Compelling." Optional until re-seeded. */
  philosophy?: string;
  /** Final brand positioning statement shown in the footer / company profile. Optional until re-seeded. */
  positioningStatement?: string;
}

export interface ContactPerson {
  name: string;
  number: string;
}

export interface SiteContact {
  phone: string;
  phones?: ContactPerson[];
  email: string;
  address: string;
  officeHours: string;
  mapEmbed: string;
  whatsappNumber: string;
}

export interface SiteSocial {
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  twitter: string;
}

export interface FeatureFlags {
  enableBlog: boolean;
  enableTestimonials: boolean;
  enableWhatsapp: boolean;
  enableEsewa: boolean;
  enableKhalti: boolean;
  enableStripe: boolean;
  enableBankTransfer: boolean;
}

export interface SeoDefaults {
  titleTemplate: string;
  defaultDescription: string;
  defaultOgImage: string;
}

export interface EmailTemplates {
  fromEmail: string;
  replyTo: string;
  bookingSubject: string;
  enquirySubject: string;
  footerText: string;
}

export interface PaymentConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscOrSwift: string;
  instructions: string;
}

/** Optional footer background media. All fields optional — empty = plain footer. */
export interface SiteFooterSettings {
  imageUrl?: string;
  videoUrl?: string;
  posterUrl?: string;
}

export interface ParsedSettings {
  id: number;
  brand: SiteBrand;
  theme: SiteTheme;
  contact: SiteContact;
  social: SiteSocial;
  featureFlags: FeatureFlags;
  seoDefaults: SeoDefaults;
  emailTemplates: EmailTemplates;
  paymentConfig: PaymentConfig;
  footer: SiteFooterSettings;
  updatedAt: Date;
}

export async function getSettings(): Promise<ParsedSettings> {
  "use cache";
  cacheTag("settings");

  const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error("SiteSettings not seeded. Run: npm run db:seed");
  const parsed = settings as unknown as ParsedSettings;
  // Guard older rows where the footer column may be null/absent.
  return { ...parsed, footer: parsed.footer ?? {} };
}
