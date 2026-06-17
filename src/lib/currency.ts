// Indicative exchange rates from NPR (1 NPR = X foreign currency)
// These are approximate and should be updated periodically.
export const NPR_RATES: Record<string, number> = {
  NPR: 1,
  USD: 0.0075,
  GBP: 0.006,
  AUD: 0.0116,
  EUR: 0.0069,
};

export const SUPPORTED_CURRENCIES = Object.keys(NPR_RATES);

/**
 * Convert an amount from one currency to another using NPR as the base.
 * @param amountInMinorUnits — e.g. 850000 paisa = NPR 8,500
 */
export function convertPrice(
  amountInMinorUnits: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amountInMinorUnits;
  // Convert to NPR first, then to target
  const fromRate = NPR_RATES[fromCurrency] ?? 1;
  const toRate = NPR_RATES[toCurrency] ?? 1;
  // amountInMinorUnits is in paisa (1/100 of NPR unit)
  const inNpr = amountInMinorUnits / 100 / fromRate;
  return Math.round(inNpr * toRate * 100) / 100;
}

export function formatPrice(amount: number, currency: string): string {
  if (currency === "NPR") {
    return `NPR ${Math.round(amount).toLocaleString()}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
