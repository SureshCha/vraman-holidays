"use client";

import { useCurrency } from "@/lib/hooks/useCurrency";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
      <SelectTrigger className="h-7 w-20 text-xs border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground hover:text-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((code) => (
          <SelectItem key={code} value={code} className="text-xs">
            {code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
