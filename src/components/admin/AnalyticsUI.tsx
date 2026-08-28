import { T } from "./AdminShell";
import type { ReactNode } from "react";

export type SeriesPoint = { d: string; v: number; v2?: number; v3?: number };

export function KPI({
  label,
  value,
  delta,
  tone = "default",
  mono = true,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "success" | "warn" | "danger" | "info";
  mono?: boolean;
}) {
  const c =
    tone === "success" ? T.success :
    tone === "warn" ? T.warn :
    tone === "danger" ? T.danger :
    tone === "info" ? T.info : T.ink;
  return (
    <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>{label}</p>
      <p
        className="mt-1.5 text-[20px] font-bold tabular-nums"
        style={{ color: T.ink, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}
      >
        {value}
      </p>
      {delta ? (
        <p className="mt-0.5 text-[11px] font-bold tabular-nums" style={{ color: c, fontFamily: "'JetBrains Mono', monospace" }}>
          {delta}
        </p>
      ) : null}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <header className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div>
          <p className="text-[12px] font-bold">{title}</p>
          {subtitle ? <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
