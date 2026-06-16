"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SortableList } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { upsertFaq, deleteFaq, reorderFaqs } from "./actions";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  visible: boolean;
}

export function FaqClient({ faqs: initial }: { faqs: FaqItem[] }) {
  const [faqs, setFaqs] = useState(initial);
  useEffect(() => setFaqs(initial), [initial]);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");

  function openCreate() {
    setEditId(null);
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setShowDialog(true);
  }

  function openEdit(faq: FaqItem) {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setShowDialog(true);
  }

  function handleSave() {
    startTransition(async () => {
      const r = await upsertFaq(editId, { question, answer, category, visible: true });
      if (r.success) {
        toast.success(editId ? "FAQ updated" : "FAQ created");
        setShowDialog(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteFaq(id);
      if (r.success) {
        setFaqs((p) => p.filter((f) => f.id !== id));
        toast.success("Deleted");
      } else toast.error(r.error);
    });
  }

  function handleReorder(reordered: FaqItem[]) {
    const previous = faqs;
    setFaqs(reordered);
    startTransition(async () => {
      const r = await reorderFaqs(reordered.map((f) => f.id));
      if (!r.success) { setFaqs(previous); toast.error(r.error ?? "Reorder failed"); }
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-sm">No FAQs yet.</p>
        </div>
      ) : (
        <SortableList
          items={faqs}
          onReorder={handleReorder}
          renderItem={(faq) => (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{faq.question}</p>
                <Badge variant="outline" className="text-xs mt-0.5">{faq.category}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(faq)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <ConfirmDialog
                trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                title="Delete this FAQ?"
                onConfirm={() => handleDelete(faq.id)}
              />
            </div>
          )}
        />
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Edit FAQ" : "Add FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Question</Label>
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Answer</Label>
              <RichTextEditor value={answer} onChange={setAnswer} placeholder="Write the answer…" />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Booking, Trekking, Visa" />
            </div>
            <Button onClick={handleSave} disabled={isPending || !question.trim()} className="w-full">
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
