"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createPromoCode, deletePromoCode } from "./actions";
import { format } from "date-fns";

interface PromoRow {
  id: string;
  code: string;
  discountPercent: number | null;
  discountFixed: number | null;
  currency: string;
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  usedCount: number;
  status: string;
}

export function PromoCodesClient({ promos: initial }: { promos: PromoRow[] }) {
  const [promos, setPromos] = useState(initial);
  useEffect(() => setPromos(initial), [initial]);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountFixed, setDiscountFixed] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxUses, setMaxUses] = useState("");

  function handleCreate() {
    startTransition(async () => {
      const result = await createPromoCode({
        code,
        discountPercent: discountPercent ? parseInt(discountPercent) : undefined,
        discountFixed: discountFixed ? parseInt(discountFixed) : undefined,
        validFrom,
        validUntil,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
      });
      if (result.success) {
        toast.success("Promo code created");
        setShowCreate(false);
        setCode(""); setDiscountPercent(""); setDiscountFixed(""); setValidFrom(""); setValidUntil(""); setMaxUses("");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePromoCode(id);
      if (result.success) {
        setPromos((p) => p.filter((x) => x.id !== id));
        toast.success("Deleted");
      } else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Promo Code
        </Button>
      </div>

      {promos.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <p className="text-sm">No promo codes yet.</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {promos.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{p.code}</span>
                  <Badge variant={p.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.discountPercent ? `${p.discountPercent}% off` : `${p.currency} ${((p.discountFixed ?? 0) / 100).toLocaleString()} off`}
                  {" · "}
                  {format(new Date(p.validFrom), "dd MMM")} — {format(new Date(p.validUntil), "dd MMM yyyy")}
                  {" · "}
                  Used: {p.usedCount}{p.maxUses ? `/${p.maxUses}` : ""}
                </p>
              </div>
              <ConfirmDialog
                trigger={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                title={`Delete "${p.code}"?`}
                onConfirm={() => handleDelete(p.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Promo Code</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SUMMER10" className="uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Discount %</Label>
                <Input type="number" value={discountPercent} onChange={(e) => { setDiscountPercent(e.target.value); setDiscountFixed(""); }} placeholder="e.g. 10" />
              </div>
              <div className="space-y-1">
                <Label>OR Fixed Amount (paisa)</Label>
                <Input type="number" value={discountFixed} onChange={(e) => { setDiscountFixed(e.target.value); setDiscountPercent(""); }} placeholder="e.g. 50000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Valid From</Label>
                <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Valid Until</Label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Max Uses (optional)</Label>
              <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Leave empty for unlimited" />
            </div>
            <Button onClick={handleCreate} disabled={isPending || !code.trim()} className="w-full">
              {isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
