"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { reVerifyIpsPayment, manualConfirmPayment } from "@/app/(admin)/admin/bookings/actions";

interface Props {
  transactionId: string;
}

export function IpsPaymentActions({ transactionId }: Props) {
  const router = useRouter();
  const [verifyPending, startVerify] = useTransition();
  const [manualPending, startManual] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  function handleReVerify() {
    startVerify(async () => {
      const result = await reVerifyIpsPayment(transactionId);
      if (result.success) {
        toast.success(`connectIPS responded: payment is ${result.data.status}`);
        setDone(true);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleManualConfirm() {
    startManual(async () => {
      const result = await manualConfirmPayment(transactionId);
      if (result.success) {
        toast.success("Payment manually confirmed — booking is now CONFIRMED");
        setDone(true);
        router.refresh();
      } else {
        toast.error(result.error);
        setShowConfirm(false);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">
        Payment status updated successfully.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 space-y-3">
      <h3 className="font-semibold text-sm">Pending connectIPS Payment</h3>
      <p className="text-xs text-muted-foreground">
        The customer may have completed payment but the callback was not received.
        Re-verify to check the status directly with connectIPS.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={handleReVerify}
          disabled={verifyPending || manualPending}
        >
          {verifyPending ? "Checking…" : "Re-verify with connectIPS"}
        </Button>

        {!showConfirm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm(true)}
            disabled={verifyPending || manualPending}
          >
            Manual Confirm
          </Button>
        )}
      </div>

      {showConfirm && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 space-y-2">
          <p className="text-xs text-destructive font-medium">
            This marks the payment as paid without contacting connectIPS. Only use
            if re-verify is unavailable and you have confirmed receipt independently.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleManualConfirm}
              disabled={manualPending}
            >
              {manualPending ? "Confirming…" : "Confirm anyway"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              disabled={manualPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
