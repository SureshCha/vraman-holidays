import { connection } from "next/server";
import { sanitizeHtml } from "@/lib/sanitize";
import { SmartMedia } from "@/components/site/SmartMedia";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { cacheTag } from "next/cache";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SocialShare } from "@/components/site/SocialShare";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import type { Metadata } from "next";

async function getPost(slug: string) {
  "use cache";
  cacheTag("blog");
  return db.blogPost.findUnique({ where: { slug, status: "PUBLISHED" } });
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.metaTitle ?? post.title, description: post.metaDescription ?? post.excerpt ?? undefined, openGraph: post.coverImage ? { images: [post.coverImage] } : undefined };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="container mx-auto px-4 py-12 max-w-2xl">
      <ScrollProgress />
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      {post.coverImage && (
        <div className="relative h-64 rounded-xl overflow-hidden mb-8 mt-4">
          <SmartMedia src={post.coverImage} alt={post.title} fill className="absolute inset-0 h-full w-full object-cover" priority sizes="(max-width: 768px) 100vw, 672px" />
        </div>
      )}
      <h1 className="text-3xl font-bold tracking-tight mb-2">{post.title}</h1>
      <div className="flex items-center justify-between mb-8">
        {post.publishedAt && <p className="text-sm text-muted-foreground">{format(post.publishedAt, "dd MMMM yyyy")}</p>}
        <SocialShare url={`/blog/${post.slug}`} title={post.title} />
      </div>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
    </article>
  );
}
