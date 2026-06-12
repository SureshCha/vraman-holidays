"use client";

import { useState, useTransition } from "react";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { upsertNavItem, deleteNavItem, reorderNavItems } from "./actions";

interface NavItem { id: string; label: string; href: string; location: string; order: number; openInNew: boolean }

export function NavigationClient({ items: initial }: { items: NavItem[] }) {
  const [items, setItems] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [editItem, setEditItem] = useState<NavItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ label: "", href: "", location: "header", openInNew: false });
  const [filterLoc, setFilterLoc] = useState<string>("header");

  const filtered = items.filter((i) => i.location === filterLoc);

  function openAdd() { setEditItem(null); setFormData({ label: "", href: "", location: filterLoc, openInNew: false }); setDialogOpen(true); }
  function openEdit(item: NavItem) { setEditItem(item); setFormData({ label: item.label, href: item.href, location: item.location, openInNew: item.openInNew }); setDialogOpen(true); }

  function handleSave() {
    startTransition(async () => {
      const r = await upsertNavItem(editItem?.id ?? null, { ...formData, order: editItem?.order ?? items.length });
      if (r.success) {
        if (editItem) {
          setItems((p) => p.map((i) => i.id === editItem.id ? { ...i, ...formData } : i));
        } else {
          setItems((p) => [...p, { id: r.data.id, ...formData, order: p.length }]);
        }
        setDialogOpen(false);
        toast.success("Saved");
      } else toast.error(r.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteNavItem(id);
      if (r.success) { setItems((p) => p.filter((i) => i.id !== id)); toast.success("Deleted"); }
      else toast.error(r.error);
    });
  }

  function handleReorder(reordered: NavItem[]) {
    const allOther = items.filter((i) => i.location !== filterLoc);
    setItems([...allOther, ...reordered]);
    startTransition(() => reorderNavItems(reordered.map((i) => i.id)).then());
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <Select value={filterLoc} onValueChange={(v) => v && setFilterLoc(v ?? "header")}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="header">Header</SelectItem>
            <SelectItem value="footer">Footer</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Link</Button>
      </div>

      <SortableList
        items={filtered}
        onReorder={handleReorder}
        renderItem={(item) => (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground truncate">{item.href}</p>
            </div>
            {item.openInNew && <Badge variant="secondary" className="text-xs shrink-0">New tab</Badge>}
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
            <ConfirmDialog trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0"><Trash2 className="h-3.5 w-3.5" /></Button>} title={`Delete "${item.label}"?`} onConfirm={() => handleDelete(item.id)} />
          </div>
        )}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Link" : "Add Link"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Label</Label><Input value={formData.label} onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))} /></div>
            <div className="space-y-1"><Label>URL</Label><Input value={formData.href} onChange={(e) => setFormData((p) => ({ ...p, href: e.target.value }))} placeholder="/destinations" /></div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Select value={formData.location} onValueChange={(v) => v && setFormData((p) => ({ ...p, location: v ?? "header" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={formData.openInNew} onCheckedChange={(v) => setFormData((p) => ({ ...p, openInNew: !!v }))} />
              <span className="text-sm">Open in new tab</span>
            </label>
            <Button onClick={handleSave} disabled={isPending} className="w-full">{isPending ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
