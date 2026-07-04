import { connection } from "next/server";
import { SmartMedia } from "@/components/site/SmartMedia";
import { sanitizeHtml } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ItineraryAccordion } from "@/components/site/ItineraryAccordion";
import { PackageGallery } from "@/components/site/PackageGallery";
import { DeparturePicker } from "@/components/site/DeparturePicker";
import { TrustBadges } from "@/components/site/TrustBadges";
import { RouteMap } from "@/components/site/RouteMap";
import { Star, Quote } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SocialShare } from "@/components/site/SocialShare";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { RelatedPackages } from "@/components/site/RelatedPackages";
import { cacheTag } from "next/cache";
import { Clock, MapPin, CheckCircle2, XCircle } from "lucide-react";
import type { Metadata } from "next";

async function getPackage(slug: string) {
  "use cache";
  cacheTag("packages");
  return db.package.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      destination: { select: { id: true, name: true, slug: true } },
      tripTypes: { select: { name: true } },
      itinerary: { orderBy: { dayNumber: "asc" } },
      departures: { orderBy: { departureDate: "asc" } },
      testimonials: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, location: true, rating: true, content: true },
      },
    },
  });
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) return {};
  return {
    title: pkg.metaTitle ?? pkg.title,
    description: pkg.metaDescription ?? pkg.description ?? undefined,
    openGraph: pkg.coverImage ? { images: [pkg.coverImage] } : undefined,
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) notFound();

  const highlights = (pkg.highlights as string[] | null) ?? [];
  const inclusions = (pkg.inclusions as string[] | null) ?? [];
  const exclusions = (pkg.exclusions as string[] | null) ?? [];
  const galleryImages = (pkg.galleryImages as string[] | null) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: pkg.description ?? undefined,
    touristType: pkg.tripTypes.map((t) => t.name),
    offers: {
      "@type": "Offer",
      price: pkg.priceFrom / 100,
      priceCurrency: pkg.currency,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main>
        <ScrollProgress />
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-3">
          <Breadcrumbs items={[
            { label: "Destinations", href: "/destinations" },
            { label: pkg.destination.name, href: `/destinations/${pkg.destination.slug}` },
            { label: pkg.title },
          ]} />
        </div>

        {/* Hero */}
        <div className="relative h-72 md:h-96 bg-muted overflow-hidden">
          {pkg.coverImage ? (
            <SmartMedia src={pkg.coverImage} alt={pkg.title} fill className="absolute inset-0 h-full w-full object-cover" priority sizes="100vw" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="container mx-auto px-4 pb-8">
              <div className="flex flex-wrap gap-2 mb-2">
                {pkg.tripTypes.map((t) => <Badge key={t.name} variant="secondary" className="bg-white/20 text-white border-0 text-xs">{t.name}</Badge>)}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">{pkg.title}</h1>
              {pkg.subtitle && <p className="text-white/80 mt-1 text-sm">{pkg.subtitle}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-white/80 text-sm">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{pkg.destination.name}</span>
                {pkg.departureCity && (
                  <span className="flex items-center gap-1">✈ Departs from {pkg.departureCity}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                <span className="font-bold text-white text-lg">{pkg.currency} {(pkg.priceFrom / 100).toLocaleString()}</span>
              </div>
              {(pkg.priceBasis || pkg.minGroupSize || pkg.validUntil) && (
                <div className="flex flex-wrap items-center gap-3 mt-2 text-white/70 text-xs">
                  {pkg.priceBasis && <span>{pkg.priceBasis}</span>}
                  {pkg.minGroupSize && <span>· Min {pkg.minGroupSize} adults</span>}
                  {pkg.validUntil && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      Valid until {new Date(pkg.validUntil).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {/* Social Share */}
          <div className="mb-6">
            <SocialShare url={`/packages/${pkg.slug}`} title={pkg.title} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Overview */}
              {(pkg.description || highlights.length > 0) && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold">Overview</h2>
                  {pkg.description && <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(pkg.description) }} />}
                  {highlights.length > 0 && (
                    <ul className="space-y-1">
                      {highlights.map((h, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{h}</li>)}
                    </ul>
                  )}
                </section>
              )}

              {/* Route Map */}
              {(() => {
                const mapPoints = pkg.itinerary
                  .filter((d) => d.latitude != null && d.longitude != null)
                  .map((d) => ({ dayNumber: d.dayNumber, title: d.title, latitude: d.latitude!, longitude: d.longitude!, elevation: d.elevation }));
                return mapPoints.length >= 2 ? <RouteMap points={mapPoints} packageTitle={pkg.title} /> : null;
              })()}

              {/* Itinerary */}
              {pkg.itinerary.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold">Day-by-Day Itinerary</h2>
                  <ItineraryAccordion days={pkg.itinerary.map((d) => ({
                    ...d,
                    images: (d.images as string[]) ?? [],
                    meals: d.meals as { breakfast: boolean; lunch: boolean; dinner: boolean } | null,
                  }))} />
                </section>
              )}

              {/* Inclusions / Exclusions */}
              {(inclusions.length > 0 || exclusions.length > 0) && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold">Inclusions & Exclusions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {inclusions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2 text-green-700">Included</h3>
                        <ul className="space-y-1">{inclusions.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{item}</li>)}</ul>
                      </div>
                    )}
                    {exclusions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2 text-red-700">Not Included</h3>
                        <ul className="space-y-1">{exclusions.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />{item}</li>)}</ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Terms & Conditions */}
              {pkg.terms && (
                <section className="space-y-4">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer">
                      <h2 className="text-xl font-bold">Important Terms & Conditions</h2>
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-lg">&#9662;</span>
                    </summary>
                    <div className="prose prose-sm max-w-none mt-3 text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(pkg.terms) }} />
                  </details>
                </section>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold">Photo Gallery</h2>
                  <PackageGallery images={galleryImages} />
                </section>
              )}

              {/* Reviews */}
              {pkg.testimonials && pkg.testimonials.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-bold">Traveller Reviews</h2>
                  <div className="space-y-4">
                    {pkg.testimonials.map((t: { id: string; name: string; location?: string | null; rating: number; content: string }) => (
                      <div key={t.id} className="rounded-2xl border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                            {t.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{t.name}</p>
                            {t.location && <p className="text-xs text-muted-foreground">{t.location}</p>}
                          </div>
                          <div className="ml-auto flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Quote className="h-4 w-4 text-primary/20 shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground leading-relaxed">{t.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Packages */}
              <RelatedPackages destinationId={pkg.destination.id} currentPackageId={pkg.id} />
            </div>

            {/* Sidebar: Departure picker */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DeparturePicker
                  departures={pkg.departures.map((d) => ({
                    id: d.id,
                    departureDate: d.departureDate.toISOString(),
                    returnDate: d.returnDate.toISOString(),
                    maxSeats: d.maxSeats,
                    bookedSeats: d.bookedSeats,
                    priceOverride: d.priceOverride,
                    currency: d.currency,
                    basePrice: pkg.priceFrom,
                  }))}
                  packageId={pkg.id}
                  currency={pkg.currency}
                  basePrice={pkg.priceFrom}
                />
                <div className="mt-6">
                  <TrustBadges compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
