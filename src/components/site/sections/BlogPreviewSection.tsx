import Link from "next/link";
import Image from "next/image";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { AnimatedSection } from "./AnimatedSection";

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
    <section className="bg-muted/30 py-14">
      <div className="container mx-auto px-4">
        <AnimatedSection>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{data.title ?? "Travel Stories"}</h2>
            {data.subtitle && (
              <p className="text-muted-foreground text-sm mt-1">{data.subtitle}</p>
            )}
          </div>
          <Link href="/blog" className="text-sm text-primary hover:underline">
            All posts &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow"
            >
              <div className="relative h-44 bg-muted overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                )}
                {post.publishedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
