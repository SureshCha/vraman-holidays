const KEY = "vraman-compare";
const MAX = 3;

interface CompareItem {
  id: string;
  title: string;
}

function dispatch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("compare-change"));
  }
}

export function getCompare(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as CompareItem[];
  } catch {
    return [];
  }
}

function save(items: CompareItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  dispatch();
}

export function addToCompare(id: string, title: string): boolean {
  const items = getCompare();
  if (items.some((i) => i.id === id)) return true;
  if (items.length >= MAX) return false;
  save([...items, { id, title }]);
  return true;
}

export function removeFromCompare(id: string) {
  save(getCompare().filter((i) => i.id !== id));
}

export function isInCompare(id: string): boolean {
  return getCompare().some((i) => i.id === id);
}

export function clearCompare() {
  save([]);
}
