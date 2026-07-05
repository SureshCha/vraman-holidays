import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BlogClient } from "./BlogClient";

export default async function BlogAdminPage() {
  await connection();
  const session = await auth();
  if (!session) notFound();
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, publishedAt: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground text-sm">Write and publish travel stories.</p>
      </div>
      <BlogClient posts={posts.map((p) => ({ ...p, publishedAt: p.publishedAt?.toISOString() ?? null, createdAt: p.createdAt.toISOString() }))} />
    </div>
  );
}
