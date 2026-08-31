"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { InvoiceStatusSelect } from "@/components/admin/InvoiceStatusSelect";
import { updateInvoiceStatus, sendInvoiceEmail } from "../actions";
import type { InvoiceStatus } from "@/generated/prisma/client";

interface Props {
  invoiceId: string;
  status: InvoiceStatus;
  hasEmail: boolean;
}

export function InvoiceDetailActions({ invoiceId, status, hasEmail }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(next: InvoiceStatus) {
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoiceId, next);
      if (!result.success) toast.error(result.error);
    });
  }

  function handleSend() {
    startTransition(async () => {
      const result = await sendInvoiceEmail(invoiceId);
      if (result.success) {
        toast.success("Invoice emailed to client");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      {hasEmail && status !== "PAID" && status !== "CANCELLED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSend}
          disabled={isPending}
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {isPending ? "Sending…" : "Send Invoice"}
        </Button>
      )}
      <InvoiceStatusSelect
        value={status}
        onValueChange={handleStatusChange}
        disabled={isPending}
      />
    </>
  );
}
