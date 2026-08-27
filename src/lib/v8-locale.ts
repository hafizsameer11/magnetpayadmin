// Locale / language preference for the v8 prototype.
export type V8Locale = "en" | "zh";

const KEY = "v8.locale";

export function getLocale(): V8Locale {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(KEY) === "zh" ? "zh" : "en";
}

export function setLocale(l: V8Locale) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, l);
}

export const LOCALES: Array<{
  code: V8Locale;
  flag: string;
  name: string;
  native: string;
  hint: string;
}> = [
  { code: "en", flag: "🇳🇬", name: "English", native: "English", hint: "Nigeria · default" },
  { code: "zh", flag: "🇨🇳", name: "Chinese", native: "中文 (简体)", hint: "中国 · 推荐给供应商" },
];
