import type { ReactNode } from "react";
import { T } from "./AdminShell";

export type BadgeTone = "success" | "warn" | "danger" | "info" | "neutral";

const TONE_COLOR: Record<BadgeTone, string> = {
  success: T.success,
  warn: T.warn,
  danger: T.danger,
  info: T.info,
  neutral: T.sub,
};

export function formatStatusLabel(raw: string) {
  const t = raw.trim();
  if (!t) return "—";
  if (t.length <= 4 && t === t.toUpperCase()) return t;
  return t
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function toneFromStatus(raw: string): BadgeTone {
  const s = raw.toUpperCase();
  if (["COMPLETED", "SUCCESS", "SUCCEEDED", "SETTLED", "APPROVED", "ACTIVE", "VERIFIED", "DELIVERED", "RELEASED", "PAID", "FUNDED"].some((k) => s.includes(k))) {
    return "success";
  }
  if (["PENDING", "PROCESSING", "OPEN", "DRAFT", "SUBMITTED", "REVIEW", "IN_TRANSIT", "CUSTOMS"].some((k) => s.includes(k))) {
    return "warn";
  }
  if (["FAILED", "REJECTED", "CANCELLED", "CANCELED", "BLOCKED", "DISPUTED", "EXPIRED"].some((k) => s.includes(k))) {
    return "danger";
  }
  if (["NEW", "INFO", "INVESTIGATING"].some((k) => s.includes(k))) {
    return "info";
  }
  return "neutral";
}

/** Compact pill that hugs label text — safe inside CSS grid/table cells. */
export function StatusBadge({
  tone,
  children,
  dot = true,
  className = "",
}: {
  tone: BadgeTone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const c = TONE_COLOR[tone];
  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none whitespace-nowrap justify-self-start self-center ${className}`}
      style={{ background: `${c}12`, color: c, border: `1px solid ${c}24` }}
    >
      {dot ? <span className="size-1.5 shrink-0 rounded-full" style={{ background: c }} aria-hidden /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function StatusBadgeCustom({ color, label, dot = true }: { color: string; label: string; dot?: boolean }) {
  return (
    <span
      className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold leading-none whitespace-nowrap justify-self-start self-center"
      style={{ background: `${color}12`, color, border: `1px solid ${color}24` }}
    >
      {dot ? <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

export function StatusBadgeFromRaw({ status, dot = true }: { status: string; dot?: boolean }) {
  return <StatusBadge tone={toneFromStatus(status)} dot={dot}>{formatStatusLabel(status)}</StatusBadge>;
}

/** Wrap grid/table status cells so badges never stretch column width. */
export function StatusCell({ children }: { children: ReactNode }) {
  return <span className="inline-flex w-fit max-w-full items-center justify-self-start self-center">{children}</span>;
}
