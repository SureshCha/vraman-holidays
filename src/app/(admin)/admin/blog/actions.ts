"use server";

import { requireEditor, requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { blogPostSchema } from "@/lib/validators/blog";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

export async function createPost(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireEditor();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const existing = await db.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, error: "Slug already in use" };

  const post = await db.blogPost.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidateTag("blog", "max");
  revalidatePath("/blog");
  return { success: true, data: { id: post.id } };
}

export async function updatePost(id: string, input: unknown): Promise<ActionResult> {
  if (!(await requireEditor())) return { success: false, error: "Unauthorized" };

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Not found" };

  const wasPublished = post.status === "PUBLISHED";
  const isNowPublished = parsed.data.status === "PUBLISHED";

  await db.blogPost.update({
    where: { id },
    data: {
      ...parsed.data,
      publishedAt: !wasPublished && isNowPublished ? new Date() : post.publishedAt,
    },
  });

  revalidateTag("blog", "max");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  return { success: true, data: undefined };
}

export async function deletePost(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  await db.blogPost.delete({ where: { id } });
  revalidateTag("blog", "max");
  revalidatePath("/blog");
  return { success: true, data: undefined };
}
