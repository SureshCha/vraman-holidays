"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSubscriber } from "./actions";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

function exportCsv(subscribers: Subscriber[]) {
  const csv = ["Email,Subscribed Date", ...subscribers.map((s) => `${s.email},${format(new Date(s.createdAt), "yyyy-MM-dd")}`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function NewsletterClient({ subscribers: initial }: { subscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteSubscriber(id);
      if (r.success) {
        setSubscribers((p) => p.filter((s) => s.id !== id));
        toast.success("Removed");
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</Badge>
        <Button variant="outline" size="sm" onClick={() => exportCsv(subscribers)} disabled={subscribers.length === 0}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      {subscribers.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-sm">No subscribers yet.</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{s.email}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(s.createdAt), "dd MMM yyyy")}</p>
              </div>
              <ConfirmDialog
                trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>}
                title="Remove subscriber?"
                onConfirm={() => handleDelete(s.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
