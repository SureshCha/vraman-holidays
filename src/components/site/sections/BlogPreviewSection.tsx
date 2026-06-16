import Link from "next/link";
import Image from "next/image";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";
import { Calendar } from "lucide-react";

interface BlogPreviewData {
  title?: string;
  subtitle?: string;
  limit?: number;
}

async function getRecentPosts(limit: number) {
  "use cache";
  cacheTag("blog");
  return db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    take: limit,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
    },
  });
}

export async function BlogPreviewSection({ data }: { data: BlogPreviewData }) {
  const limit = data.limit ?? 3;
  const posts = await getRecentPosts(limit);

  if (posts.length === 0) return null;

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {data.title ?? "Travel Stories"}
              </h2>
              {data.subtitle && (
                <p className="text-muted-foreground mt-1">{data.subtitle}</p>
              )}
            </div>
            <Link
              href="/blog"
              className="text-sm font-medium text-primary hover:underline"
            >
              All posts &rarr;
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimatedSection key={post.id} delay={i * 0.08}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl overflow-hidden border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 bg-muted overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-gradient-to-br from-primary/5 to-accent/5">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-2.5">
                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="inline-block text-sm font-medium text-primary">
                    Read more &rarr;
                  </span>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
