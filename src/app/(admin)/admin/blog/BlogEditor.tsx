"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ContentStatus } from "@/generated/prisma/enums";
import { blogPostSchema, type BlogPostInput } from "@/lib/validators/blog";
import { createPost, updatePost } from "./actions";
import { toast } from "sonner";

interface Props {
  post?: { id: string } & BlogPostInput;
}

export function BlogEditor({ post }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!post;

  const form = useForm<BlogPostInput>({
    resolver: zodResolver(blogPostSchema) as Resolver<BlogPostInput>,
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "",
      coverImage: post?.coverImage ?? "",
      tags: post?.tags ?? [],
      metaTitle: post?.metaTitle ?? "",
      metaDescription: post?.metaDescription ?? "",
      status: post?.status ?? ContentStatus.DRAFT,
    },
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    form.setValue("title", e.target.value);
    if (!isEdit) form.setValue("slug", slugify(e.target.value, { lower: true, strict: true }));
  }

  function onSubmit(data: BlogPostInput) {
    startTransition(async () => {
      const result = isEdit ? await updatePost(post.id, data) : await createPost(data);
      if (result.success) {
        toast.success(isEdit ? "Post updated" : "Post created");
        router.push("/admin/blog");
      } else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Title *</Label><Input {...form.register("title")} onChange={handleTitleChange} /></div>
        <div className="space-y-1"><Label>Slug *</Label><Input {...form.register("slug")} /></div>
      </div>
      <div className="space-y-1"><Label>Excerpt</Label><Textarea {...form.register("excerpt")} rows={2} /></div>
      <div className="space-y-1">
        <Label>Content *</Label>
        <RichTextEditor value={form.watch("content") ?? ""} onChange={(v) => form.setValue("content", v)} />
      </div>
      <div className="space-y-1">
        <Label>Cover Image</Label>
        <div className="flex gap-2 items-center">
          <Input {...form.register("coverImage")} className="flex-1" placeholder="https://…" />
          <MediaPicker onSelect={(url) => form.setValue("coverImage", url)} trigger={<Button type="button" variant="outline" size="sm">Pick</Button>} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1"><Label>Meta Title</Label><Input {...form.register("metaTitle")} maxLength={60} /></div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={form.watch("status") ?? ContentStatus.DRAFT} onValueChange={(v) => form.setValue("status", (v ?? ContentStatus.DRAFT) as ContentStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1"><Label>Meta Description</Label><Textarea {...form.register("metaDescription")} rows={2} maxLength={160} /></div>
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : isEdit ? "Update Post" : "Create Post"}</Button>
    </form>
  );
}
