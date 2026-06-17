"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCompare,
  addToCompare,
  removeFromCompare,
  isInCompare,
  clearCompare,
} from "@/lib/compare";

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  function sync() {
    setIds(getCompare().map((i) => i.id));
  }

  useEffect(() => {
    sync();
    window.addEventListener("compare-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("compare-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((id: string, title: string) => {
    const ok = addToCompare(id, title);
    sync();
    return ok;
  }, []);

  const remove = useCallback((id: string) => {
    removeFromCompare(id);
    sync();
  }, []);

  const toggle = useCallback((id: string, title: string) => {
    if (isInCompare(id)) {
      removeFromCompare(id);
    } else {
      addToCompare(id, title);
    }
    sync();
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const clear = useCallback(() => {
    clearCompare();
    sync();
  }, []);

  return { ids, add, remove, toggle, has, clear, count: ids.length };
}
