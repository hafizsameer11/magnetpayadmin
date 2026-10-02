import type { BadgeTone } from "@/components/admin/StatusBadge";

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, "_");
}

export function merchantStatusTone(s: string): BadgeTone {
  const v = norm(s);
  if (v === "active") return "success";
  if (v === "pending") return "warn";
  if (v === "suspended") return "danger";
  return "neutral";
}

export function tierTone(t: string): BadgeTone {
  const v = norm(t);
  if (v === "platinum") return "info";
  if (v === "gold") return "warn";
  return "success";
}

export function txStatusTone(s: string): BadgeTone {
  const v = norm(s);
  if (v === "completed") return "success";
  if (v === "pending") return "warn";
  if (v === "failed" || v === "disputed") return "danger";
  if (v === "reversed") return "info";
  return "neutral";
}

export function settlementTone(s: string): BadgeTone {
  const v = norm(s);
  if (v === "paid") return "success";
  if (v === "queued") return "warn";
  if (v === "failed") return "danger";
  return "info";
}

export function disputeTone(s: string): BadgeTone {
  const v = norm(s);
  if (v === "resolved" || v === "closed") return "success";
  if (v === "assigned") return "info";
  return "warn";
}

export function capitalize(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
