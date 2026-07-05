import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!checkRateLimit(`search:${clientIp(req)}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [packages, destinations, blogPosts] = await Promise.all([
    db.package.findMany({
      where: { status: "PUBLISHED", title: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { slug: true, title: true, coverImage: true },
    }),
    db.destination.findMany({
      where: { status: "PUBLISHED", name: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { slug: true, name: true },
    }),
    db.blogPost.findMany({
      where: { status: "PUBLISHED", title: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { slug: true, title: true },
    }),
  ]);

  return NextResponse.json({
    results: [
      ...packages.map((p) => ({ type: "package", slug: p.slug, title: p.title, url: `/packages/${p.slug}` })),
      ...destinations.map((d) => ({ type: "destination", slug: d.slug, title: d.name, url: `/destinations/${d.slug}` })),
      ...blogPosts.map((b) => ({ type: "blog", slug: b.slug, title: b.title, url: `/blog/${b.slug}` })),
    ],
  });
}
