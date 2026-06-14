"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { confirmBankTransfer } from "@/app/(admin)/admin/bookings/actions";

interface Props {
  bookingId: string;
}

export function BankTransferConfirm({ bookingId }: Props) {
  const [referenceNote, setReferenceNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    startTransition(async () => {
      const result = await confirmBankTransfer(bookingId, referenceNote);
      if (result.success) {
        toast.success("Bank transfer confirmed — booking is now CONFIRMED");
        setConfirmed(true);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (confirmed) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">
        Payment confirmed successfully.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 space-y-3">
      <h3 className="font-semibold text-sm">Pending Bank Transfer</h3>
      <p className="text-xs text-muted-foreground">
        Confirm once you have verified the bank transfer from the customer.
      </p>
      <div className="space-y-1">
        <Label htmlFor="ref-note" className="text-xs">Reference / Note (optional)</Label>
        <Input
          id="ref-note"
          value={referenceNote}
          onChange={(e) => setReferenceNote(e.target.value)}
          placeholder="e.g. transaction slip reference"
          className="text-sm"
        />
      </div>
      <Button onClick={handleConfirm} disabled={isPending} size="sm">
        {isPending ? "Confirming…" : "Mark as Paid"}
      </Button>
    </div>
  );
}
