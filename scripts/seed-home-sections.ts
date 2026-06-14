import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { SectionType } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

/**
 * Idempotently ensures the homepage has its default sections. Safe to run
 * against any environment: it only inserts when the HomeSection table is empty,
 * so it will never duplicate sections an admin has already arranged.
 */
async function main() {
  const existing = await db.homeSection.count();
  if (existing > 0) {
    console.log(`HomeSection already has ${existing} row(s) — nothing to do.`);
    return;
  }

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
        data: { placeholder: "Where do you want to go?" },
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
        data: { title: "What Our Travellers Say", limit: 6 },
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
      {
        type: SectionType.CTA,
        order: 7,
        visible: true,
        data: {
          title: "Can’t find what you’re looking for?",
          subtitle: "Tell us your dream destination and we’ll craft a personalised itinerary just for you.",
          ctaLabel: "Propose Your Trip",
          ctaHref: "/propose",
        },
      },
    ],
  });

  const count = await db.homeSection.count();
  console.log(`✓ Seeded homepage sections. HomeSection now has ${count} rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
