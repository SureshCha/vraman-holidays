"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "./actions";
import { format } from "date-fns";
import { ContentStatus } from "@/generated/prisma/enums";

interface PostRow { id: string; title: string; slug: string; status: ContentStatus; publishedAt: string | null; createdAt: string }

export function BlogClient({ posts: initial }: { posts: PostRow[] }) {
  const [posts, setPosts] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deletePost(id);
      if (r.success) { setPosts((p) => p.filter((x) => x.id !== id)); toast.success("Post deleted"); }
      else toast.error(r.error);
    });
  }

  const columns: ColumnDef<PostRow>[] = [
    { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="font-medium text-sm">{row.original.title}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">{row.original.status}</Badge> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-xs text-muted-foreground">{format(new Date(row.original.createdAt), "dd MMM yy")}</span> },
    {
      id: "actions", header: "", cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/admin/blog/${row.original.id}/edit`)}><Pencil className="h-3.5 w-3.5" /></Button>
          <ConfirmDialog trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} title={`Delete "${row.original.title}"?`} onConfirm={() => handleDelete(row.original.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => router.push("/admin/blog/new")}><Plus className="h-4 w-4 mr-2" />New Post</Button></div>
      <DataTable columns={columns} data={posts} searchKey="title" searchPlaceholder="Search posts…" />
    </div>
  );
}
