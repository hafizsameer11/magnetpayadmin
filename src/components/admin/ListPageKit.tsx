import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { RefreshCw, Search } from "lucide-react";
import { T } from "./AdminShell";

export type KpiItem = {
  label: string;
  value: string | number;
  tone?: string;
  delta?: string;
  Icon?: LucideIcon;
};

export function KpiStrip({ items, cols = 4 }: { items: KpiItem[]; cols?: 2 | 3 | 4 }) {
  const grid = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`grid ${grid} gap-3 mb-5`}>
      {items.map((s) => (
        <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            {s.Icon ? (
              <div className="size-7 rounded-md grid place-items-center shrink-0" style={{ background: `${s.tone ?? T.navy}14`, color: s.tone ?? T.navy }}>
                <s.Icon className="size-3.5" strokeWidth={2.4} />
              </div>
            ) : null}
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.ink }}>
              {s.label}
            </p>
          </div>
          <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
            {s.value}
          </p>
          {s.delta ? (
            <p className="mt-1 text-[10.5px]" style={{ color: T.muted }}>
              {s.delta}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export type FilterTab = { id: string; label: string; count?: number };

export function FilterTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: FilterTab[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
            style={{
              background: on ? T.navy : T.surface,
              color: on ? "#fff" : T.ink,
              border: `1px solid ${on ? T.navy : T.border}`,
            }}
          >
            {t.label}
            {t.count != null ? (
              <span className="text-[10px] tabular-nums opacity-80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ListToolbar({
  query,
  onQueryChange,
  placeholder = "Search…",
  onRefresh,
  refreshing,
  children,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  placeholder?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg flex-1 min-w-[200px] max-w-md" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Search className="size-3.5 shrink-0" style={{ color: T.muted }} />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent text-[12px] outline-none flex-1 min-w-0"
          style={{ color: T.ink }}
        />
      </div>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="h-9 px-3 rounded-lg text-[11.5px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2.2} />
          Refresh
        </button>
      ) : null}
      {children}
    </div>
  );
}

export function ListTableShell({
  columns,
  children,
  minWidth,
}: {
  columns: string[];
  children: ReactNode;
  minWidth?: number;
}) {
  const grid = columns.map((c) => c).join(" ");
  return (
    <div className="rounded-xl overflow-x-auto" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <div style={{ minWidth: minWidth ?? undefined }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: grid,
          }}
        >
          {columns.map((label, i) => (
            <span key={i} className={label.startsWith("→") ? "text-right" : ""}>
              {label.replace(/^→/, "")}
            </span>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export function ListEmpty({ message }: { message: string }) {
  return (
    <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
      {message}
    </p>
  );
}
