"use client";

import { useCurrency } from "@/lib/hooks/useCurrency";
import { convertPrice, formatPrice } from "@/lib/currency";

interface Props {
  amountPaisa: number;
  baseCurrency?: string;
}

export function PriceDisplay({ amountPaisa, baseCurrency = "NPR" }: Props) {
  const { currency } = useCurrency();

  const base = `${baseCurrency} ${(amountPaisa / 100).toLocaleString()}`;

  if (currency === baseCurrency || currency === "NPR") {
    return <span>{base}</span>;
  }

  const converted = convertPrice(amountPaisa, baseCurrency, currency);
  const formatted = formatPrice(converted, currency);

  return (
    <span>
      {base}{" "}
      <span className="text-xs text-muted-foreground font-normal">≈ {formatted}</span>
    </span>
  );
}
