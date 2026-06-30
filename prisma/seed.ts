import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { ContentStatus, SectionType } from "../src/generated/prisma/enums";
import bcrypt from "bcryptjs";
import { createAdapter } from "./adapter";

const db = new PrismaClient({ adapter: createAdapter() });

async function main() {
  console.log("🌱 Seeding Vraman Holidays database…");

  // ─── 1. Site Settings ───────────────────────────────────────────────────────
  // Brand block is applied on both create and update so re-seeding refreshes the
  // brand copy. The admin Brand tab renders these keys dynamically, so philosophy
  // and positioningStatement become editable there once seeded.
  const brand = {
    name: "Vraman Holidays",
    tagline: "Propose Your Destination™",
    philosophy: "Stop Selling. Start Compelling.",
    positioningStatement:
      "Vraman Holidays™ is a Nepal-based destination management company dedicated to helping travellers experience Nepal and the world in meaningful ways. We do not simply arrange trips – we create stories worth living, memories worth sharing, and experiences worth remembering. Every itinerary, every adventure, and every journey is designed with one purpose: to help our guests confidently Propose Your Destination™ while we take care of the rest.",
    logoUrl: "",
    faviconUrl: "",
  };

  await db.siteSettings.upsert({
    where: { id: 1 },
    update: { brand },
    create: {
      id: 1,
      brand,
      theme: {
        primaryColor: "oklch(0.55 0.24 225)",
        secondaryColor: "oklch(0.96 0.03 225)",
        accentColor: "oklch(0.72 0.19 55)",
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
        fromEmail: "info@vramanholidays.com.np",
        replyTo: "info@vramanholidays.com.np",
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
      // Optional footer background media — set via Admin → Settings → Footer.
      footer: {},
    },
  });
  console.log("  ✓ SiteSettings");

  // ─── 2. Destinations (Discover Nepal + Discover the World) ───────────────────
  // region "NEPAL" = inbound (Discover Nepal); "WORLD" = outbound (Discover the World).
  const destinations = [
    // ── Discover Nepal (inbound) ──
    { slug: "kathmandu", name: "Kathmandu", country: "Nepal", region: "NEPAL", order: 1, tagline: "The Gateway to Sacred Nepal", description: "Nepal's vibrant capital — ancient Durbar Squares, sacred stupas, living heritage, and the bustling heart of Himalayan culture.", imageUrl: "https://picsum.photos/seed/kathmandu/800/500" },
    { slug: "pokhara", name: "Pokhara", country: "Nepal", region: "NEPAL", order: 2, tagline: "The Gateway to the Himalayas", description: "A serene lakeside city beneath the Annapurna range — the launchpad for treks, paragliding, and lakeside calm.", imageUrl: "https://picsum.photos/seed/pokhara/800/500" },
    { slug: "muktinath", name: "Muktinath Temple", country: "Nepal", region: "NEPAL", order: 3, tagline: "Where Faith Meets the Himalayas", description: "A sacred pilgrimage site revered by Hindus and Buddhists alike, set high in the dramatic Mustang region.", imageUrl: "https://picsum.photos/seed/muktinath/800/500" },
    { slug: "janakpur", name: "Janakpur", country: "Nepal", region: "NEPAL", order: 4, tagline: "The Sacred City of Goddess Sita", description: "The birthplace of Goddess Sita and home to the magnificent Janaki Mandir, a centre of Mithila culture and devotion.", imageUrl: "https://picsum.photos/seed/janakpur/800/500" },
    { slug: "lumbini", name: "Lumbini", country: "Nepal", region: "NEPAL", order: 5, tagline: "The Birthplace of Peace", description: "The birthplace of Lord Buddha and a UNESCO World Heritage Site of profound global spiritual significance.", imageUrl: "https://picsum.photos/seed/lumbini/800/500" },
    { slug: "chitwan", name: "Chitwan National Park", country: "Nepal", region: "NEPAL", order: 6, tagline: "Nepal's Untamed Wilderness", description: "A UNESCO-listed wildlife haven of one-horned rhinos, Bengal tigers, gharial crocodiles, and lush subtropical jungle.", imageUrl: "https://picsum.photos/seed/chitwan/800/500" },
    // ── Discover the World (outbound) ──
    { slug: "japan", name: "Japan", country: "Japan", region: "WORLD", order: 1, tagline: "Where Timeless Traditions Meet Tomorrow", description: "Experience a captivating blend of ancient temples, vibrant cities, breathtaking landscapes, and world-renowned hospitality.", imageUrl: "https://picsum.photos/seed/japan/800/500" },
    { slug: "south-korea", name: "South Korea", country: "South Korea", region: "WORLD", order: 2, tagline: "Where Tradition Meets Trend", description: "Explore a dynamic nation where royal palaces, vibrant culture, stunning landscapes, and modern innovation coexist in perfect harmony.", imageUrl: "https://picsum.photos/seed/southkorea/800/500" },
    { slug: "thailand", name: "Thailand", country: "Thailand", region: "WORLD", order: 3, tagline: "Where Smiles, Spirituality & Tropical Beauty Await", description: "Uncover golden temples, pristine beaches, vibrant cities, rich traditions, and unforgettable experiences in the Land of Smiles.", imageUrl: "https://picsum.photos/seed/thailand/800/500" },
    { slug: "india", name: "India", country: "India", region: "WORLD", order: 4, tagline: "Where Spirituality, Heritage & Diversity Unite", description: "Journey through sacred temples, royal palaces, vibrant cultures, and timeless traditions in one of the world's most fascinating civilisations.", imageUrl: "https://picsum.photos/seed/india/800/500" },
    { slug: "china", name: "China", country: "China", region: "WORLD", order: 5, tagline: "Where Ancient Wonders Meet Modern Marvels", description: "From imperial palaces and legendary landmarks to dynamic cities and diverse landscapes, discover a civilisation unlike any other.", imageUrl: "https://picsum.photos/seed/china/800/500" },
    { slug: "bhutan", name: "Bhutan", country: "Bhutan", region: "WORLD", order: 6, tagline: "Where Happiness Meets the Himalayas", description: "Experience a kingdom of serenity, spirituality, breathtaking landscapes, and a way of life rooted in harmony and well-being.", imageUrl: "https://picsum.photos/seed/bhutan/800/500" },
    { slug: "tibet", name: "Tibet", country: "Tibet", region: "WORLD", order: 7, tagline: "Where Spirituality Touches the Sky", description: "Explore ancient monasteries, sacred mountains, and profound spiritual traditions atop the Roof of the World.", imageUrl: "https://picsum.photos/seed/tibet/800/500" },
    { slug: "philippines", name: "Philippines", country: "Philippines", region: "WORLD", order: 8, tagline: "Where Island Dreams Become Reality", description: "Uncover crystal-clear waters, pristine beaches, warm hospitality, and unforgettable adventures across thousands of tropical islands.", imageUrl: "https://picsum.photos/seed/philippines/800/500" },
    { slug: "indonesia", name: "Indonesia", country: "Indonesia", region: "WORLD", order: 9, tagline: "Where Islands, Culture & Adventure Converge", description: "Explore tropical paradises, ancient temples, vibrant traditions, and extraordinary natural wonders across the world's largest archipelago.", imageUrl: "https://picsum.photos/seed/indonesia/800/500" },
    { slug: "vietnam", name: "Vietnam", country: "Vietnam", region: "WORLD", order: 10, tagline: "Where Heritage, Nature & Hospitality Flourish", description: "Experience breathtaking landscapes, rich cultural traditions, vibrant cities, and some of Asia's most memorable culinary delights.", imageUrl: "https://picsum.photos/seed/vietnam/800/500" },
    { slug: "malaysia", name: "Malaysia", country: "Malaysia", region: "WORLD", order: 11, tagline: "Where Cultures, Cities & Rainforests Connect", description: "Experience a fascinating blend of modern skylines, diverse traditions, tropical landscapes, and world-class hospitality.", imageUrl: "https://picsum.photos/seed/malaysia/800/500" },
    { slug: "singapore", name: "Singapore", country: "Singapore", region: "WORLD", order: 12, tagline: "Where Innovation Meets Inspiration", description: "Explore a vibrant city-state renowned for its futuristic attractions, cultural diversity, exceptional dining, and seamless experiences.", imageUrl: "https://picsum.photos/seed/singapore/800/500" },
    { slug: "dubai-uae", name: "Dubai / UAE", country: "United Arab Emirates", region: "WORLD", order: 13, tagline: "Where Luxury Meets Limitless Possibilities", description: "From iconic skyscrapers and desert adventures to world-class shopping and hospitality, experience a destination built to inspire.", imageUrl: "https://picsum.photos/seed/dubai/800/500" },
    { slug: "sri-lanka", name: "Sri Lanka", country: "Sri Lanka", region: "WORLD", order: 14, tagline: "Where Heritage, Nature & Serenity Unite", description: "Discover ancient kingdoms, sacred temples, lush tea plantations, wildlife encounters, and idyllic coastlines.", imageUrl: "https://picsum.photos/seed/srilanka/800/500" },
    { slug: "maldives", name: "Maldives", country: "Maldives", region: "WORLD", order: 15, tagline: "Where Every Moment Feels Extraordinary", description: "Escape to turquoise lagoons, overwater villas, pristine beaches, and unmatched tranquillity in the heart of the Indian Ocean.", imageUrl: "https://picsum.photos/seed/maldives/800/500" },
  ];

  for (const dest of destinations) {
    await db.destination.upsert({
      where: { slug: dest.slug },
      update: { name: dest.name, country: dest.country, region: dest.region, tagline: dest.tagline, order: dest.order, imageUrl: dest.imageUrl, description: dest.description },
      create: { ...dest, status: ContentStatus.PUBLISHED },
    });
  }

  // Reconcile demo packages + retire old country-level destinations.
  // (Earlier seeds attached Nepal demo packages to a single "nepal" destination.)
  const kathmanduDest = await db.destination.findUnique({ where: { slug: "kathmandu" } });
  const pokharaDest = await db.destination.findUnique({ where: { slug: "pokhara" } });
  const chitwanDest = await db.destination.findUnique({ where: { slug: "chitwan" } });
  if (kathmanduDest && pokharaDest && chitwanDest) {
    await db.package.updateMany({ where: { slug: "annapurna-base-camp-trek" }, data: { destinationId: pokharaDest.id } });
    await db.package.updateMany({ where: { slug: "everest-base-camp-trek" }, data: { destinationId: kathmanduDest.id } });
    await db.package.updateMany({ where: { slug: "kathmandu-cultural-tour" }, data: { destinationId: kathmanduDest.id } });
    await db.package.updateMany({ where: { slug: "chitwan-wildlife-safari" }, data: { destinationId: chitwanDest.id } });
  }
  for (const slug of ["nepal", "australia", "uk", "pakistan"]) {
    const d = await db.destination.findUnique({ where: { slug }, include: { _count: { select: { packages: true } } } });
    if (d && d._count.packages === 0) await db.destination.delete({ where: { slug } });
  }
  console.log("  ✓ Destinations (6 Nepal + 15 World, with taglines)");

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
  // New information architecture (see brand brief). Re-seeding is authoritative:
  // existing header/footer items are cleared and rebuilt. Deferred sections
  // (Signature Journeys, Experiences, Travel Trade) will be added to the menu as
  // their pages are built. Packages stays in the menu as the live booking funnel.
  // Top-level header items shown directly in the bar.
  const headerTop = [
    { label: "Home", href: "/", order: 1 },
    { label: "Signature Journeys", href: "/signature-journeys", order: 2 },
    { label: "Destinations", href: "/destinations", order: 3 },
    { label: "Experiences", href: "/experiences", order: 4 },
    { label: "Travel Trade", href: "/travel-trade", order: 5 },
    { label: "Trust & Credentials", href: "/trust-credentials", order: 6 },
  ];
  // Dropdown parents (href "#") with their children.
  const aboutUsChildren = [
    { label: "About", href: "/about" },
    { label: "Why Nepal?", href: "/why-nepal" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Hall of Achievements", href: "/hall-of-achievements" },
  ];
  const storiesChildren = [
    { label: "Stories & Insights (Blog)", href: "/blog" },
    { label: "Reviews & Testimonials", href: "/reviews" },
  ];

  const footerNavItems = [
    { label: "About", href: "/about", order: 1 },
    { label: "Trust & Credentials", href: "/trust-credentials", order: 2 },
    { label: "Why Nepal?", href: "/why-nepal", order: 3 },
    { label: "Sustainability", href: "/sustainability", order: 4 },
    { label: "Hall of Achievements", href: "/hall-of-achievements", order: 5 },
    { label: "Reviews & Testimonials", href: "/reviews", order: 6 },
    { label: "Packages", href: "/packages", order: 7 },
    { label: "Propose Your Trip", href: "/propose", order: 8 },
    { label: "Terms & Conditions", href: "/legal/terms", order: 9 },
    { label: "Privacy Policy", href: "/legal/privacy", order: 10 },
    { label: "Refund Policy", href: "/legal/refund", order: 11 },
  ];

  await db.navigation.deleteMany({ where: { location: { in: ["header", "footer"] } } });
  for (const item of headerTop) {
    await db.navigation.create({ data: { ...item, location: "header" } });
  }
  const aboutUsParent = await db.navigation.create({
    data: { label: "About Us", href: "#", order: 7, location: "header" },
  });
  let aboutOrder = 1;
  for (const child of aboutUsChildren) {
    await db.navigation.create({
      data: { ...child, order: aboutOrder++, location: "header", parentId: aboutUsParent.id },
    });
  }
  const storiesParent = await db.navigation.create({
    data: { label: "Stories", href: "#", order: 8, location: "header" },
  });
  let storiesOrder = 1;
  for (const child of storiesChildren) {
    await db.navigation.create({
      data: { ...child, order: storiesOrder++, location: "header", parentId: storiesParent.id },
    });
  }
  for (const item of footerNavItems) {
    await db.navigation.create({ data: { ...item, location: "footer" } });
  }
  console.log("  ✓ Navigation (header dropdowns + footer)");

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
          // Full-bleed photographic band \u2014 swap the placeholder for a real
          // Himalaya/Nepal photo via Admin \u2192 Homepage (or Media library).
          type: SectionType.IMAGE_BAND,
          order: 4,
          visible: true,
          data: {
            eyebrow: "Discover Nepal",
            heading: "Where Every Journey Begins",
            subtext: "From sacred temples to Himalayan summits \u2014 explore Nepal with {brand}.",
            ctaLabel: "Why Nepal?",
            ctaHref: "/why-nepal",
            imageUrl: "https://picsum.photos/seed/nepal-band/1600/900",
            parallax: true,
          },
        },
        {
          type: SectionType.DESTINATIONS,
          order: 5,
          visible: true,
          data: {
            title: "Explore Destinations",
            subtitle: "Discover Nepal and the world",
          },
        },
        {
          type: SectionType.TESTIMONIALS,
          order: 6,
          visible: true,
          data: {
            title: "What Our Travellers Say",
            limit: 6,
            // Optional immersive backdrop — set a real photo/video via Admin →
            // Homepage. Placeholder shown until replaced; white text auto-applies.
            backgroundImage: "https://picsum.photos/seed/vraman-testimonials/1600/900",
          },
        },
        {
          type: SectionType.BLOG_PREVIEW,
          order: 7,
          visible: true,
          data: {
            title: "Travel Stories",
            subtitle: "Inspiration from the road",
            limit: 3,
          },
        },
        {
          type: SectionType.CTA,
          order: 8,
          visible: true,
          data: {
            title: "Can\u2019t find what you\u2019re looking for?",
            subtitle: "Tell us your dream destination and we\u2019ll craft a personalised itinerary just for you.",
            ctaLabel: "Propose Your Trip",
            ctaHref: "/propose",
            // Optional full-bleed background \u2014 set a real photo/video via Admin \u2192 Homepage.
            imageUrl: "https://picsum.photos/seed/vraman-cta/1600/900",
          },
        },
      ],
    });
  }
  // Keep the destinations section subtitle current even on existing installs.
  await db.homeSection.updateMany({
    where: { type: SectionType.DESTINATIONS },
    data: { data: { title: "Explore Destinations", subtitle: "Discover Nepal and the world" } },
  });
  console.log("  ✓ HomeSections (6)");

  // ─── 8. Demo Packages ────────────────────────────────────────────────────────
  const indiaDest = await db.destination.findUnique({ where: { slug: "india" } });
  const thailandDest = await db.destination.findUnique({ where: { slug: "thailand" } });
  const adventureType = await db.tripType.findUnique({ where: { slug: "adventure" } });
  const culturalType = await db.tripType.findUnique({ where: { slug: "cultural" } });
  const honeymoonType = await db.tripType.findUnique({ where: { slug: "honeymoon" } });
  const wildlifeType = await db.tripType.findUnique({ where: { slug: "wildlife" } });

  if (!kathmanduDest || !pokharaDest || !chitwanDest || !indiaDest || !thailandDest || !adventureType || !culturalType || !honeymoonType || !wildlifeType) {
    throw new Error("Required destinations or trip types not found");
  }

  const now = new Date();
  const d30 = new Date(now.getTime() + 30 * 86400000);
  const d60 = new Date(now.getTime() + 60 * 86400000);
  const d90 = new Date(now.getTime() + 90 * 86400000);

  const demoPackages = [
    // ── Nepal ──
    {
      slug: "annapurna-base-camp-trek",
      title: "Annapurna Base Camp Trek",
      subtitle: "Trek to the heart of the Annapurna Sanctuary",
      destinationId: pokharaDest.id,
      tripTypeIds: [adventureType.id],
      durationDays: 12, durationNights: 11,
      priceFrom: 8500000, currency: "NPR",
      description: "<p>The Annapurna Base Camp (ABC) trek is one of Nepal's most iconic trekking routes, taking you through lush rhododendron forests, traditional Gurung villages, and terraced farmland before arriving at the breathtaking amphitheatre of Annapurna Base Camp at 4,130m.</p><p>This trek offers stunning views of Annapurna I (8,091m), Machapuchare (Fishtail), Hiunchuli, and surrounding peaks. It's suitable for trekkers with moderate fitness and is one of the best introductions to Himalayan trekking.</p>",
      highlights: ["Stunning views of Annapurna massif and Machapuchare", "Walk through rhododendron forests and Gurung villages", "Natural hot springs at Jhinu Danda", "Sunrise at Annapurna Base Camp (4,130m)", "Authentic Nepali tea-house experience"],
      inclusions: ["Airport transfers", "All meals during trek (breakfast, lunch, dinner)", "Licensed English-speaking guide", "Porter service (1 porter per 2 trekkers)", "TIMS and ACAP permits", "Tea-house accommodation", "First-aid kit"],
      exclusions: ["International flights", "Travel insurance", "Personal trekking gear", "Tips and gratuities", "Hot showers and WiFi charges on trail", "Emergency evacuation"],
      coverImage: "https://picsum.photos/seed/abc-trek/1200/600",
      galleryImages: ["https://picsum.photos/seed/abc1/800/600", "https://picsum.photos/seed/abc2/800/600", "https://picsum.photos/seed/abc3/800/600"],
      featured: true, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Kathmandu", description: "Welcome at Tribhuvan International Airport. Transfer to hotel in Thamel. Evening briefing and gear check with your guide.", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "Hotel in Thamel" },
        { dayNumber: 2, title: "Drive to Nayapul, trek to Tikhedhunga", description: "Scenic 6-hour drive to Nayapul (1,070m) via Pokhara. Begin trek through rice paddies to Tikhedhunga (1,540m). First taste of the trail and tea-house life.", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Tea-house in Tikhedhunga" },
        { dayNumber: 3, title: "Trek to Ghorepani", description: "Climb stone steps through oak and rhododendron forest to Ghorepani (2,860m). Challenging but rewarding day with over 1,500m elevation gain.", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Tea-house in Ghorepani" },
        { dayNumber: 4, title: "Poon Hill sunrise, trek to Tadapani", description: "Pre-dawn hike to Poon Hill (3,210m) for spectacular sunrise over Dhaulagiri and Annapurna range. Descend through forest to Tadapani (2,630m).", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Tea-house in Tadapani" },
      ],
      departures: [
        { departureDate: d30, returnDate: new Date(d30.getTime() + 12 * 86400000), maxSeats: 12 },
        { departureDate: d90, returnDate: new Date(d90.getTime() + 12 * 86400000), maxSeats: 12 },
      ],
    },
    {
      slug: "everest-base-camp-trek",
      title: "Everest Base Camp Trek",
      subtitle: "Walk in the footsteps of legends to the roof of the world",
      destinationId: kathmanduDest.id,
      tripTypeIds: [adventureType.id],
      durationDays: 14, durationNights: 13,
      priceFrom: 12000000, currency: "NPR",
      description: "<p>The Everest Base Camp trek is the ultimate Himalayan adventure. Follow the legendary Khumbu Valley past Sherpa villages, ancient monasteries, and glacial moraines to stand at the base of the world's highest mountain (5,364m).</p><p>Along the way, you'll acclimatise in Namche Bazaar, visit the historic Tengboche monastery, and enjoy panoramic views of Everest, Lhotse, Nuptse, and Ama Dablam.</p>",
      highlights: ["Stand at Everest Base Camp (5,364m)", "Sunrise from Kala Patthar (5,545m)", "Visit Tengboche Monastery", "Fly into Lukla — the world's most thrilling airstrip", "Experience Sherpa culture and hospitality"],
      inclusions: ["Kathmandu–Lukla return flights", "All meals on trek", "Licensed guide and porters", "TIMS and Sagarmatha National Park permit", "Tea-house accommodation", "Altitude sickness medication"],
      exclusions: ["International flights", "Travel insurance (mandatory)", "Personal gear", "Tips", "Extra meals in Kathmandu", "Emergency helicopter evacuation"],
      coverImage: "https://picsum.photos/seed/ebc-trek/1200/600",
      galleryImages: ["https://picsum.photos/seed/ebc1/800/600", "https://picsum.photos/seed/ebc2/800/600", "https://picsum.photos/seed/ebc3/800/600"],
      featured: true, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Fly to Lukla, trek to Phakding", description: "Early morning flight to Lukla (2,840m). Trek along the Dudh Koshi river to Phakding (2,610m).", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Tea-house in Phakding" },
        { dayNumber: 2, title: "Trek to Namche Bazaar", description: "Cross suspension bridges and climb to the Sherpa capital of Namche Bazaar (3,440m). First views of Everest.", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Tea-house in Namche Bazaar" },
        { dayNumber: 3, title: "Acclimatisation day in Namche", description: "Rest day with optional hike to Everest View Hotel (3,880m). Explore Namche's markets and Sherpa museum.", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Tea-house in Namche Bazaar" },
      ],
      departures: [
        { departureDate: d30, returnDate: new Date(d30.getTime() + 14 * 86400000), maxSeats: 10 },
        { departureDate: d60, returnDate: new Date(d60.getTime() + 14 * 86400000), maxSeats: 10 },
      ],
    },
    {
      slug: "kathmandu-cultural-tour",
      title: "Kathmandu Valley Cultural Tour",
      subtitle: "Ancient temples, living heritage, and vibrant city life",
      destinationId: kathmanduDest.id,
      tripTypeIds: [culturalType.id],
      durationDays: 5, durationNights: 4,
      priceFrom: 3500000, currency: "NPR",
      description: "<p>Explore the cultural treasures of the Kathmandu Valley — a UNESCO World Heritage site with seven monument zones. Visit ancient Durbar Squares, sacred Buddhist stupas, and Hindu temples that have stood for centuries.</p>",
      highlights: ["Boudhanath Stupa — one of the largest in the world", "Pashupatinath Temple — sacred Hindu cremation site", "Patan and Bhaktapur Durbar Squares", "Swayambhunath (Monkey Temple) sunset views"],
      inclusions: ["4-star hotel accommodation", "All entrance fees", "Private vehicle and driver", "Licensed cultural guide", "Breakfast daily"],
      exclusions: ["Flights", "Lunch and dinner", "Camera fees at monuments", "Tips"],
      coverImage: "https://picsum.photos/seed/ktm-culture/1200/600",
      galleryImages: ["https://picsum.photos/seed/ktm1/800/600", "https://picsum.photos/seed/ktm2/800/600"],
      featured: false, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrival & Thamel walking tour", description: "Airport pickup, check into hotel. Afternoon walking tour of Thamel's narrow streets, handicraft shops, and rooftop restaurants.", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "4-star hotel, Thamel" },
        { dayNumber: 2, title: "Kathmandu Durbar Square & Swayambhunath", description: "Morning at Kathmandu Durbar Square. Afternoon climb to Swayambhunath (Monkey Temple) for panoramic valley views.", meals: { breakfast: true, lunch: false, dinner: false }, accommodation: "4-star hotel, Thamel" },
        { dayNumber: 3, title: "Boudhanath & Pashupatinath", description: "Visit the colossal Boudhanath Stupa and observe evening aarti ceremony at Pashupatinath Temple.", meals: { breakfast: true, lunch: false, dinner: false }, accommodation: "4-star hotel, Thamel" },
      ],
      departures: [
        { departureDate: d30, returnDate: new Date(d30.getTime() + 5 * 86400000), maxSeats: 20 },
      ],
    },
    {
      slug: "chitwan-wildlife-safari",
      title: "Chitwan Wildlife Safari",
      subtitle: "Encounter one-horned rhinos and Bengal tigers in the wild",
      destinationId: chitwanDest.id,
      tripTypeIds: [wildlifeType.id],
      durationDays: 4, durationNights: 3,
      priceFrom: 2800000, currency: "NPR",
      description: "<p>Chitwan National Park, a UNESCO World Heritage site, is one of Asia's best-preserved wildlife areas. Home to one-horned rhinos, Bengal tigers, gharial crocodiles, and over 500 bird species.</p>",
      highlights: ["Jeep safari through grasslands", "Canoe ride on the Rapti River", "Tharu cultural dance performance", "Elephant breeding centre visit", "Birdwatching with expert naturalist"],
      inclusions: ["Resort accommodation", "All meals", "2 jungle activities per day", "National park entry fee", "Naturalist guide", "Transfers from Kathmandu or Pokhara"],
      exclusions: ["Flights or bus to Chitwan", "Alcoholic beverages", "Tips", "Personal expenses"],
      coverImage: "https://picsum.photos/seed/chitwan/1200/600",
      galleryImages: ["https://picsum.photos/seed/chitwan1/800/600", "https://picsum.photos/seed/chitwan2/800/600"],
      featured: false, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Chitwan", description: "Transfer from Kathmandu (tourist bus or flight to Bharatpur). Check into jungle lodge. Afternoon Tharu village walk.", meals: { breakfast: false, lunch: true, dinner: true }, accommodation: "Jungle Lodge, Sauraha" },
        { dayNumber: 2, title: "Full day jungle safari", description: "Morning jeep safari deep into the park. Afternoon canoe ride on the Rapti River spotting gharial crocodiles. Evening Tharu cultural dance.", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Jungle Lodge, Sauraha" },
      ],
      departures: [
        { departureDate: d60, returnDate: new Date(d60.getTime() + 4 * 86400000), maxSeats: 16 },
      ],
    },
    // ── India ──
    {
      slug: "golden-triangle-tour",
      title: "Golden Triangle Tour",
      subtitle: "Delhi, Agra, and Jaipur — India's iconic circuit",
      destinationId: indiaDest.id,
      tripTypeIds: [culturalType.id],
      durationDays: 7, durationNights: 6,
      priceFrom: 6500000, currency: "NPR",
      description: "<p>The Golden Triangle connects India's three most iconic cities: Delhi's Mughal heritage, Agra's immortal Taj Mahal, and Jaipur's pink-hued palaces. This classic route is the perfect introduction to India's rich history and vibrant culture.</p>",
      highlights: ["Sunrise at the Taj Mahal", "Explore the Red Fort and Jama Masjid in Old Delhi", "Visit the Palace of the Winds (Hawa Mahal)", "Amber Fort elephant ride in Jaipur", "Street food tour in Chandni Chowk"],
      inclusions: ["4-star hotel accommodation", "Private AC vehicle", "English-speaking guide", "All monument entrance fees", "Daily breakfast", "Airport transfers"],
      exclusions: ["Flights to/from India", "Visa fees", "Lunch and dinner", "Camera fees", "Tips"],
      coverImage: "https://picsum.photos/seed/golden-tri/1200/600",
      galleryImages: ["https://picsum.photos/seed/taj1/800/600", "https://picsum.photos/seed/jaipur1/800/600", "https://picsum.photos/seed/delhi1/800/600"],
      featured: true, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Delhi", description: "Welcome at Indira Gandhi Airport. Transfer to hotel. Evening visit to India Gate and Connaught Place.", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "4-star hotel, New Delhi" },
        { dayNumber: 2, title: "Old & New Delhi tour", description: "Visit Red Fort, Jama Masjid, Chandni Chowk (rickshaw ride). Afternoon: Humayun's Tomb, Qutub Minar, Lotus Temple.", meals: { breakfast: true, lunch: true, dinner: false }, accommodation: "4-star hotel, New Delhi" },
        { dayNumber: 3, title: "Delhi to Agra", description: "Drive to Agra (4 hrs). Afternoon visit Agra Fort and Mehtab Bagh for sunset Taj Mahal view.", meals: { breakfast: true, lunch: false, dinner: true }, accommodation: "4-star hotel, Agra" },
      ],
      departures: [
        { departureDate: d30, returnDate: new Date(d30.getTime() + 7 * 86400000), maxSeats: 15 },
        { departureDate: d90, returnDate: new Date(d90.getTime() + 7 * 86400000), maxSeats: 15 },
      ],
    },
    {
      slug: "goa-beach-retreat",
      title: "Goa Beach Retreat",
      subtitle: "Sun, sand, and serenity on India's western coast",
      destinationId: indiaDest.id,
      tripTypeIds: [honeymoonType.id],
      durationDays: 5, durationNights: 4,
      priceFrom: 4500000, currency: "NPR",
      description: "<p>Unwind on Goa's golden beaches with this relaxing getaway. Perfect for couples, the retreat combines beachfront luxury, Portuguese heritage, spice plantations, and legendary sunsets.</p>",
      highlights: ["Stay at a beachfront resort", "Old Goa churches (UNESCO Heritage)", "Spice plantation tour with lunch", "Sunset cruise on the Mandovi River", "Beach shack dining"],
      inclusions: ["Beachfront resort", "Daily breakfast", "Airport transfers", "Sunset cruise", "Spice plantation tour"],
      exclusions: ["Flights", "Lunch and dinner (except plantation)", "Water sports", "Tips"],
      coverImage: "https://picsum.photos/seed/goa-beach/1200/600",
      galleryImages: ["https://picsum.photos/seed/goa1/800/600", "https://picsum.photos/seed/goa2/800/600"],
      featured: false, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Goa", description: "Airport transfer to beachfront resort in South Goa. Free afternoon to relax by the pool or explore the beach.", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "Beachfront Resort, South Goa" },
        { dayNumber: 2, title: "Old Goa & spice plantation", description: "Visit the Basilica of Bom Jesus and Se Cathedral. Afternoon spice plantation tour with traditional Goan lunch.", meals: { breakfast: true, lunch: true, dinner: false }, accommodation: "Beachfront Resort, South Goa" },
      ],
      departures: [
        { departureDate: d60, returnDate: new Date(d60.getTime() + 5 * 86400000), maxSeats: 20 },
      ],
    },
    {
      slug: "kerala-backwaters",
      title: "Kerala Backwaters & Hill Stations",
      subtitle: "Houseboats, tea plantations, and tropical serenity",
      destinationId: indiaDest.id,
      tripTypeIds: [honeymoonType.id],
      durationDays: 6, durationNights: 5,
      priceFrom: 5500000, currency: "NPR",
      description: "<p>Kerala, 'God's Own Country', offers a magical blend of palm-fringed backwaters, misty tea plantations, and pristine beaches. Cruise on a traditional houseboat, explore Munnar's emerald hills, and rejuvenate with Ayurvedic treatments.</p>",
      highlights: ["Overnight houseboat cruise on Alleppey backwaters", "Tea plantation visit in Munnar", "Periyar Wildlife Sanctuary boat ride", "Traditional Kathakali dance performance", "Ayurvedic spa experience"],
      inclusions: ["Houseboat with all meals", "Boutique hotel stays", "Private vehicle", "Guide", "Breakfast daily", "Wildlife sanctuary entry"],
      exclusions: ["Flights", "Ayurvedic spa treatments", "Tips", "Personal shopping"],
      coverImage: "https://picsum.photos/seed/kerala/1200/600",
      galleryImages: ["https://picsum.photos/seed/kerala1/800/600", "https://picsum.photos/seed/kerala2/800/600", "https://picsum.photos/seed/kerala3/800/600"],
      featured: true, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Kochi", description: "Airport transfer. Afternoon heritage walk through Fort Kochi — Chinese fishing nets, spice markets, and street art. Evening Kathakali dance performance.", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "Heritage Hotel, Fort Kochi" },
        { dayNumber: 2, title: "Drive to Munnar", description: "Scenic 4-hour drive through tea and cardamom plantations. Visit a tea museum and factory. Evening at leisure in the misty hills.", meals: { breakfast: true, lunch: false, dinner: true }, accommodation: "Boutique Resort, Munnar" },
        { dayNumber: 3, title: "Munnar sightseeing", description: "Visit Eravikulam National Park (Nilgiri tahr habitat), Mattupetty Dam, and Top Station for panoramic views of the Western Ghats.", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "Boutique Resort, Munnar" },
      ],
      departures: [
        { departureDate: d30, returnDate: new Date(d30.getTime() + 6 * 86400000), maxSeats: 12 },
        { departureDate: d90, returnDate: new Date(d90.getTime() + 6 * 86400000), maxSeats: 12 },
      ],
    },
    // ── Thailand ──
    {
      slug: "bangkok-phuket-escape",
      title: "Bangkok & Phuket Escape",
      subtitle: "City lights meet island paradise",
      destinationId: thailandDest.id,
      tripTypeIds: [honeymoonType.id],
      durationDays: 7, durationNights: 6,
      priceFrom: 7500000, currency: "NPR",
      description: "<p>Combine the electric energy of Bangkok with the tropical bliss of Phuket. Explore glittering temples and floating markets before relaxing on Andaman Sea beaches.</p>",
      highlights: ["Grand Palace & Wat Pho (Reclining Buddha)", "Damnoen Saduak Floating Market", "Phi Phi Islands day trip", "Thai cooking class", "Patong Beach sunset"],
      inclusions: ["4-star hotels", "Domestic flight Bangkok–Phuket", "Phi Phi island tour", "Cooking class", "Daily breakfast", "Airport transfers"],
      exclusions: ["International flights", "Visa on arrival fee", "Lunch and dinner", "Water sports", "Tips"],
      coverImage: "https://picsum.photos/seed/bkk-phuket/1200/600",
      galleryImages: ["https://picsum.photos/seed/bkk1/800/600", "https://picsum.photos/seed/phuket1/800/600", "https://picsum.photos/seed/phiphi1/800/600"],
      featured: true, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Bangkok", description: "Welcome at Suvarnabhumi Airport. Transfer to hotel in Sukhumvit. Evening street food tour at Yaowarat (Chinatown).", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "4-star hotel, Sukhumvit" },
        { dayNumber: 2, title: "Bangkok temples & markets", description: "Visit Grand Palace, Wat Pho, and Wat Arun. Afternoon long-tail boat through canals. Evening at Asiatique night market.", meals: { breakfast: true, lunch: true, dinner: false }, accommodation: "4-star hotel, Sukhumvit" },
        { dayNumber: 3, title: "Floating market & cooking class", description: "Early morning trip to Damnoen Saduak Floating Market. Afternoon Thai cooking class — learn to make pad thai, green curry, and mango sticky rice.", meals: { breakfast: true, lunch: true, dinner: true }, accommodation: "4-star hotel, Sukhumvit" },
      ],
      departures: [
        { departureDate: d30, returnDate: new Date(d30.getTime() + 7 * 86400000), maxSeats: 16 },
        { departureDate: d60, returnDate: new Date(d60.getTime() + 7 * 86400000), maxSeats: 16 },
      ],
    },
    {
      slug: "chiang-mai-explorer",
      title: "Chiang Mai Cultural Explorer",
      subtitle: "Temples, hill tribes, and night bazaars in northern Thailand",
      destinationId: thailandDest.id,
      tripTypeIds: [culturalType.id],
      durationDays: 5, durationNights: 4,
      priceFrom: 4800000, currency: "NPR",
      description: "<p>Chiang Mai is northern Thailand's cultural capital. Discover over 300 temples, interact with elephants ethically, trek through hill-tribe villages, and browse the famous Sunday Night Market.</p>",
      highlights: ["Doi Suthep temple with panoramic city views", "Ethical elephant sanctuary visit", "Hill-tribe village trek", "Sunday Night Walking Street market", "Traditional khantoke dinner"],
      inclusions: ["Boutique hotel", "Elephant sanctuary half-day", "Hill-tribe trek with lunch", "Daily breakfast", "Airport transfers"],
      exclusions: ["Flights", "Dinner (except khantoke night)", "Shopping", "Tips"],
      coverImage: "https://picsum.photos/seed/chiangmai/1200/600",
      galleryImages: ["https://picsum.photos/seed/cm1/800/600", "https://picsum.photos/seed/cm2/800/600"],
      featured: false, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Chiang Mai", description: "Airport transfer. Afternoon visit to Doi Suthep temple. Evening explore the Night Bazaar.", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "Boutique Hotel, Old City" },
        { dayNumber: 2, title: "Elephant sanctuary & temples", description: "Morning at an ethical elephant sanctuary. Afternoon visit Wat Chedi Luang and Wat Phra Singh.", meals: { breakfast: true, lunch: true, dinner: false }, accommodation: "Boutique Hotel, Old City" },
      ],
      departures: [
        { departureDate: d60, returnDate: new Date(d60.getTime() + 5 * 86400000), maxSeats: 14 },
      ],
    },
    {
      slug: "thai-island-hopping",
      title: "Thai Island Hopping Adventure",
      subtitle: "Koh Samui, Koh Phangan, and Koh Tao",
      destinationId: thailandDest.id,
      tripTypeIds: [adventureType.id],
      durationDays: 8, durationNights: 7,
      priceFrom: 9500000, currency: "NPR",
      description: "<p>Hop between Thailand's Gulf islands — from Koh Samui's luxury resorts to Koh Phangan's bohemian vibes and Koh Tao's world-class diving. Snorkel crystal-clear waters, kayak through hidden bays, and watch fiery sunsets.</p>",
      highlights: ["Snorkelling at Koh Tao's Japanese Gardens", "Ang Thong Marine Park day trip", "Kayak through hidden lagoons", "Beach BBQ under the stars", "Visit Koh Phangan's secret beach"],
      inclusions: ["Beachfront accommodation on each island", "Inter-island ferry transfers", "Ang Thong Marine Park tour", "Snorkelling gear", "Daily breakfast"],
      exclusions: ["Flights to Koh Samui", "Scuba diving courses", "Full moon party entrance", "Tips", "Travel insurance"],
      coverImage: "https://picsum.photos/seed/thai-islands/1200/600",
      galleryImages: ["https://picsum.photos/seed/samui1/800/600", "https://picsum.photos/seed/kohtao1/800/600", "https://picsum.photos/seed/phangan1/800/600"],
      featured: true, status: ContentStatus.PUBLISHED,
      itinerary: [
        { dayNumber: 1, title: "Arrive in Koh Samui", description: "Fly into Koh Samui. Transfer to beachfront resort at Chaweng Beach. Afternoon free to explore.", meals: { breakfast: false, lunch: false, dinner: true }, accommodation: "Beachfront Resort, Chaweng" },
        { dayNumber: 2, title: "Ang Thong Marine Park", description: "Full-day boat tour of Ang Thong National Marine Park — kayaking, snorkelling, and hiking to a panoramic viewpoint.", meals: { breakfast: true, lunch: true, dinner: false }, accommodation: "Beachfront Resort, Chaweng" },
        { dayNumber: 3, title: "Ferry to Koh Phangan", description: "Morning ferry to Koh Phangan. Settle into a beachside bungalow at Haad Salad. Afternoon snorkelling and beach time.", meals: { breakfast: true, lunch: false, dinner: true }, accommodation: "Beach Bungalow, Koh Phangan" },
      ],
      departures: [
        { departureDate: d30, returnDate: new Date(d30.getTime() + 8 * 86400000), maxSeats: 12 },
        { departureDate: d90, returnDate: new Date(d90.getTime() + 8 * 86400000), maxSeats: 12 },
      ],
    },
  ];

  for (const pkg of demoPackages) {
    const { tripTypeIds, itinerary, departures, ...pkgData } = pkg;
    const existing = await db.package.findUnique({ where: { slug: pkg.slug } });
    if (existing) continue; // skip if already seeded

    const created = await db.package.create({
      data: {
        ...pkgData,
        tripTypes: { connect: tripTypeIds.map((id) => ({ id })) },
      },
    });

    for (const day of itinerary) {
      await db.itineraryDay.create({ data: { ...day, packageId: created.id } });
    }

    for (const dep of departures) {
      await db.packageDeparture.create({ data: { ...dep, packageId: created.id } });
    }
  }
  console.log("  ✓ Demo Packages (10 with itinerary + departures)");

  // ─── 9. Blog Posts ───────────────────────────────────────────────────────────
  const owner = await db.user.findUnique({ where: { email: "owner@vramanholidays.com" } });

  const blogPosts = [
    {
      slug: "top-10-treks-nepal-beginners",
      title: "Top 10 Treks in Nepal for Beginners",
      excerpt: "Nepal isn't just for hardcore mountaineers. These ten beginner-friendly treks offer incredible Himalayan views without extreme altitude or technical climbing.",
      content: "<h2>1. Ghorepani Poon Hill Trek</h2><p>The classic 4-5 day trek through rhododendron forests with a spectacular sunrise over the Annapurna and Dhaulagiri ranges. Perfect first trek in Nepal.</p><h2>2. Annapurna Base Camp Trek</h2><p>A moderate 10-12 day journey into the heart of the Annapurna Sanctuary. Tea-house accommodation makes it comfortable and accessible.</p><h2>3. Langtang Valley Trek</h2><p>Often called 'the valley of glaciers', this 7-day trek north of Kathmandu offers stunning mountain scenery with fewer crowds than Annapurna or Everest regions.</p><h2>4. Everest View Trek</h2><p>Want to see Everest without the gruelling 14-day trek? The 7-day Everest View trek reaches Namche Bazaar for panoramic views without extreme altitude.</p><h2>5. Mardi Himal Trek</h2><p>A newer, less crowded alternative to ABC. The 5-day Mardi Himal trek offers close-up views of Machapuchare and the Annapurna range.</p>",
      coverImage: "https://picsum.photos/seed/blog-treks/1200/600",
      tags: ["trekking", "nepal", "beginners", "adventure"],
      publishedAt: new Date(now.getTime() - 7 * 86400000),
    },
    {
      slug: "maldives-perfect-honeymoon",
      title: "Why the Maldives is Perfect for Honeymoons",
      excerpt: "Overwater villas, private beaches, and underwater restaurants — discover why the Maldives tops every honeymoon bucket list.",
      content: "<h2>The ultimate romantic escape</h2><p>The Maldives is a string of 1,192 coral islands spread across the Indian Ocean. With overwater bungalows, private sandbanks, and crystal-clear lagoons, it's the definition of paradise.</p><h2>What makes it perfect for couples?</h2><p>Many resorts are adults-only, offering private dining on the beach, couples' spa treatments, sunset dolphin cruises, and some of the world's best snorkelling right off your villa deck.</p><h2>When to go</h2><p>The dry season from November to April offers the best weather. December to March is peak season — book early for the best overwater villa options.</p>",
      coverImage: "https://picsum.photos/seed/blog-maldives/1200/600",
      tags: ["maldives", "honeymoon", "luxury", "beach"],
      publishedAt: new Date(now.getTime() - 14 * 86400000),
    },
    {
      slug: "first-timers-guide-bangkok",
      title: "A First-Timer's Guide to Bangkok",
      excerpt: "Everything you need to know before your first trip to Thailand's capital — from temples and tuk-tuks to street food and shopping.",
      content: "<h2>Getting around</h2><p>Bangkok's BTS Skytrain and MRT metro are cheap and efficient for main attractions. For everything else, use Grab (Southeast Asia's Uber) or negotiate with tuk-tuk drivers for short trips.</p><h2>Must-visit temples</h2><p>Don't miss the Grand Palace and Wat Pho (home of the 46-metre Reclining Buddha). Visit Wat Arun at sunset for stunning riverside views.</p><h2>Street food essentials</h2><p>Bangkok is a food lover's paradise. Head to Yaowarat (Chinatown) for seafood, Silom Soi 20 for pad thai, and the old town for mango sticky rice. Budget around 50-100 THB per street meal.</p>",
      coverImage: "https://picsum.photos/seed/blog-bangkok/1200/600",
      tags: ["bangkok", "thailand", "guide", "culture"],
      publishedAt: new Date(now.getTime() - 21 * 86400000),
    },
    {
      slug: "himalayan-packing-list",
      title: "Packing List for Your Himalayan Adventure",
      excerpt: "Don't get caught unprepared at 4,000m. Here's the essential packing list for trekking in Nepal, tested by our guides.",
      content: "<h2>Clothing layers</h2><p>The key to Himalayan trekking is layering. You'll go from hot river valleys to freezing mountain passes in a single day.</p><ul><li>Moisture-wicking base layers (2-3 sets)</li><li>Fleece mid-layer</li><li>Down jacket (for evenings and high camps)</li><li>Waterproof outer shell</li><li>Trekking trousers (zip-off recommended)</li></ul><h2>Footwear</h2><p>Invest in good, broken-in waterproof trekking boots. Bring camp sandals for evenings and a pair of warm socks for sleeping.</p><h2>Gear essentials</h2><ul><li>30-40L daypack</li><li>Sleeping bag liner (tea-houses provide blankets)</li><li>Headlamp with spare batteries</li><li>Water purification (tablets or SteriPen)</li><li>Trekking poles</li><li>Sunscreen SPF50 and lip balm</li></ul>",
      coverImage: "https://picsum.photos/seed/blog-packing/1200/600",
      tags: ["packing", "trekking", "nepal", "tips"],
      publishedAt: new Date(now.getTime() - 3 * 86400000),
    },
    {
      slug: "hidden-gems-kerala",
      title: "Hidden Gems of Kerala Beyond the Backwaters",
      excerpt: "Kerala's backwaters are legendary, but the state has so much more. Discover secret waterfalls, offbeat hill stations, and untouched beaches.",
      content: "<h2>Wayanad — the green paradise</h2><p>Skip the crowded Munnar and head to Wayanad instead. Bamboo forests, ancient caves, and misty mountains await. The Edakkal Caves contain petroglyphs dating back 6,000 years.</p><h2>Marari Beach</h2><p>While most tourists flock to Varkala or Kovalam, Marari Beach near Alleppey is a serene stretch of sand with swaying palms and almost no crowds.</p><h2>Athirappilly Falls</h2><p>Kerala's Niagara — a stunning 80-foot waterfall surrounded by evergreen forest. Visit during monsoon (June-September) when the falls are at their most powerful.</p>",
      coverImage: "https://picsum.photos/seed/blog-kerala/1200/600",
      tags: ["kerala", "india", "hidden-gems", "travel"],
      publishedAt: new Date(now.getTime() - 10 * 86400000),
    },
  ];

  for (const post of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        status: ContentStatus.PUBLISHED,
        authorId: owner?.id,
      },
    });
  }
  console.log("  ✓ Blog Posts (5)");

  // ─── 10. Testimonials ────────────────────────────────────────────────────────
  const testimonials = [
    { name: "Sarah Johnson", location: "London, UK", rating: 5, content: "Our Annapurna Base Camp trek was absolutely life-changing! The guide was incredibly knowledgeable and the tea-house accommodation was much better than expected. Vraman Holidays planned every detail perfectly — we didn't have to worry about a thing." },
    { name: "Rajesh Sharma", location: "Delhi, India", rating: 5, content: "Booked the Golden Triangle tour for my family. The driver was punctual, the hotels were excellent, and our guide brought the history to life. The sunrise at the Taj Mahal was a moment I'll never forget. Highly recommend!" },
    { name: "Emma & Tom Wilson", location: "Sydney, Australia", rating: 5, content: "We chose Vraman for our honeymoon in Thailand. Bangkok was electric and Phuket was paradise. The team even arranged a surprise candlelit dinner on the beach. Beyond our expectations!" },
    { name: "Priya Thapa", location: "Kathmandu, Nepal", rating: 4, content: "Great experience with the Chitwan safari. Saw rhinos up close on the jeep safari and the Tharu dance was a lovely evening. The only minor issue was the long bus ride from Kathmandu, but the lodge more than made up for it." },
    { name: "Michael Chen", location: "Singapore", rating: 5, content: "The Everest Base Camp trek was the adventure of a lifetime. Standing at the base of the world's highest mountain is something I'll treasure forever. The Vraman team's attention to acclimatisation made all the difference." },
    { name: "Anita Gurung", location: "Pokhara, Nepal", rating: 4, content: "Booked the Kerala Backwaters trip for my parents' anniversary. They absolutely loved the houseboat experience and the tea plantations in Munnar. Great value for money and the booking process was super smooth." },
  ];

  for (const t of testimonials) {
    const exists = await db.testimonial.findFirst({ where: { name: t.name } });
    if (!exists) {
      await db.testimonial.create({
        data: { ...t, status: ContentStatus.PUBLISHED },
      });
    }
  }
  console.log("  ✓ Testimonials (6)");

  // ─── 11. Sample Enquiries ────────────────────────────────────────────────────
  const enquiries = [
    { type: "CONTACT" as const, name: "David Park", email: "david.park@example.com", phone: "+1-555-0123", message: "Hi, I'm interested in visiting Nepal next March. Could you send me information about your trekking packages? I'm a moderately experienced hiker." },
    { type: "PROPOSE" as const, name: "Lisa & James Carter", email: "carter.travels@example.com", phone: "+44-7700-900000", message: "We're planning our honeymoon for February 2027. We'd love a 2-week trip combining beaches and culture — maybe Thailand and Maldives? Budget is flexible but around USD 5,000 per person.", destination: "Thailand + Maldives", travelDates: "February 2027", groupSize: 2, budget: 500000, budgetCurrency: "USD" },
    { type: "PROPOSE" as const, name: "Suman Rai", email: "suman.rai@example.com", phone: "+977-9841000000", message: "I want to take a group of 8 friends on an adventure trip. We're thinking Everest Base Camp or maybe something in Pakistan. Open to suggestions! Dates flexible between October and November.", destination: "Nepal or Pakistan", travelDates: "Oct-Nov 2027", groupSize: 8, budget: 1500000, budgetCurrency: "NPR" },
  ];

  for (const enq of enquiries) {
    const exists = await db.enquiry.findFirst({ where: { email: enq.email } });
    if (!exists) {
      await db.enquiry.create({ data: enq });
    }
  }
  console.log("  ✓ Sample Enquiries (3)");

  // ─── 12. Team Members ────────────────────────────────────────────────────────
  // Emails are intentionally NOT stored/displayed. Each member's signature quote
  // is folded into the start of the bio. Photos can be added later via admin.
  const teamMembers = [
    { name: "Binay Lamsal", role: "Founder & Chairman", order: 1, bio: "“Travel should create memories and meaningful impact.” Mr. Binay Lamsal founded Vraman Holidays™ in 2020 with a vision that travel should be more than a transaction — it should create meaningful impact. A lifelong tourism professional, entrepreneur, and MBA graduate, Binay combines commercial vision with a deep commitment to responsible tourism, community development, and sustainable growth. He firmly believes that successful businesses should create value not only for shareholders, but also for travellers, employees, partners, and society as a whole." },
    { name: "Bikash Lamsal", role: "Co-Owner & Managing Director", order: 2, bio: "“Every journey deserves personal attention.” Bikash Lamsal leads the day-to-day operations, strategic planning, and guest experience management of Vraman Holidays™. A passionate traveller and outdoor enthusiast, he has explored much of Nepal's diverse landscapes, from remote Himalayan trails to cultural and pilgrimage destinations. Known for his approachable personality and strong industry relationships, Bikash ensures that every guest receives personalised attention, reliable service, and warm hospitality." },
    { name: "Arjun Regmi", role: "Chief Financial & Marketing Officer (CFMO)", order: 3, bio: "“Where strategy meets sustainable growth.” An MPhil graduate from Tribhuvan University, Arjun Regmi brings a unique combination of financial expertise and strategic marketing vision to Vraman Holidays™. He oversees the company's financial planning, resource management, and global promotional initiatives while leading the development of marketing campaigns and brand communication. His analytical approach and attention to detail help ensure the company grows with both financial stability and a strong international presence." },
    { name: "Prabidha Regmi", role: "Director – Global Brand & Marketing", order: 4, bio: "“Connecting Nepal to the world, one story at a time.” Prabidha Regmi plays a key role in shaping the global brand identity of Vraman Holidays™. Since the company's early days, she has contributed to international marketing, destination promotion, and brand positioning across multiple tourism platforms. Her focus on storytelling and authentic promotion continues to support the company's philosophy of creating compelling travel experiences rather than simply selling packages." },
    { name: "Renu Kandel", role: "Marketing & Communications Manager", order: 5, bio: "“Crafting messages that inspire meaningful travel.” Renu Kandel is responsible for marketing coordination, content communication, and promotional support at Vraman Holidays™. She works closely with the marketing team to develop engaging travel content, strengthen the company's digital presence, and enhance communication with clients and partners. Her creative approach and collaborative mindset help the brand connect with travellers in a meaningful and memorable way." },
    { name: "Nirmala Lamsal", role: "Chief Operating Officer (COO)", order: 6, bio: "“Turning purpose into action and values into impact.” Nirmala Lamsal oversees operational excellence, service quality, and organisational development at Vraman Holidays™. She believes successful tourism is built on trust, value creation, and genuine care for both guests and team members. A passionate advocate of responsible business, she champions the company's social impact initiatives through what she fondly calls the “Impact Fund”, believing meaningful growth is achieved when commercial success and social progress move forward together." },
    { name: "Amrit Adhikari", role: "Director – Corporate Relations & Business Development", order: 7, bio: "“Building partnerships that create opportunities.” Amrit Adhikari leads corporate relations and business development initiatives for Vraman Holidays™. With strong networking skills and a relationship-driven approach, he works closely with corporate clients, institutions, and business partners to create long-term collaborations. His focus on strategic growth and client satisfaction has helped expand the company's corporate travel and partnership portfolio." },
    { name: "Sulav Jung Hamal", role: "Director – North America Partnerships", order: 8, bio: "“Creating bridges between people, destinations, and possibilities.” Sulav Jung Hamal is responsible for strengthening Vraman Holidays' partnership network across the United States and Canada. He works on building strategic alliances, identifying market opportunities, and developing relationships that support the company's international growth in North America." },
    { name: "Sushav Hamal", role: "Manager – Strategic Alliances & Market Development", order: 9, bio: "“Strong relationships create extraordinary outcomes.” Sushav Hamal focuses on strategic partnerships, market development, and international collaboration. Working closely with travel partners and business networks, she strengthens the company's global connections and identifies new opportunities for growth. Her forward-thinking approach contributes to partnerships that are both productive and sustainable." },
    { name: "Prasiddha Kandel", role: "Manager – International Business Relations", order: 10, bio: "“Expanding horizons through trusted partnerships.” Prasiddha Kandel supports Vraman Holidays' international business development through relationship management, market research, and strategic collaboration. He works with travel partners and clients to identify opportunities that enhance the company's global reach, with a focus on long-term value." },
    { name: "Kami R Sherpa", role: "Director – Tours & Guest Experience", order: 11, bio: "“The best journeys are measured by smiles, not miles.” Kami R Sherpa has been with Vraman Holidays™ since its inception and is one of the company's most experienced tourism professionals. Beginning his career as a guide in Kathmandu's tourism sector, he has grown into a leader responsible for delivering safe, smooth, and memorable travel experiences across Nepal. His deep destination knowledge and genuine passion for hospitality make him an invaluable part of the family." },
    { name: "Neestha Adhikari", role: "Manager – Reservations & Customer Success", order: 12, bio: "“Every detail matters. Every traveller counts.” Neestha Adhikari manages reservations, client communications, and travel coordination for both individual travellers and business partners. She specialises in flights, accommodations, customised itineraries, and travel support services. Known for her attention to detail and problem-solving ability, she ensures every booking process is efficient, accurate, and stress-free." },
    { name: "Bishnu Ma'am", role: "Workplace & Guest Hospitality Coordinator", order: 13, bio: "“Hospitality begins with making people feel at home.” Bishnu Ma'am helps create the welcoming environment that guests and team members experience every day at Vraman Holidays™. She supports office operations, guest hospitality, and workplace coordination, ensuring the office remains organised, comfortable, and inviting. Her caring nature, reliability, and dedication contribute greatly to the positive culture that defines the family." },
  ];

  for (const m of teamMembers) {
    const exists = await db.teamMember.findFirst({ where: { name: m.name } });
    if (exists) {
      await db.teamMember.update({ where: { id: exists.id }, data: { role: m.role, bio: m.bio, order: m.order, visible: true } });
    } else {
      await db.teamMember.create({ data: { ...m, visible: true } });
    }
  }
  console.log("  ✓ Team Members (13)");

  // ─── 13. CMS Marketing Pages ─────────────────────────────────────────────────
  // Editable from Admin → Pages. Copy uses {brand}/{tagline}/{philosophy} tokens
  // resolved at render time. Existence-gated by slug so admin edits survive reseed.
  type SeedSection = { type: SectionType; data: Prisma.InputJsonValue };
  async function seedCmsPage(
    slug: string,
    title: string,
    metaTitle: string,
    metaDescription: string,
    sections: SeedSection[],
  ) {
    const existing = await db.page.findUnique({ where: { slug } });
    if (existing) return;
    const page = await db.page.create({
      data: { slug, title, status: ContentStatus.PUBLISHED, metaTitle, metaDescription },
    });
    await db.pageSection.createMany({
      data: sections.map((s, i) => ({ pageId: page.id, type: s.type, order: i, data: s.data, visible: true })),
    });
  }

  await seedCmsPage(
    "about",
    "About Us",
    "About Us | Vraman Holidays",
    "Vraman Holidays — a Nepal-based destination management company creating meaningful journeys across Nepal and beyond.",
    [
      { type: SectionType.RICH_TEXT, data: { content: "<p>At <strong>{brand}</strong>, we believe travel is far more than moving from one destination to another — it is about creating meaningful experiences, discovering new perspectives, and building memories that last a lifetime.</p><p>The word <em>“Vraman”</em> in Nepali means <em>“to travel”</em> or <em>“to embark upon a journey”</em>. Inspired by this philosophy, we design journeys that are personal, authentic, and memorable.</p><p>Based in the heart of Thamel, Kathmandu, {brand} is a professionally managed travel and tourism company founded by passionate tourism professionals from Western Nepal, with years of expertise across destination management, adventure tourism, cultural experiences, pilgrimage journeys, corporate travel, leisure holidays, luxury escapes, educational tours, and Himalayan expeditions.</p><p>Our philosophy is simple: <strong>“Stop Selling. Start Compelling.”</strong> We do not merely arrange trips; we curate experiences that connect people with places, cultures, communities, and emotions — helping every traveller confidently <strong>Propose Your Destination™</strong>.</p>" } },
      { type: SectionType.FEATURE_GRID, data: { muted: true, columns: 2, variant: "feature", items: [
        { icon: "target", title: "Our Mission", description: "To create meaningful travel experiences that showcase the beauty, culture, spirituality, and adventure of Nepal while contributing positively to local communities and sustainable tourism development." },
        { icon: "eye", title: "Our Vision", description: "To become one of Nepal's most trusted and inspiring travel brands by delivering exceptional experiences, fostering meaningful connections, and creating lasting value for travellers, communities, and partners." },
      ] } },
      { type: SectionType.FEATURE_GRID, data: { heading: "Our Values", columns: 5, variant: "feature", items: [
        { title: "Integrity", description: "We conduct business honestly, transparently, and responsibly." },
        { title: "Sustainability", description: "We promote tourism that benefits people, communities, and the environment." },
        { title: "Hospitality", description: "Every guest is welcomed with genuine care and respect." },
        { title: "Excellence", description: "We continuously strive to exceed expectations." },
        { title: "Community", description: "We believe travel should create positive impacts beyond the journey itself." },
      ] } },
      { type: SectionType.FEATURE_GRID, data: { muted: true, heading: "Why Travel With {brand}?", columns: 4, variant: "feature", items: [
        { icon: "heart", title: "Personalised Travel Experiences", description: "Every traveller is unique. We design journeys around your interests, preferences, and travel goals." },
        { icon: "dollar-sign", title: "Competitive Pricing", description: "Strong partnerships with airlines, hotels, transport providers, and tourism stakeholders allow us to deliver exceptional value." },
        { icon: "compass", title: "Trusted Local Expertise", description: "Our experienced team and certified guides possess extensive destination knowledge throughout Nepal." },
        { icon: "shield-check", title: "Reliable Service Delivery", description: "From airport arrival to departure, we ensure seamless coordination and support." },
        { icon: "calendar-check", title: "Flexible Itineraries", description: "Need additional nights, special experiences, or customised arrangements? We make it happen." },
        { icon: "headphones", title: "Dedicated Customer Support", description: "We understand global time zones and respond promptly to enquiries from around the world." },
        { icon: "badge-check", title: "Safety & Professionalism", description: "Experienced guides, reliable transportation, and carefully selected partners ensure peace of mind." },
        { icon: "leaf", title: "Sustainable Tourism Commitment", description: "We support responsible tourism that benefits local communities, preserves cultural heritage, and protects the natural environment." },
      ] } },
      { type: SectionType.RICH_TEXT, data: { align: "center", content: "<h2>Our Team • Our Pride</h2><p><strong>13 passionate professionals. One shared mission: creating extraordinary travel experiences.</strong></p><p>At {brand}, we believe exceptional journeys begin with exceptional people. Behind every itinerary, airport transfer, pilgrimage, expedition, family holiday, corporate event, and unforgettable experience is a dedicated team committed to one simple mission — creating journeys that inspire, connect, and leave lasting memories.</p><p>United by our philosophy, <strong>“Stop Selling. Start Compelling.”</strong>, our team combines local expertise, global perspective, and genuine Nepalese hospitality. We are more than colleagues — we are travellers, storytellers, planners, guides, strategists, and passionate ambassadors of Nepal.</p>" } },
      { type: SectionType.CHECKLIST, data: { heading: "What Makes Our Team Different?", columns: 4, items: ["Local Expertise", "Global Perspective", "Multilingual Support", "24/7 Assistance", "Personalised Service", "Strong Industry Network", "Responsible Tourism Commitment", "Passion for Travel"] } },
    ],
  );

  await seedCmsPage(
    "signature-journeys",
    "Signature Journeys",
    "Signature Journeys | Vraman Holidays",
    "Our signature programmes — curated journeys through Nepal's festivals, faith, wellness, and luxury, crafted by Vraman Holidays.",
    [
      { type: SectionType.PAGE_HEADER, data: { eyebrow: "Signature Journeys", title: "Journeys Worth Remembering", lead: "Our signature programmes are the heart of {brand} — distinctive journeys crafted around Nepal's festivals, faith, wellness, and luxury. Detailed itineraries for each programme are on their way; reach out and we'll share the full plan." } },
      { type: SectionType.FEATURE_GRID, data: { columns: 2, variant: "journey", items: [
        { title: "Aafno Desh, Aafno Dashain™", description: "A festival homecoming — celebrate Dashain in your homeland, surrounded by family, tradition, and joy." },
        { title: "Aafno Desh, Aafno Muktinath™", description: "A sacred return for the Nepali diaspora and devotees — a soulful pilgrimage to Muktinath." },
        { title: "Muktinath Divine Journey™", description: "A guided spiritual journey to the holy shrine of Muktinath, where faith meets the Himalayas." },
        { title: "Nepal Wellness Tour 2027", description: "Yoga, Ayurveda, meditation, and Himalayan serenity — a journey to restore body and mind." },
        { title: "Luxury Nepal Collection", description: "Nepal's finest stays, private experiences, and seamless service, curated for discerning travellers." },
        { title: "Educational & Student Tours", description: "Immersive, safe, and enriching learning journeys for schools, colleges, and universities." },
        { title: "Corporate Retreats", description: "Team offsites, incentives, and leadership retreats set against inspiring Himalayan backdrops." },
      ] } },
      { type: SectionType.CTA, data: { title: "Have a different vision?", subtitle: "We design bespoke journeys around your dreams.", ctaLabel: "Propose Your Destination™", ctaHref: "/propose" } },
    ],
  );

  await seedCmsPage(
    "experiences",
    "Experiences",
    "Experiences | Vraman Holidays",
    "People don't buy destinations — they buy experiences. Explore our pilgrimage, adventure, wellness, family, luxury, and educational journeys.",
    [
      { type: SectionType.PAGE_HEADER, data: { title: "Experiences", subtitle: "People don't buy destinations. People buy experiences.", lead: "At {brand}, every journey is built around the way you want to feel — whether that's awe, devotion, adventure, calm, or connection." } },
      { type: SectionType.FEATURE_GRID, data: { columns: 4, variant: "feature", ctaLabel: "Tell us the experience you're dreaming of", ctaHref: "/propose", items: [
        { icon: "mountain", title: "Pilgrimage & Spiritual Journeys", description: "Sacred destinations and soulful journeys to Muktinath, Pashupatinath, Lumbini, and beyond." },
        { icon: "compass", title: "Adventure & Expeditions", description: "Trekking, mountaineering, and high-altitude expeditions for those who chase the extraordinary." },
        { icon: "users", title: "Family Holidays", description: "Thoughtfully paced journeys that delight every generation, from little ones to grandparents." },
        { icon: "flower", title: "Wellness & Mindfulness", description: "Yoga, Ayurveda, meditation, and Himalayan serenity to restore body and mind." },
        { icon: "graduation-cap", title: "Educational Tours", description: "Immersive, safe, and enriching learning journeys for schools, colleges, and universities." },
        { icon: "briefcase", title: "Corporate Travel", description: "Offsites, incentives, MICE, and leadership retreats in inspiring settings." },
        { icon: "gem", title: "Luxury Experiences", description: "The finest stays, private guides, and seamless, white-glove service throughout." },
        { icon: "camera", title: "Photography Expeditions", description: "Guided journeys to Nepal's most photogenic landscapes, cultures, and wildlife." },
      ] } },
    ],
  );

  await seedCmsPage(
    "travel-trade",
    "Travel Trade Partners",
    "Travel Trade Partners | Vraman Holidays",
    "Partner with Vraman Holidays — DMC services in Nepal for Indian agents, international tour operators, corporate clients, schools, and event organisers.",
    [
      { type: SectionType.PAGE_HEADER, data: { title: "Travel Trade Partners", lead: "{brand} is a trusted destination-management partner in Nepal. We work hand in hand with agents, operators, institutions, and corporates to deliver seamless, memorable journeys for their clients." } },
      { type: SectionType.FEATURE_GRID, data: { columns: 3, variant: "feature", items: [
        { icon: "handshake", title: "For Indian Travel Agents", description: "Reliable, competitively priced Nepal packages with fast turnaround and dedicated B2B support." },
        { icon: "globe", title: "For International Tour Operators", description: "A trusted ground partner in Nepal delivering seamless operations and authentic experiences." },
        { icon: "building", title: "For Corporate Clients", description: "MICE, incentives, offsites, and corporate retreats managed end to end." },
        { icon: "school", title: "For Schools & Universities", description: "Safe, structured, and enriching educational tours and student programmes." },
        { icon: "calendar-days", title: "For Event Organizers", description: "Logistics, accommodation, transport, and on-ground coordination for events of any scale." },
        { icon: "map-pinned", title: "DMC Services in Nepal", description: "Full destination-management services — accommodation, transport, guides, permits, and bespoke itineraries." },
      ] } },
      { type: SectionType.CHECKLIST, data: { muted: true, heading: "Why Partners Choose Us", columns: 4, items: ["Personalised Service", "Local Expertise", "Competitive Pricing", "Flexible Itineraries", "Reliable Operations", "24/7 Support", "Sustainable Tourism", "Trusted Industry Partnerships"] } },
      { type: SectionType.CTA, data: { title: "Let's Build a Partnership", subtitle: "Tell us about your business and the journeys your clients are looking for, and our trade team will get back to you with rates and sample programmes.", ctaLabel: "Become a Partner", ctaHref: "/contact" } },
    ],
  );

  await seedCmsPage(
    "why-nepal",
    "Why Nepal?",
    "Why Nepal? | Vraman Holidays",
    "Spiritual, Himalayan, wellness, family, wildlife, cultural, culinary, and festival Nepal — discover why Nepal belongs at the top of your travel list.",
    [
      { type: SectionType.PAGE_HEADER, data: { title: "Why Nepal?", lead: "Few places on earth pack so much into one country. Nepal is spiritual and adventurous, serene and exhilarating, ancient and alive. Here are eight reasons travellers fall in love with it — and why {brand} loves sharing it." } },
      { type: SectionType.FEATURE_GRID, data: { columns: 4, variant: "feature", ctaLabel: "Explore Nepal Destinations", ctaHref: "/destinations", items: [
        { icon: "landmark", title: "Spiritual Nepal", description: "The birthplace of Buddha and a land of countless temples, stupas, and sacred shrines — a journey for the soul." },
        { icon: "mountain", title: "Himalayan Nepal", description: "Home to eight of the world's fourteen highest peaks, including Everest — the ultimate playground for adventurers." },
        { icon: "flower", title: "Wellness Nepal", description: "Yoga, Ayurveda, meditation retreats, and mountain air that heals body and mind alike." },
        { icon: "users", title: "Family Nepal", description: "Safe, warm, and wonder-filled experiences that create memories for every generation." },
        { icon: "paw", title: "Wildlife Nepal", description: "One-horned rhinos, Bengal tigers, and rich biodiversity across Chitwan, Bardia, and beyond." },
        { icon: "drama", title: "Cultural Nepal", description: "Living heritage, ancient cities, diverse ethnic traditions, and timeless craftsmanship." },
        { icon: "utensils", title: "Culinary Nepal", description: "From momos and dal bhat to Newari feasts — a flavourful journey through Himalayan kitchens." },
        { icon: "party", title: "Festival Nepal", description: "Dashain, Tihar, Holi, and a calendar bursting with colour, devotion, and celebration." },
      ] } },
    ],
  );

  await seedCmsPage(
    "sustainability",
    "Sustainability",
    "Sustainability | Vraman Holidays",
    "Travel with purpose. Vraman Holidays is committed to responsible tourism, community empowerment, environmental stewardship, and ethical business.",
    [
      { type: SectionType.PAGE_HEADER, data: { title: "Travel with Purpose", subtitle: "Most companies write a paragraph about sustainability. We're building a movement.", lead: "At {brand}, we believe tourism should enrich travellers while creating positive impacts for local communities, cultures, and the environment." } },
      { type: SectionType.FEATURE_GRID, data: { heading: "Our Commitments", columns: 3, variant: "feature", items: [
        { icon: "leaf", title: "Responsible Tourism", description: "We design journeys that respect local cultures, minimise impact, and give back to the places we visit." },
        { icon: "heart-handshake", title: "Community Empowerment", description: "We partner with local guides, families, and businesses so tourism benefits the communities that host it." },
        { icon: "tree", title: "Environmental Stewardship", description: "We protect Nepal's natural heritage — its mountains, forests, rivers, and wildlife — for generations to come." },
        { icon: "book", title: "Tourism Education", description: "We invest in training and awareness, raising standards across the industry and within communities." },
        { icon: "scale", title: "Ethical Business Practices", description: "We operate with honesty, transparency, and fairness toward our travellers, partners, and team." },
      ] } },
    ],
  );

  await seedCmsPage(
    "hall-of-achievements",
    "Hall of Achievements",
    "Hall of Achievements | Vraman Holidays",
    "Milestones that define us — Everest expeditions, major group departures, international partnerships, and years of trusted service.",
    [
      { type: SectionType.PAGE_HEADER, data: { title: "Hall of Achievements", lead: "Milestones that reflect the trust travellers and partners place in {brand} — and the journeys we're proud to have made possible." } },
      { type: SectionType.FEATURE_GRID, data: { columns: 3, variant: "stat", footnote: "Figures will be updated with verified statistics.", items: [
        { icon: "mountain", value: "—", title: "Everest Expeditions", description: "Successfully organised treks and expeditions to Everest and other iconic Himalayan peaks." },
        { icon: "users", value: "—", title: "Major Group Departures", description: "Large-scale group journeys delivered with seamless coordination and care." },
        { icon: "globe", value: "—", title: "International Partnerships", description: "Trusted relationships with agents and operators across the globe." },
        { icon: "briefcase", value: "—", title: "Corporate Events", description: "Offsites, incentives, and corporate retreats hosted across Nepal." },
        { icon: "graduation-cap", value: "—", title: "Student Tours", description: "Educational journeys delivered for schools, colleges, and universities." },
        { icon: "calendar-clock", value: "—", title: "Years of Service", description: "Years of crafting meaningful journeys since our founding in 2020." },
        { icon: "bar-chart", value: "—", title: "Happy Travellers", description: "Guests who have trusted us to design their journeys." },
      ] } },
    ],
  );

  await seedCmsPage(
    "trust-credentials",
    "Trust, Credentials & Industry Memberships",
    "Trust, Credentials & Industry Memberships | Vraman Holidays",
    "Vraman Holidays is a legally registered tourism company in Nepal, affiliated with leading national and international tourism organisations. Verify our credentials.",
    [
      { type: SectionType.PAGE_HEADER, data: { title: "Trust, Credentials & Industry Memberships", lead: "At {brand}, trust, transparency, and professionalism form the foundation of everything we do. We are a legally registered tourism company in Nepal, proudly affiliated with leading national and international tourism organisations. We encourage our valued guests, travel partners, and corporate clients to independently verify our credentials through the official links below." } },
      { type: SectionType.CREDENTIALS, data: {
        closingTitle: "Travel With Confidence",
        closingText: "At {brand}, trust is not claimed — it is earned through professionalism, transparency, accountability, and consistently delivering exceptional travel experiences. Our registrations, memberships, and affiliations reflect our ongoing commitment to operating at the highest standards within Nepal's tourism industry and beyond. When you choose {brand}, you are partnering with a professionally managed tourism company that values transparency, accountability, and exceptional service. {tagline} · {philosophy}",
        groups: [
          { title: "Government Registration & Compliance", description: "{brand} is a legally registered tourism company in Nepal, fully compliant with the country's company-registration and tax requirements. We encourage you to verify our credentials directly with the authorities below.", columns: 2, items: [
            { title: "OCR Registration", detail: "Company Registration Number: 242444/077/078", description: "Vraman Holidays Private Limited is duly registered with the Office of the Company Registrar (OCR), Government of Nepal.", verifyLabel: "Verify with the Office of the Company Registrar (OCR) Nepal", verifyUrl: "https://application.ocr.gov.np/faces/CompanyDetails.jsp" },
            { title: "PAN / VAT Registration", detail: "PAN/VAT Number: 609801851", description: "Our company operates under a valid PAN/VAT registration issued by the Government of Nepal.", verifyLabel: "Verify with the Inland Revenue Department (IRD) Nepal – PAN Search", verifyUrl: "https://ird.gov.np/pan-search/" },
          ] },
          { title: "Industry Memberships & Affiliations", description: "{brand} proudly maintains memberships, affiliations, and professional partnerships with respected tourism, business, and sustainability organisations. These associations reflect our commitment to ethical business practices, responsible tourism, international collaboration, and service excellence.", columns: 2, muted: true, items: [
            { title: "Nepal Association of Tour & Travel Agents (NATTA)", description: "As a member of NATTA, we are part of Nepal's leading umbrella organisation representing travel agencies and tour operators nationwide.", verifyLabel: "NATTA Member Directory – Vraman Holidays Pvt. Ltd.", verifyUrl: "https://natta.org.np/member/vraman-holidays-pvt-ltd/" },
            { title: "Pacific Asia Travel Association (PATA) Nepal Chapter", description: "We proudly support responsible tourism development, destination marketing, and international tourism cooperation through our affiliation with the PATA Nepal Chapter." },
            { title: "Nepal Tourism Board (NTB)", description: "Working in alignment with Nepal's national tourism vision and destination promotion initiatives." },
            { title: "Nepal Germany Chamber of Commerce & Industry (NGCCI)", description: "As a member of NGCCI, we actively engage with international business networks and foster stronger commercial and tourism ties.", verifyLabel: "NGCCI Registered Members Directory", verifyUrl: "https://www.ngcci.org/registered-members/" },
            { title: "British Nepal Chamber of Commerce (BNCC)", description: "Supporting stronger tourism, trade, and business relationships between Nepal and international markets." },
            { title: "Kathmandu Environmental Education Project (KEEP)", description: "Committed to responsible tourism, environmental stewardship, and sustainable travel practices throughout Nepal." },
          ] },
          { title: "Sustainability & Responsible Tourism", columns: 1, items: [
            { title: "One Planet Network", description: "Vraman Holidays is proudly recognised by the One Planet Sustainable Tourism Programme, a global initiative supporting sustainable consumption and production practices in tourism.", verifyLabel: "View profile – One Planet Network", verifyUrl: "https://www.oneplanetnetwork.org/organisations/vraman-holidays-pvt-ltd" },
          ] },
          { title: "International Travel Trade Presence", description: "To strengthen our global visibility and collaboration with travel professionals worldwide, {brand} is listed on international travel-trade platforms that connect Destination Management Companies (DMCs), suppliers, and tourism stakeholders.", columns: 1, muted: true, items: [
            { title: "EVINTRA – Global DMC Network", description: "EVINTRA is an international tourism marketplace connecting travel professionals, tour operators, and destination management companies worldwide. Vraman Holidays is featured among Nepal's recognised DMCs.", verifyLabel: "View listing – EVINTRA (Nepal DMC Directory)", verifyUrl: "https://www.evintra.com/search/country/np/nepal/dmc" },
          ] },
        ],
      } },
    ],
  );
  console.log("  ✓ CMS Marketing Pages (8, existence-gated)");

  console.log("\n✅ Seed complete!");
  console.log("   Admin login: owner@vramanholidays.com — Check seed.ts for initial credentials");
  console.log("   Change the password after first login.");
  console.log("   Demo: 10 packages, 5 blog posts, 6 testimonials, 3 enquiries");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
