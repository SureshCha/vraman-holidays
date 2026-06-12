"use client";

import { useState, useTransition } from "react";
import slugify from "slugify";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { createTripType, updateTripType, deleteTripType, reorderTripTypes } from "./actions";

interface TripTypeRow { id: string; name: string; slug: string; order: number }

export function TripTypesClient({ tripTypes: initial }: { tripTypes: TripTypeRow[] }) {
  const [items, setItems] = useState(initial);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await createTripType({ name: newName.trim(), slug: slugify(newName.trim(), { lower: true, strict: true }) });
      if (result.success) {
        setItems((prev) => [...prev, { id: result.data.id, name: newName.trim(), slug: slugify(newName.trim(), { lower: true, strict: true }), order: prev.length }]);
        setNewName("");
        toast.success("Trip type added");
      } else toast.error(result.error);
    });
  }

  function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    startTransition(async () => {
      const result = await updateTripType(id, { name: editName.trim(), slug: slugify(editName.trim(), { lower: true, strict: true }) });
      if (result.success) {
        setItems((prev) => prev.map((t) => t.id === id ? { ...t, name: editName.trim() } : t));
        setEditId(null);
        toast.success("Updated");
      } else toast.error(result.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTripType(id);
      if (result.success) {
        setItems((prev) => prev.filter((t) => t.id !== id));
        toast.success("Deleted");
      } else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New trip type name" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || isPending}>
          <Plus className="h-4 w-4 mr-1" />Add
        </Button>
      </div>

      <SortableList
        items={items}
        onReorder={(reordered) => { setItems(reordered); startTransition(() => reorderTripTypes(reordered.map((t) => t.id)).then()); }}
        renderItem={(t) => (
          <div className="flex items-center gap-2 flex-1">
            {editId === t.id ? (
              <>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm flex-1" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(t.id)} />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveEdit(t.id)}><Check className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{t.name}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditId(t.id); setEditName(t.name); }}><Pencil className="h-3.5 w-3.5" /></Button>
                <ConfirmDialog trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>} title={`Delete "${t.name}"?`} onConfirm={() => handleDelete(t.id)} />
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}
