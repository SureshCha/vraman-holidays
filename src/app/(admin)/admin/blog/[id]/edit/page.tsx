import { connection } from "next/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BlogEditor } from "../../BlogEditor";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Blog Post</h1>
      <BlogEditor post={{ ...post, tags: post.tags as string[], excerpt: post.excerpt ?? "", coverImage: post.coverImage ?? "", metaTitle: post.metaTitle ?? "", metaDescription: post.metaDescription ?? "" }} />
    </div>
  );
}
