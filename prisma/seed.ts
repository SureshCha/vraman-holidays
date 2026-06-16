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
        primaryColor: "oklch(0.52 0.19 225)",
        secondaryColor: "oklch(0.97 0.01 225)",
        accentColor: "oklch(0.70 0.16 60)",
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
    },
  });
  console.log("  ✓ SiteSettings");

  // ─── 2. Destinations (with images) ──────────────────────────────────────────
  const destinations = [
    { slug: "nepal", name: "Nepal", country: "Nepal", order: 1, description: "From the mighty Himalayas to lush jungles, Nepal is a paradise for trekkers, culture lovers, and spiritual seekers. Home to 8 of the world's 14 highest peaks, including Everest.", imageUrl: "https://picsum.photos/seed/nepal/800/500" },
    { slug: "india", name: "India", country: "India", order: 2, description: "A land of incredible diversity — ancient temples, vibrant cities, golden deserts, and tropical coastlines. India offers something extraordinary at every turn.", imageUrl: "https://picsum.photos/seed/india/800/500" },
    { slug: "maldives", name: "Maldives", country: "Maldives", order: 3, description: "Crystal-clear turquoise waters, overwater bungalows, and pristine white-sand beaches. The Maldives is the ultimate tropical escape.", imageUrl: "https://picsum.photos/seed/maldives/800/500" },
    { slug: "thailand", name: "Thailand", country: "Thailand", order: 4, description: "The Land of Smiles blends ancient temples, bustling night markets, tropical islands, and world-renowned cuisine into an unforgettable experience.", imageUrl: "https://picsum.photos/seed/thailand/800/500" },
    { slug: "singapore", name: "Singapore", country: "Singapore", order: 5, description: "A futuristic city-state where stunning architecture meets lush gardens, incredible street food, and a vibrant multicultural heritage.", imageUrl: "https://picsum.photos/seed/singapore/800/500" },
    { slug: "australia", name: "Australia", country: "Australia", order: 6, description: "From the Great Barrier Reef to the red deserts of the Outback, Australia is a continent of natural wonders and laid-back adventure.", imageUrl: "https://picsum.photos/seed/australia/800/500" },
    { slug: "uk", name: "United Kingdom", country: "United Kingdom", order: 7, description: "Historic castles, rolling countryside, world-class museums, and vibrant cities. The UK blends centuries of heritage with modern culture.", imageUrl: "https://picsum.photos/seed/uk-london/800/500" },
    { slug: "pakistan", name: "Pakistan", country: "Pakistan", order: 8, description: "Home to some of the world's most dramatic mountain scenery, ancient civilisations, and warm hospitality that rivals any destination.", imageUrl: "https://picsum.photos/seed/pakistan/800/500" },
  ];

  for (const dest of destinations) {
    await db.destination.upsert({
      where: { slug: dest.slug },
      update: { imageUrl: dest.imageUrl, description: dest.description },
      create: {
        ...dest,
        status: ContentStatus.PUBLISHED,
      },
    });
  }
  console.log("  ✓ Destinations (8 with images)");

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
        {
          type: SectionType.CTA,
          order: 7,
          visible: true,
          data: {
            title: "Can\u2019t find what you\u2019re looking for?",
            subtitle: "Tell us your dream destination and we\u2019ll craft a personalised itinerary just for you.",
            ctaLabel: "Propose Your Trip",
            ctaHref: "/propose",
          },
        },
      ],
    });
  }
  console.log("  ✓ HomeSections (6)");

  // ─── 8. Demo Packages ────────────────────────────────────────────────────────
  const nepalDest = await db.destination.findUnique({ where: { slug: "nepal" } });
  const indiaDest = await db.destination.findUnique({ where: { slug: "india" } });
  const thailandDest = await db.destination.findUnique({ where: { slug: "thailand" } });
  const adventureType = await db.tripType.findUnique({ where: { slug: "adventure" } });
  const culturalType = await db.tripType.findUnique({ where: { slug: "cultural" } });
  const honeymoonType = await db.tripType.findUnique({ where: { slug: "honeymoon" } });
  const wildlifeType = await db.tripType.findUnique({ where: { slug: "wildlife" } });

  if (!nepalDest || !indiaDest || !thailandDest || !adventureType || !culturalType || !honeymoonType || !wildlifeType) {
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
      destinationId: nepalDest.id,
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
      destinationId: nepalDest.id,
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
      destinationId: nepalDest.id,
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
      destinationId: nepalDest.id,
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
