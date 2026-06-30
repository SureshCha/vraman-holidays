# Vraman Holidays

Marketing website **and** lightweight CMS for **Vraman Holidays Pvt. Ltd.**, a
boutique travel agency in Thamel, Kathmandu (tagline: *"Propose Your Destination"*).

It serves Nepal + international destinations with online booking, multiple payment
gateways, a blog, enquiry forms, and a full admin panel. The guiding rule of the
project: **everything on the public site is editable from the admin panel** —
content, navigation, theme, homepage layout, pricing, and payment toggles — with
no code change. See `CLAUDE.md` for the full architecture brief.

> Proprietary software — see [LICENSE](./LICENSE). Not open source.

## Tech stack

- **Next.js 16 (App Router) + React 19** — TypeScript (strict)
- **Prisma 7** + **PostgreSQL** (Neon); driver adapter chosen by `DATABASE_URL`
- **Auth.js v5** (Credentials + JWT) with role-based access (Owner / Admin / Editor)
- **Tailwind CSS** + shadcn/base-ui, **Framer Motion**
- **Cloudinary** (image + video media library), **Resend / SMTP** (email)
- **Payments:** eSewa, Khalti, Stripe, bank transfer (all verified server-side)

## Local setup

Requires **Node 22** (matches CI/production) and a PostgreSQL database (a Neon
dev branch works well). The app assumes **seeded data** — `getSettings()` throws
if `SiteSettings` has not been seeded.

```bash
npm ci
cp .env.example .env        # fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
npm run db:generate         # generate the Prisma client
npm run db:migrate          # apply migrations to your dev DB
npm run db:seed             # seed settings, destinations, sample content, admin user
npm run dev                 # http://localhost:3000
```

Default seeded admin (change after first login): `owner@vramanholidays.com` / `VramanAdmin2025!`.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build + serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` / `db:seed` / `db:generate` / `db:studio` | Prisma helpers |

## Environment

All secrets live in environment variables only (never committed). `.env.example`
documents every variable — database, auth, payments (eSewa/Khalti/Stripe),
email (SMTP/Resend), Cloudinary, and analytics — and where each should live for
local / Vercel / cPanel / GitHub Actions.

## Admin panel

`/admin` (auth-gated). Manage packages, destinations, bookings, enquiries, blog,
testimonials, media, navigation, homepage sections, legal pages, FAQs, users, and
**Settings** (brand, theme, contact, social, features, SEO, email, payments,
**footer media**). Role checks (`requireAdmin/Editor/Owner`) enforce authorization
on every admin action.

## Deployment

- **Development** → `development` branch on Vercel (Neon dev branch).
- **Production** → push the `production` branch → GitHub Actions
  (`.github/workflows/deploy-production.yml`) runs `prisma generate` → **typecheck**
  → `prisma migrate deploy` → `next build` (standalone) → force-pushes the runnable
  bundle to the `babal-deploy` branch, which **cPanel / Passenger** deploys.

Full runbook: [DEPLOYMENT.md](./DEPLOYMENT.md).

## Security

Report vulnerabilities privately — see [SECURITY.md](./SECURITY.md).
