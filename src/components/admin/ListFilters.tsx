import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { T } from "./AdminShell";

export type FilterOption = { value: string; label: string };

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const display = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-8 px-3 rounded-lg text-[11.5px] font-medium flex items-center gap-1.5"
        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
      >
        <span style={{ color: T.muted }}>{label}:</span>
        <span className="font-bold">{display}</span>
        <ChevronDown className="size-3" style={{ color: T.muted }} />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-30 mt-1 min-w-[140px] py-1 rounded-lg shadow-lg"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-[11.5px] font-medium hover:bg-black/[0.04]"
              style={{ color: o.value === value ? T.navy : T.ink, fontWeight: o.value === value ? 700 : 500 }}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function uniqueOptions(values: string[], allLabel = "All"): FilterOption[] {
  const uniq = [...new Set(values.filter(Boolean))].sort();
  return [{ value: "__all__", label: allLabel }, ...uniq.map((v) => ({ value: v, label: v }))];
}

export function applyAllFilter<T>(rows: T[], value: string, pick: (row: T) => string): T[] {
  if (!value || value === "__all__") return rows;
  return rows.filter((r) => pick(r) === value);
}
