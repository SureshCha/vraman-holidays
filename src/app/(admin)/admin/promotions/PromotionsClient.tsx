"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { upsertPromoPopup, deletePromoPopup, reorderPromoPopups } from "./actions";
import { SortableList } from "@/components/admin/SortableList";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import Image from "next/image";

interface Popup {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
  visible: boolean;
  startDate: string;
  endDate: string;
  order: number;
}

const emptyPopup: Omit<Popup, "id" | "order"> = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  alt: "",
  visible: true,
  startDate: "",
  endDate: "",
};

export function PromotionsClient({ popups: initial }: { popups: Popup[] }) {
  const [popups, setPopups] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPopup);

  function openCreate() {
    setEditId(null);
    setForm(emptyPopup);
    setDialogOpen(true);
  }

  function openEdit(popup: Popup) {
    setEditId(popup.id);
    setForm({
      title: popup.title,
      imageUrl: popup.imageUrl,
      linkUrl: popup.linkUrl,
      alt: popup.alt,
      visible: popup.visible,
      startDate: popup.startDate,
      endDate: popup.endDate,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await upsertPromoPopup(editId, form);
      if (result.success) {
        if (editId) {
          setPopups((prev) => prev.map((p) => (p.id === editId ? { ...p, ...form } : p)));
        } else {
          setPopups((prev) => [...prev, { id: result.data.id, ...form, order: prev.length }]);
        }
        setDialogOpen(false);
        toast.success(editId ? "Popup updated" : "Popup created");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePromoPopup(id);
      setPopups((prev) => prev.filter((p) => p.id !== id));
      toast.success("Popup removed");
    });
  }

  function handleReorder(reordered: Popup[]) {
    const previous = popups;
    setPopups(reordered);
    startTransition(async () => {
      const result = await reorderPromoPopups(reordered.map((p) => p.id));
      if (!result.success) {
        setPopups(previous);
        toast.error("Failed to reorder");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={openCreate} size="sm">
        <Plus className="h-4 w-4 mr-2" />Add Popup
      </Button>

      {popups.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No promotional popups yet. Create one to start showing offers to visitors.</p>
      )}

      <SortableList
        items={popups}
        onReorder={handleReorder}
        renderItem={(popup) => (
          <Card className="flex-1">
            <CardContent className="flex items-center gap-4 py-3">
              {popup.imageUrl ? (
                <div className="relative h-16 w-24 rounded overflow-hidden bg-muted shrink-0">
                  <Image src={popup.imageUrl} alt={popup.alt || popup.title} fill className="object-cover" sizes="96px" />
                </div>
              ) : (
                <div className="h-16 w-24 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs shrink-0">No image</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{popup.title}</p>
                  {popup.visible ? (
                    <Eye className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />{popup.linkUrl}
                </p>
                {(popup.startDate || popup.endDate) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {popup.startDate && `From ${popup.startDate}`}
                    {popup.startDate && popup.endDate && " "}
                    {popup.endDate && `Until ${popup.endDate}`}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(popup)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <ConfirmDialog
                  trigger={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                  title={`Delete "${popup.title}"?`}
                  onConfirm={() => handleDelete(popup.id)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Popup" : "New Popup"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Thailand Tour Offer" />
            </div>

            <div className="space-y-1">
              <Label>Image *</Label>
              <div className="flex gap-2 items-center">
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Image URL" className="flex-1 text-sm" />
                <MediaPicker accept="image" onSelect={(url) => setForm({ ...form, imageUrl: url })} trigger={<Button type="button" variant="outline" size="sm">Pick</Button>} />
              </div>
              {form.imageUrl && (
                <div className="relative h-40 rounded overflow-hidden bg-muted mt-2">
                  <Image src={form.imageUrl} alt={form.alt || form.title} fill className="object-contain" sizes="400px" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Link URL *</Label>
              <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="e.g. /packages/thailand-4n5d" />
            </div>

            <div className="space-y-1">
              <Label>Alt Text</Label>
              <Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Image description for accessibility" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="popup-visible"
                checked={form.visible}
                onCheckedChange={(v) => setForm({ ...form, visible: !!v })}
              />
              <Label htmlFor="popup-visible">Visible to visitors</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
