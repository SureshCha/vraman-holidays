import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [destinations, packages, blogPosts, legalPages] = await Promise.all([
    db.destination.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.package.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.legalPage.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/signature-journeys`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/destinations`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/experiences`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/travel-trade`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/packages`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/why-nepal`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/trust-credentials`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/sustainability`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/hall-of-achievements`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/propose`, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...destinations.map((d) => ({
      url: `${baseUrl}/destinations/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...packages.map((p) => ({
      url: `${baseUrl}/packages/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...legalPages.map((l) => ({
      url: `${baseUrl}/legal/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
