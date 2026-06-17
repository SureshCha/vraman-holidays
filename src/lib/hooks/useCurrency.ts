"use client";

import { useState, useEffect } from "react";

const KEY = "vraman-currency";
const DEFAULT = "NPR";

export function useCurrency() {
  const [currency, setCurrencyState] = useState(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setCurrencyState(stored);
  }, []);

  function setCurrency(code: string) {
    localStorage.setItem(KEY, code);
    setCurrencyState(code);
    window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: code }));
  }

  return { currency, setCurrency };
}
