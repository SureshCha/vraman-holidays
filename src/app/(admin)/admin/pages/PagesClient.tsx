"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createPage, deletePage } from "./actions";
import type { ContentStatus } from "@/generated/prisma/enums";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  _count: { sections: number };
  updatedAt: string;
}

export function PagesClient({ pages: initial }: { pages: PageItem[] }) {
  const [pages, setPages] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  function handleTitleChange(title: string) {
    setNewTitle(title);
    setNewSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
    );
  }

  function handleCreate() {
    startTransition(async () => {
      const result = await createPage({ title: newTitle, slug: newSlug });
      if (result.success) {
        toast.success("Page created");
        setShowCreate(false);
        setNewTitle("");
        setNewSlug("");
        // Reload to get fresh data
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePage(id);
      if (result.success) {
        setPages((p) => p.filter((page) => page.id !== id));
        toast.success("Page deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Page
        </Button>
      </div>

      {pages.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-sm">No pages yet. Create your first page to get started.</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{page.title}</p>
                  <Badge
                    variant={page.status === "PUBLISHED" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {page.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  /{page.slug} &middot; {page._count.sections} section
                  {page._count.sections !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link href={`/admin/pages/${page.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                  title={`Delete "${page.title}"?`}
                  description="This will permanently delete the page and all its sections."
                  onConfirm={() => handleDelete(page.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. FAQ"
              />
            </div>
            <div className="space-y-1">
              <Label>Slug</Label>
              <Input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="e.g. faq"
              />
              <p className="text-xs text-muted-foreground">URL: /{newSlug || "..."}</p>
            </div>
            <Button onClick={handleCreate} disabled={isPending || !newTitle.trim()} className="w-full">
              {isPending ? "Creating…" : "Create Page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
