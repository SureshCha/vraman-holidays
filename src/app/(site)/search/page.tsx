import { connection } from "next/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search Results" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await connection();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-2">Enter a search term to find packages, destinations, or blog posts.</p>
      </main>
    );
  }

  const [packages, destinations, posts] = await Promise.all([
    db.package.findMany({ where: { status: "PUBLISHED", title: { contains: query, mode: "insensitive" } }, take: 10, select: { slug: true, title: true, durationDays: true, priceFrom: true, currency: true } }),
    db.destination.findMany({ where: { status: "PUBLISHED", name: { contains: query, mode: "insensitive" } }, take: 5, select: { slug: true, name: true } }),
    db.blogPost.findMany({ where: { status: "PUBLISHED", title: { contains: query, mode: "insensitive" } }, take: 5, select: { slug: true, title: true } }),
  ]);

  const total = packages.length + destinations.length + posts.length;

  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-2xl font-bold">Search: &ldquo;{query}&rdquo;</h1>
      <p className="text-muted-foreground mt-1 mb-6">{total} result{total !== 1 ? "s" : ""}</p>

      {destinations.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-sm mb-3">Destinations</h2>
          <ul className="space-y-2">{destinations.map((d) => (
            <li key={d.slug}><Link href={`/destinations/${d.slug}`} className="text-primary hover:underline text-sm">{d.name}</Link></li>
          ))}</ul>
        </section>
      )}

      {packages.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-sm mb-3">Packages</h2>
          <ul className="space-y-3">{packages.map((p) => (
            <li key={p.slug} className="flex justify-between items-center">
              <Link href={`/packages/${p.slug}`} className="text-primary hover:underline text-sm">{p.title}</Link>
              <Badge variant="secondary" className="text-xs">{p.currency} {(p.priceFrom / 100).toLocaleString()}</Badge>
            </li>
          ))}</ul>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-sm mb-3">Blog</h2>
          <ul className="space-y-2">{posts.map((b) => (
            <li key={b.slug}><Link href={`/blog/${b.slug}`} className="text-primary hover:underline text-sm">{b.title}</Link></li>
          ))}</ul>
        </section>
      )}

      {total === 0 && <p className="text-muted-foreground">No results found. Try a different search term.</p>}
    </main>
  );
}
