"use client";

import { useState, useTransition } from "react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { toast } from "sonner";
import { SectionFieldEditor } from "@/components/admin/SectionFieldEditor";
import {
  updatePage,
  upsertPageSection,
  deletePageSection,
  reorderPageSections,
} from "../actions";
import { SectionType, ContentStatus } from "@/generated/prisma/enums";

interface Section {
  id: string;
  type: SectionType;
  order: number;
  data: Record<string, unknown>;
  visible: boolean;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface Props {
  page: PageData;
  sections: Section[];
}

const SECTION_TYPES = Object.values(SectionType);

export function PageEditor({ page, sections: initialSections }: Props) {
  const [isPending, startTransition] = useTransition();

  // Page settings state
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState<ContentStatus>(page.status);
  const [metaTitle, setMetaTitle] = useState(page.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    page.metaDescription ?? ""
  );

  // Sections state
  const [sections, setSections] = useState(initialSections);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});

  // Add section state
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState<SectionType>(
    SectionType.RICH_TEXT
  );

  function handleSavePage() {
    startTransition(async () => {
      const result = await updatePage(page.id, {
        title,
        slug,
        status,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      });
      if (result.success) toast.success("Page settings saved");
      else toast.error(result.error);
    });
  }

  function handleReorder(reordered: Section[]) {
    const previous = sections;
    setSections(reordered);
    startTransition(async () => {
      const r = await reorderPageSections(
        page.id,
        reordered.map((s) => s.id)
      );
      if (!r.success) {
        setSections(previous);
        toast.error(r.error ?? "Reorder failed");
      }
    });
  }

  function handleToggleVisibility(section: Section) {
    startTransition(async () => {
      const r = await upsertPageSection(page.id, section.id, {
        type: section.type,
        data: section.data,
        visible: !section.visible,
      });
      if (r.success) {
        setSections((p) =>
          p.map((s) =>
            s.id === section.id ? { ...s, visible: !s.visible } : s
          )
        );
        toast.success(section.visible ? "Section hidden" : "Section visible");
      } else toast.error(r.error);
    });
  }

  function openEdit(section: Section) {
    setEditSection(section);
    setEditData(section.data as Record<string, unknown>);
  }

  function handleSaveEdit() {
    if (!editSection) return;
    startTransition(async () => {
      const r = await upsertPageSection(page.id, editSection.id, {
        type: editSection.type,
        data: editData,
        visible: editSection.visible,
      });
      if (r.success) {
        setSections((p) =>
          p.map((s) => (s.id === editSection.id ? { ...s, data: editData } : s))
        );
        setEditSection(null);
        toast.success("Section updated");
      } else toast.error(r.error);
    });
  }

  function handleDeleteSection(id: string) {
    startTransition(async () => {
      const r = await deletePageSection(id);
      if (r.success) {
        setSections((p) => p.filter((s) => s.id !== id));
        toast.success("Section deleted");
      } else toast.error(r.error);
    });
  }

  function handleAddSection() {
    startTransition(async () => {
      const r = await upsertPageSection(page.id, null, {
        type: newSectionType,
        data: {},
        visible: true,
      });
      if (r.success) {
        setSections((p) => [
          ...p,
          {
            id: r.data.id,
            type: newSectionType,
            order: p.length,
            data: {},
            visible: true,
          },
        ]);
        setShowAddSection(false);
        toast.success("Section added — click the pencil icon to edit its content");
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page Settings */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm">Page Settings</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as ContentStatus)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Meta Title (optional)</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO title"
            />
          </div>
          <div className="space-y-1">
            <Label>Meta Description (optional)</Label>
            <Input
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO description"
            />
          </div>
        </div>
        <Button onClick={handleSavePage} disabled={isPending} size="sm">
          {isPending ? "Saving…" : "Save Page Settings"}
        </Button>
      </section>

      {/* Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Sections</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddSection(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p className="text-sm">No sections yet. Add one to get started.</p>
          </div>
        ) : (
          <SortableList
            items={sections}
            onReorder={handleReorder}
            renderItem={(section) => (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {section.type}
                    </Badge>
                    {!section.visible && (
                      <Badge variant="outline" className="text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {Object.entries(section.data)
                      .filter(([, v]) => typeof v === "string")
                      .map(
                        ([k, v]) =>
                          `${k}: ${(v as string).slice(0, 30)}`
                      )
                      .join(" · ") || "Empty — click edit to add content"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleToggleVisibility(section)}
                >
                  {section.visible ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => openEdit(section)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  }
                  title={`Remove ${section.type} section?`}
                  onConfirm={() => handleDeleteSection(section.id)}
                />
              </div>
            )}
          />
        )}
      </section>

      {/* Edit Section Dialog */}
      {editSection && (
        <Dialog
          open={!!editSection}
          onOpenChange={(v) => !v && setEditSection(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit {editSection.type} Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <SectionFieldEditor
                type={editSection.type}
                data={editData}
                onChange={setEditData}
              />
            </div>
            <Button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="w-full mt-3"
            >
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Section Dialog */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Section Type</Label>
              <Select
                value={newSectionType}
                onValueChange={(v) => setNewSectionType(v as SectionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddSection}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? "Adding…" : "Add Section"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
