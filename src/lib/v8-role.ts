// Lightweight role storage for the v8 prototype flow.
// Buyer = Nigerian importer. Seller = Chinese supplier. Both = trades in both directions.
export type V8Role = "buyer" | "seller" | "both";

const KEY = "v8.role";

export function getRole(): V8Role {
  if (typeof window === "undefined") return "buyer";
  const v = window.localStorage.getItem(KEY);
  if (v === "seller") return "seller";
  if (v === "both") return "both";
  return "buyer";
}

export function setRole(r: V8Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, r);
}

export const ROLE_META = {
  buyer: {
    label: "Buyer",
    country: { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigeria", currency: "NGN" },
    placeholder: "812 345 6789",
  },
  seller: {
    label: "Seller",
    country: { code: "CN", dial: "+86", flag: "🇨🇳", name: "China", currency: "CNY" },
    placeholder: "138 0013 8000",
  },
  both: {
    label: "Buyer + Seller",
    country: { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigeria", currency: "NGN" },
    placeholder: "812 345 6789",
  },
} as const;
