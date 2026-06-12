# CLAUDE.md — Vraman Holidays Website

> Guidance for Claude Code (and any AI assistant) working on this repository.
> Read this fully before generating code. Keep it updated as the project evolves.

---

## 1. What we are building

A modern, multi-destination, payment-enabled website for **Vraman Holidays Pvt. Ltd.**, a boutique travel agency in Thamel, Kathmandu (tagline: *"Propose Your Destination"*).

The site serves Nepal + international destinations (India, Maldives, Thailand, Singapore, Australia, UK, Pakistan and more), with online booking, online payment, a blog, and enquiry forms.

**The single most important architectural rule:**

> **Everything that appears on the public site must be editable from the admin panel — content, structure, theme, navigation, pricing, feature toggles, and payment settings — with no code change and no developer involvement.**

When in doubt, ask: *"Could a non-technical Vraman staff member change this from the admin panel?"* If the answer should be "yes" but the implementation hard-codes it, the implementation is wrong. Default to making things data-driven and admin-managed, not hard-coded.

---

## 2. Tech stack (decided)

These are the working assumptions. If a decision needs to change, update this file and say so explicitly in the PR/commit.

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 15 (App Router) + React 19** | SSR/SSG matters for SEO on a travel site; "React" requirement satisfied |
| Language | **TypeScript (strict)** | No `any` without justification |
| Styling | **Tailwind CSS** + **shadcn/ui** components | Theme tokens come from DB (see §6) |
| Animation | **Framer Motion** | Boutique/premium feel |
| Database | **PostgreSQL** | |
| ORM | **Prisma** | Single source of schema truth |
| Auth (admin) | **Auth.js (NextAuth v5)** | Credentials + role-based access |
| Data fetching (client) | **TanStack Query** | For admin panel mutations/caching |
| Forms + validation | **React Hook Form + Zod** | Zod schemas shared client/server |
| File/image storage | **Cloudinary** | Admin uploads go here |
| Transactional email | **Resend** | Booking + enquiry notifications |
| Payments | **eSewa, Khalti, Stripe, bank transfer** | See §8 |
| Hosting | **Vercel** (web) + **Neon/Railway/Supabase** (DB) | |
| Analytics | **GA4** + Vercel Analytics | |

> **Open decision to confirm with the client:** custom admin + own DB (chosen here) vs. a headless CMS like Strapi/Sanity (proposal Option C). This file assumes the **custom admin** path because the brief emphasises total configurability and a React-first build. If we switch to headless CMS, large parts of §5 and §6 change.

---

## 3. Repository structure

```
/
├── prisma/
│   ├── schema.prisma          # Single source of truth for data
│   └── seed.ts                # Seed default settings, destinations, sample packages
├── src/
│   ├── app/
│   │   ├── (site)/            # Public-facing routes (SSR/SSG)
│   │   │   ├── page.tsx                 # Home (sections from DB)
│   │   │   ├── destinations/
│   │   │   ├── [country]/               # Country page
│   │   │   ├── packages/[slug]/         # Package detail
│   │   │   ├── booking/                 # Multi-step booking flow
│   │   │   ├── blog/
│   │   │   ├── about/  contact/  propose/
│   │   │   └── legal/[slug]/
│   │   ├── (admin)/admin/     # Admin panel (auth-gated)
│   │   │   ├── dashboard/
│   │   │   ├── packages/  destinations/  bookings/
│   │   │   ├── blog/  testimonials/  enquiries/
│   │   │   ├── pages/  navigation/  homepage/
│   │   │   ├── settings/      # Brand, theme, payments, email, SEO
│   │   │   └── media/  users/
│   │   └── api/               # Route handlers (REST-ish)
│   │       ├── payments/{esewa,khalti,stripe}/
│   │       ├── bookings/  enquiries/
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── site/              # Public components + section renderers
│   │   └── admin/             # Admin-only components
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── auth.ts            # Auth.js config
│   │   ├── payments/          # Gateway adapters (one file per gateway)
│   │   ├── email/             # Resend client + templates
│   │   ├── settings.ts        # getSettings() cached accessor
│   │   └── validators/        # Zod schemas (shared)
│   └── types/
├── .env.example
└── CLAUDE.md
```

---

## 4. Public pages (all content-driven)

Build these as templates that render data from the DB — never hard-code package/destination content into JSX.

- **Home** — hero slider, search bar, featured packages, destination grid, testimonials, blog preview. Section order and content come from the `HomeSection` model.
- **Destinations hub** — browse by country.
- **Country page** — country intro + its packages, with filters (trip type, duration, budget).
- **Package detail** — day-by-day itinerary, inclusions/exclusions, gallery, price, dates, booking CTA.
- **Booking flow** — multi-step: traveller info → date/option select → payment → confirmation.
- **About, Contact, Blog (list + post), Propose Your Trip** (custom enquiry).
- **Legal** — Terms, Privacy, Refund (each an editable `LegalPage`).
- **Utility** — 404, search results.
- **Global** — WhatsApp floating button (number from settings), mobile-first responsive, English first (i18n-ready for Nepali later).

---

## 5. Admin panel (the heart of the project)

Every section below maps to a real admin screen with full CRUD. Non-technical staff must be able to operate all of it.

- **Dashboard** — bookings count, revenue, recent enquiries.
- **Packages** — create/edit/delete; manage itinerary days, inclusions/exclusions, gallery, pricing, available dates, publish toggle, featured toggle.
- **Destinations & trip types** — manage countries and categories; reorder.
- **Bookings** — view, filter, update status, export CSV.
- **Blog** — write/publish posts (rich text), manage drafts.
- **Testimonials** — add/approve/hide reviews.
- **Enquiries** — view "Propose Your Trip" + contact submissions.
- **Pages** — CMS-managed standalone pages via a **section/block builder** (hero, text, gallery, CTA, etc.).
- **Navigation** — build header/footer menus (label + link + order), no code.
- **Homepage** — reorder and edit homepage sections and hero banners.
- **Media library** — upload/browse Cloudinary assets.
- **Settings** (see §6) and **Users** (role-based: Owner / Admin / Editor).

**Rule:** any new public feature ships with its corresponding admin controls in the same change. A feature is not "done" if it can only be changed in code.

---

## 6. Configurability model (read this carefully)

This is what makes the project distinctive. Implement a layered config system:

1. **`SiteSettings`** — a single (or key-value) record holding global config:
   - Brand: name, tagline, logo, favicon
   - **Theme tokens**: primary/secondary/accent colors, font family, radius — consumed as CSS variables so re-theming needs no deploy
   - Contact: phone, email, address, office hours, map embed, WhatsApp number
   - Social links
   - **Feature flags**: enable/disable blog, testimonials, specific payment methods, WhatsApp button, etc.
   - SEO defaults: title template, default meta description, OG image
   - Email templates (booking confirmation, admin notification, enquiry ack)
   - Payment config (see §8 — keys live in env, but enable/disable + display lives here)

2. **`Navigation`** — header and footer menus as data.

3. **`HomeSection` / `PageSection`** — ordered, typed content blocks rendered by a section registry. Adding a section type is a code change; arranging/editing instances is admin-only.

Provide a cached `getSettings()` accessor (`src/lib/settings.ts`) used by both server components and the theme provider. Invalidate the cache on admin save.

**Never hard-code** brand name, colors, phone number, payment toggles, nav links, or homepage layout. They all come from this layer.

---

## 7. Data models (Prisma — starting point)

Define at least these models; refine in `schema.prisma`:

`User` (role enum), `SiteSettings`, `Navigation`, `Destination` (country), `TripType`, `Package`, `ItineraryDay`, `PackageDeparture` (dates/availability), `Booking`, `Traveller`, `PaymentTransaction`, `BlogPost`, `Testimonial`, `Enquiry` (contact + propose), `Page`, `PageSection`, `HomeSection`, `LegalPage`, `MediaAsset`.

Conventions: every public-facing content model has a `slug` (unique), `status` (DRAFT/PUBLISHED), `createdAt`/`updatedAt`. Money stored as integer minor units with an explicit `currency` (default NPR). Prices and itineraries belong to the package, never to the front-end.

---

## 8. Payments

Support **eSewa, Khalti, Stripe (cards), and bank transfer**. Each gateway is a self-contained adapter in `src/lib/payments/` exposing a common interface (`initiate`, `verify`, `webhook`). Rules:

- Secret keys come from **environment variables only** — never the DB, never the client bundle.
- The admin can **enable/disable** each method and edit bank-transfer instructions via settings.
- Always **verify server-side** (signature/lookup) before marking a booking paid. Never trust client-reported success.
- On success: persist `PaymentTransaction`, update `Booking` status, send confirmation email to traveller + Vraman team.
- Test/sandbox vs production toggled by env, not code.
- Per-transaction gateway fees are the client's concern, not the app's.

I cannot help implement anything that bypasses, fakes, or evades these gateways' verification — only legitimate, documented integrations.

---

## 9. Conventions & guardrails

- **TypeScript strict**; share Zod schemas between client and server; validate all API input.
- **Server Components by default**; mark client components explicitly and keep them small.
- Public pages: prefer SSG/ISR for SEO and speed; revalidate on admin publish.
- **Performance targets** (from the brief): desktop load < 3s, mobile Lighthouse 85+. Optimize images via Cloudinary/Next Image.
- **Mobile-first** — design and test every page at mobile widths first (~70% of traffic).
- **SEO** — per-page metadata, JSON-LD for packages, sitemap, robots, GA4 + Search Console.
- **Accessibility** — semantic HTML, labelled forms, keyboard-navigable admin.
- **Security** — RBAC on every admin route and API; rate-limit public forms; sanitize rich text; never log secrets.
- **No secrets in the repo.** Use `.env`; keep `.env.example` current.
- **Errors**: user-friendly on the front end, detailed server-side logging behind the scenes.

---

## 10. Commands

```bash
npm install                 # install deps
npm run dev                 # start dev server (localhost:3000)
npm run build && npm start  # production build + serve
npx prisma migrate dev      # apply schema changes (dev)
npx prisma studio           # inspect/edit DB
npm run db:seed             # seed defaults (settings, destinations, samples)
npm run lint                # eslint
npm run typecheck           # tsc --noEmit
```

Keep these accurate as scripts are added to `package.json`.

---

## 11. Environment variables (`.env.example`)

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
CLOUDINARY_URL=
RESEND_API_KEY=
# Payments
ESEWA_MERCHANT_CODE=
ESEWA_SECRET=
KHALTI_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYMENTS_MODE=sandbox        # sandbox | production
# Analytics
NEXT_PUBLIC_GA_ID=
```

---

## 12. Definition of done (per feature)

A feature is complete only when: the public view works and is responsive; the matching **admin controls exist**; input is validated (Zod); it respects RBAC; nothing hard-codes content that should be configurable; and types pass (`npm run typecheck`).

---

## 13. Build order (suggested)

1. Project scaffold, Tailwind, shadcn/ui, Prisma, Auth.js, `SiteSettings` + theme provider.
2. Admin shell + RBAC + media library.
3. Destinations → Packages (with itinerary/gallery/pricing) end to end (public + admin).
4. Booking flow UI → one payment gateway (eSewa) → then Khalti, Stripe, bank transfer.
5. Email automation.
6. Blog, testimonials, enquiries.
7. Page/section builder, navigation, homepage editor.
8. SEO, analytics, performance pass, legal pages, 404/search.
