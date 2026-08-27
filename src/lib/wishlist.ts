// Lightweight localStorage-backed wishlist for the prototype.
// Stores a snapshot of each saved product so the wishlist page can render
// without needing access to per-product data sources.

export type WishItem = {
  id: string;
  title: string;
  price: string;
  img: string;
  moq?: number;
  supplierId?: string;
};

const KEY = "mp:wishlist:v1";
const EVT = "mp:wishlist:change";

function read(): WishItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write(items: WishItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function listWishlist(): WishItem[] {
  return read();
}

export function isWished(id: string): boolean {
  return read().some((i) => i.id === id);
}

/** Toggles the item. Returns true if the item is now saved, false if removed. */
export function toggleWish(item: WishItem): boolean {
  const items = read();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    items.splice(idx, 1);
    write(items);
    return false;
  }
  items.unshift(item);
  write(items);
  return true;
}

export function removeWish(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function subscribeWishlist(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}
