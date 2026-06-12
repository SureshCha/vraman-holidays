"use client";

import { useState, useTransition } from "react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { upsertHomeSection, deleteHomeSection, reorderHomeSections } from "./actions";
import { SectionType } from "@/generated/prisma/enums";

interface Section { id: string; type: SectionType; order: number; data: Record<string, unknown>; visible: boolean }

export function HomepageClient({ sections: initial }: { sections: Section[] }) {
  const [sections, setSections] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [editJson, setEditJson] = useState("");

  function handleReorder(reordered: Section[]) {
    const previous = sections;
    setSections(reordered);
    startTransition(async () => {
      const r = await reorderHomeSections(reordered.map((s) => s.id));
      if (!r.success) { setSections(previous); toast.error(r.error ?? "Reorder failed"); }
    });
  }

  function handleToggleVisibility(section: Section) {
    startTransition(async () => {
      const r = await upsertHomeSection(section.id, { type: section.type, data: section.data, visible: !section.visible });
      if (r.success) {
        setSections((p) => p.map((s) => s.id === section.id ? { ...s, visible: !s.visible } : s));
        toast.success(section.visible ? "Section hidden" : "Section visible");
      } else toast.error(r.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteHomeSection(id);
      if (r.success) { setSections((p) => p.filter((s) => s.id !== id)); toast.success("Deleted"); }
      else toast.error(r.error);
    });
  }

  function openEdit(section: Section) {
    setEditSection(section);
    setEditJson(JSON.stringify(section.data, null, 2));
  }

  function handleSaveEdit() {
    if (!editSection) return;
    let data: Record<string, unknown>;
    try { data = JSON.parse(editJson) as Record<string, unknown>; }
    catch { toast.error("Invalid JSON"); return; }

    startTransition(async () => {
      const r = await upsertHomeSection(editSection.id, { type: editSection.type, data, visible: editSection.visible });
      if (r.success) {
        setSections((p) => p.map((s) => s.id === editSection.id ? { ...s, data } : s));
        setEditSection(null);
        toast.success("Section updated");
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4 max-w-xl">
      <SortableList
        items={sections}
        onReorder={handleReorder}
        renderItem={(section) => (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{section.type}</Badge>
                {!section.visible && <Badge variant="outline" className="text-xs">Hidden</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {Object.entries(section.data).filter(([, v]) => typeof v === "string").map(([k, v]) => `${k}: ${(v as string).slice(0, 30)}`).join(" · ")}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleToggleVisibility(section)}>
              {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(section)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <ConfirmDialog
              trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0"><Trash2 className="h-3.5 w-3.5" /></Button>}
              title={`Remove ${section.type} section?`}
              onConfirm={() => handleDelete(section.id)}
            />
          </div>
        )}
      />

      {editSection && (
        <Dialog open={!!editSection} onOpenChange={(v) => !v && setEditSection(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit {editSection.type} Section</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Section Data (JSON)</Label>
                <textarea
                  value={editJson}
                  onChange={(e) => setEditJson(e.target.value)}
                  className="w-full h-48 font-mono text-xs border rounded p-2 bg-muted/30"
                />
              </div>
              <Button onClick={handleSaveEdit} disabled={isPending} className="w-full">
                {isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
