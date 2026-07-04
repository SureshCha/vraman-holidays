import { connection } from "next/server";
import { SmartMedia } from "@/components/site/SmartMedia";
import { AnimatedSection } from "@/components/site/sections/AnimatedSection";
import Link from "next/link";
import { db } from "@/lib/db";
import { cacheTag } from "next/cache";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

async function getPosts() {
  "use cache";
  cacheTag("blog");
  return db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true, tags: true },
  });
}

export default async function BlogPage() {
  await connection();
  const posts = await getPosts();

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Travel Stories</h1>
      <p className="text-muted-foreground mb-8">Inspiration and tips from the road.</p>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 0.06}>
            <Link href={`/blog/${post.slug}`} className="group block rounded-xl overflow-hidden border hover:shadow-md transition-shadow">
              <div className="relative h-44 bg-muted overflow-hidden">
                {post.coverImage ? <SmartMedia src={post.coverImage} alt={post.title} fill className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>}
              </div>
              <div className="p-4 space-y-2">
                <p className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{post.title}</p>
                {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                {post.publishedAt && <p className="text-xs text-muted-foreground">{format(post.publishedAt, "dd MMM yyyy")}</p>}
              </div>
            </Link>
            </AnimatedSection>
          ))}
        </div>
      )}
    </main>
  );
}
