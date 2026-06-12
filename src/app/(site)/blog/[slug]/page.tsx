import { connection } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { cacheTag } from "next/cache";
import { format } from "date-fns";
import type { Metadata } from "next";

async function getPost(slug: string) {
  "use cache";
  cacheTag("blog");
  return db.blogPost.findUnique({ where: { slug, status: "PUBLISHED" } });
}

export async function generateStaticParams() {
  const posts = await db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
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
      {post.coverImage && (
        <div className="relative h-64 rounded-xl overflow-hidden mb-8">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 672px" />
        </div>
      )}
      <h1 className="text-3xl font-bold tracking-tight mb-2">{post.title}</h1>
      {post.publishedAt && <p className="text-sm text-muted-foreground mb-8">{format(post.publishedAt, "dd MMMM yyyy")}</p>}
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
    </article>
  );
}
