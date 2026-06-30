import Link from "next/link";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";
import { SmartMedia } from "../SmartMedia";
import { MediaBackground } from "./MediaBackground";
import { safeMediaUrl } from "@/lib/media";
import { Calendar } from "lucide-react";

interface BlogPreviewData {
  title?: string;
  subtitle?: string;
  limit?: number;
  backgroundImage?: string;
  backgroundVideo?: string;
  posterUrl?: string;
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

export async function BlogPreviewSection({ data, immersive = false }: { data: BlogPreviewData; immersive?: boolean }) {
  const limit = data.limit ?? 3;
  const posts = await getRecentPosts(limit);

  if (posts.length === 0) return null;

  const bg = safeMediaUrl(data.backgroundVideo) || safeMediaUrl(data.backgroundImage);
  const dark = !!bg || immersive;

  return (
    <section className={`relative overflow-hidden py-20 ${bg || immersive ? "" : "bg-muted/30"}`}>
      {bg && !immersive && (
        <MediaBackground
          imageUrl={data.backgroundImage}
          videoUrl={data.backgroundVideo}
          posterUrl={data.posterUrl}
          overlayClassName="bg-black/60"
        />
      )}
      <div className="relative z-10 container mx-auto px-4">
        <AnimatedSection>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
                Stories &amp; insights
              </p>
              <h2 className={`text-3xl sm:text-4xl font-semibold tracking-tight ${dark ? "text-white drop-shadow" : ""}`}>
                {data.title ?? "Travel Stories"}
              </h2>
              {data.subtitle && (
                <p className={`mt-2 ${dark ? "text-white/80" : "text-muted-foreground"}`}>{data.subtitle}</p>
              )}
            </div>
            <Link
              href="/blog"
              className={`hidden sm:inline-block text-sm font-medium hover:underline shrink-0 ${dark ? "text-white" : "text-primary"}`}
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
                    <SmartMedia
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
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
