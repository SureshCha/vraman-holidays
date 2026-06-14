"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { upsertTeamMember, deleteTeamMember, reorderTeamMembers } from "./actions";

interface Member {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
  order: number;
  visible: boolean;
}

export function TeamClient({ members: initial }: { members: Member[] }) {
  const [members, setMembers] = useState(initial);
  useEffect(() => setMembers(initial), [initial]);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  function openCreate() {
    setEditId(null);
    setName(""); setRole(""); setBio(""); setImageUrl("");
    setShowDialog(true);
  }

  function openEdit(m: Member) {
    setEditId(m.id);
    setName(m.name); setRole(m.role); setBio(m.bio ?? ""); setImageUrl(m.imageUrl ?? "");
    setShowDialog(true);
  }

  function handleSave() {
    startTransition(async () => {
      const r = await upsertTeamMember(editId, { name, role, bio: bio || undefined, imageUrl: imageUrl || undefined, visible: true });
      if (r.success) {
        toast.success(editId ? "Member updated" : "Member added");
        setShowDialog(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteTeamMember(id);
      if (r.success) {
        setMembers((p) => p.filter((m) => m.id !== id));
        toast.success("Removed");
      } else toast.error(r.error);
    });
  }

  function handleReorder(reordered: Member[]) {
    const previous = members;
    setMembers(reordered);
    startTransition(async () => {
      const r = await reorderTeamMembers(reordered.map((m) => m.id));
      if (!r.success) { setMembers(previous); toast.error(r.error ?? "Reorder failed"); }
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-sm">No team members yet.</p>
        </div>
      ) : (
        <SortableList
          items={members}
          onReorder={handleReorder}
          renderItem={(m) => (
            <div className="flex items-center gap-3 flex-1">
              {m.imageUrl ? (
                <Image src={m.imageUrl} alt={m.name} width={40} height={40} className="h-10 w-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{m.name[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.role}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <ConfirmDialog
                trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                title={`Remove ${m.name}?`}
                onConfirm={() => handleDelete(m.id)}
              />
            </div>
          )}
        />
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Role / Title</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Trek Guide, Operations Manager" />
            </div>
            <div className="space-y-1">
              <Label>Bio (optional)</Label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full border rounded-md p-3 text-sm resize-y" />
            </div>
            <div className="space-y-1">
              <Label>Photo</Label>
              <div className="flex items-center gap-2">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" className="flex-1" />
                <MediaPicker onSelect={(url) => setImageUrl(url)} trigger={<Button type="button" variant="outline" size="sm">Pick</Button>} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={isPending || !name.trim() || !role.trim()} className="w-full">
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
