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
}

export interface SiteContact {
  phone: string;
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
  updatedAt: Date;
}

const FALLBACK_SETTINGS: ParsedSettings = {
  id: 1,
  brand: { name: "Vraman Holidays", tagline: "Propose Your Destination", logoUrl: "", faviconUrl: "" },
  theme: { primaryColor: "oklch(0.5 0.2 250)", secondaryColor: "oklch(0.97 0 0)", accentColor: "oklch(0.65 0.15 60)", fontFamily: "var(--font-geist-sans), sans-serif", borderRadius: "0.625rem" },
  contact: { phone: "", email: "", address: "", officeHours: "", mapEmbed: "", whatsappNumber: "" },
  social: { facebook: "", instagram: "", youtube: "", tiktok: "", twitter: "" },
  featureFlags: { enableBlog: true, enableTestimonials: true, enableWhatsapp: false, enableEsewa: false, enableKhalti: false, enableStripe: false, enableBankTransfer: false },
  seoDefaults: { titleTemplate: "%s | Vraman Holidays", defaultDescription: "", defaultOgImage: "" },
  emailTemplates: { fromEmail: "", replyTo: "", bookingSubject: "", enquirySubject: "", footerText: "" },
  paymentConfig: { bankName: "", accountName: "", accountNumber: "", ifscOrSwift: "", instructions: "" },
  updatedAt: new Date(),
};

export async function getSettings(): Promise<ParsedSettings> {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
    if (!settings || !settings.brand) return FALLBACK_SETTINGS;
    return settings as unknown as ParsedSettings;
  } catch {
    return FALLBACK_SETTINGS;
  }
}
