"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_VARIANTS } from "@/lib/invoice-utils";
import type { InvoiceStatus } from "@/generated/prisma/client";

interface Props {
  value: InvoiceStatus;
  onValueChange: (v: InvoiceStatus) => void;
  disabled?: boolean;
  triggerClassName?: string;
}

export function InvoiceStatusSelect({ value, onValueChange, disabled, triggerClassName }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as InvoiceStatus)} disabled={disabled}>
      <SelectTrigger className={triggerClassName ?? "h-8 w-36 text-xs"}>
        <SelectValue>
          <Badge variant={STATUS_VARIANTS[value] as Parameters<typeof Badge>[0]["variant"]}>
            {value}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DRAFT">Draft</SelectItem>
        <SelectItem value="SENT">Sent</SelectItem>
        <SelectItem value="PAID">Paid</SelectItem>
        <SelectItem value="CANCELLED">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}
