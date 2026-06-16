"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "vraman-wishlist";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("wishlist-change"));
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  // Sync on mount + listen for cross-component updates
  useEffect(() => {
    setIds(readIds());
    function onUpdate() { setIds(readIds()); }
    window.addEventListener("wishlist-change", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("wishlist-change", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const add = useCallback((id: string) => {
    const current = readIds();
    if (!current.includes(id)) writeIds([...current, id]);
    setIds(readIds());
  }, []);

  const remove = useCallback((id: string) => {
    writeIds(readIds().filter((x) => x !== id));
    setIds(readIds());
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const clear = useCallback(() => {
    writeIds([]);
    setIds([]);
  }, []);

  return { ids, count: ids.length, add, remove, has, clear };
}
