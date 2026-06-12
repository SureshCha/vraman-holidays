import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { ContentStatus, SectionType } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Vraman Holidays database…");

  // ─── 1. Site Settings ───────────────────────────────────────────────────────
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      brand: {
        name: "Vraman Holidays",
        tagline: "Propose Your Destination",
        logoUrl: "",
        faviconUrl: "",
      },
      theme: {
        primaryColor: "oklch(0.5 0.2 250)",
        secondaryColor: "oklch(0.97 0 0)",
        accentColor: "oklch(0.65 0.15 60)",
        fontFamily: "var(--font-geist-sans), sans-serif",
        borderRadius: "0.625rem",
      },
      contact: {
        phone: "+977-1-XXXXXXX",
        email: "info@vramanholidays.com",
        address: "Thamel, Kathmandu, Nepal",
        officeHours: "Sun–Fri 9am–6pm NPT",
        mapEmbed: "",
        whatsappNumber: "+9779800000000",
      },
      social: {
        facebook: "",
        instagram: "",
        youtube: "",
        tiktok: "",
        twitter: "",
      },
      featureFlags: {
        enableBlog: true,
        enableTestimonials: true,
        enableWhatsapp: true,
        enableEsewa: true,
        enableKhalti: true,
        enableStripe: true,
        enableBankTransfer: true,
      },
      seoDefaults: {
        titleTemplate: "%s | Vraman Holidays",
        defaultDescription:
          "Vraman Holidays — boutique travel agency in Thamel, Kathmandu. Propose your destination.",
        defaultOgImage: "",
      },
      emailTemplates: {
        fromEmail: "noreply@vramanholidays.com",
        replyTo: "info@vramanholidays.com",
        bookingSubject: "Your booking is confirmed — Vraman Holidays",
        enquirySubject: "We received your enquiry — Vraman Holidays",
        footerText: "Vraman Holidays Pvt. Ltd., Thamel, Kathmandu",
      },
      paymentConfig: {
        bankName: "Nepal Investment Mega Bank",
        accountName: "Vraman Holidays Pvt. Ltd.",
        accountNumber: "0000000000000",
        ifscOrSwift: "",
        instructions:
          "Transfer the exact amount to the account above and email your transaction slip to info@vramanholidays.com with your booking reference.",
      },
    },
  });
  console.log("  ✓ SiteSettings");

  // ─── 2. Destinations ────────────────────────────────────────────────────────
  const destinations = [
    { slug: "nepal", name: "Nepal", country: "Nepal", order: 1 },
    { slug: "india", name: "India", country: "India", order: 2 },
    { slug: "maldives", name: "Maldives", country: "Maldives", order: 3 },
    { slug: "thailand", name: "Thailand", country: "Thailand", order: 4 },
    { slug: "singapore", name: "Singapore", country: "Singapore", order: 5 },
    { slug: "australia", name: "Australia", country: "Australia", order: 6 },
    { slug: "uk", name: "United Kingdom", country: "United Kingdom", order: 7 },
    { slug: "pakistan", name: "Pakistan", country: "Pakistan", order: 8 },
  ];

  for (const dest of destinations) {
    await db.destination.upsert({
      where: { slug: dest.slug },
      update: {},
      create: {
        ...dest,
        status: ContentStatus.PUBLISHED,
        description: `Explore the wonders of ${dest.name} with Vraman Holidays.`,
      },
    });
  }
  console.log("  ✓ Destinations (8)");

  // ─── 3. Trip Types ───────────────────────────────────────────────────────────
  const tripTypes = [
    { slug: "adventure", name: "Adventure", order: 1 },
    { slug: "cultural", name: "Cultural", order: 2 },
    { slug: "honeymoon", name: "Honeymoon", order: 3 },
    { slug: "wildlife", name: "Wildlife", order: 4 },
    { slug: "pilgrimage", name: "Pilgrimage", order: 5 },
  ];

  for (const tt of tripTypes) {
    await db.tripType.upsert({
      where: { slug: tt.slug },
      update: {},
      create: tt,
    });
  }
  console.log("  ✓ TripTypes (5)");

  // ─── 4. Owner User ───────────────────────────────────────────────────────────
  const ownerEmail = "owner@vramanholidays.com";
  const passwordHash = await bcrypt.hash("VramanAdmin2025!", 12);

  await db.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: "Vraman Owner",
      passwordHash,
      role: "OWNER",
    },
  });
  console.log("  ✓ Owner user (email: owner@vramanholidays.com — check seed.ts for initial credentials)");

  // ─── 5. Navigation ───────────────────────────────────────────────────────────
  const headerNavItems = [
    { label: "Home", href: "/", order: 1 },
    { label: "Destinations", href: "/destinations", order: 2 },
    { label: "Packages", href: "/packages", order: 3 },
    { label: "Blog", href: "/blog", order: 4 },
    { label: "About", href: "/about", order: 5 },
    { label: "Contact", href: "/contact", order: 6 },
  ];

  for (const item of headerNavItems) {
    const existing = await db.navigation.findFirst({
      where: { location: "header", href: item.href },
    });
    if (!existing) {
      await db.navigation.create({
        data: { ...item, location: "header" },
      });
    }
  }

  const footerNavItems = [
    { label: "Propose Your Trip", href: "/propose", order: 1 },
    { label: "Terms & Conditions", href: "/legal/terms", order: 2 },
    { label: "Privacy Policy", href: "/legal/privacy", order: 3 },
    { label: "Refund Policy", href: "/legal/refund", order: 4 },
  ];

  for (const item of footerNavItems) {
    const existing = await db.navigation.findFirst({
      where: { location: "footer", href: item.href },
    });
    if (!existing) {
      await db.navigation.create({
        data: { ...item, location: "footer" },
      });
    }
  }
  console.log("  ✓ Navigation (header + footer)");

  // ─── 6. Legal Pages ──────────────────────────────────────────────────────────
  const legalPages = [
    {
      slug: "terms",
      title: "Terms & Conditions",
      content: "<p>Terms and conditions for Vraman Holidays. Please update this content from the admin panel.</p>",
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content: "<p>Privacy policy for Vraman Holidays. Please update this content from the admin panel.</p>",
    },
    {
      slug: "refund",
      title: "Refund Policy",
      content: "<p>Refund policy for Vraman Holidays. Please update this content from the admin panel.</p>",
    },
  ];

  for (const page of legalPages) {
    await db.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log("  ✓ LegalPages (terms, privacy, refund)");

  // ─── 7. Home Sections ────────────────────────────────────────────────────────
  const existingHomeSections = await db.homeSection.count();
  if (existingHomeSections === 0) {
    await db.homeSection.createMany({
      data: [
        {
          type: SectionType.HERO,
          order: 1,
          visible: true,
          data: {
            headline: "Propose Your Destination",
            subheadline: "Boutique travel experiences crafted for you",
            ctaLabel: "Explore Packages",
            ctaHref: "/packages",
            imageUrl: "",
          },
        },
        {
          type: SectionType.SEARCH,
          order: 2,
          visible: true,
          data: {
            placeholder: "Where do you want to go?",
          },
        },
        {
          type: SectionType.FEATURED_PACKAGES,
          order: 3,
          visible: true,
          data: {
            title: "Featured Packages",
            subtitle: "Handpicked journeys for every traveller",
            limit: 6,
          },
        },
        {
          type: SectionType.DESTINATIONS,
          order: 4,
          visible: true,
          data: {
            title: "Explore Destinations",
            subtitle: "8 countries, endless adventures",
          },
        },
        {
          type: SectionType.TESTIMONIALS,
          order: 5,
          visible: true,
          data: {
            title: "What Our Travellers Say",
            limit: 6,
          },
        },
        {
          type: SectionType.BLOG_PREVIEW,
          order: 6,
          visible: true,
          data: {
            title: "Travel Stories",
            subtitle: "Inspiration from the road",
            limit: 3,
          },
        },
      ],
    });
  }
  console.log("  ✓ HomeSections (6)");

  console.log("\n✅ Seed complete!");
  console.log("   Admin login: owner@vramanholidays.com — Check seed.ts for initial credentials");
  console.log("   Change the password after first login.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
