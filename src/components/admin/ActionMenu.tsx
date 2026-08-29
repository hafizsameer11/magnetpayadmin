import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { T } from "./AdminShell";

export type ActionMenuItem = {
  id: string;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function ActionMenu({
  label,
  items,
  align = "right",
}: {
  label: string;
  items: ActionMenuItem[];
  align?: "left" | "right";
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="size-9 grid place-items-center rounded-lg"
        style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.sub }}
      >
        <MoreHorizontal className="size-4" strokeWidth={2.2} />
      </button>
      {open ? (
        <div
          className={`absolute top-full z-40 mt-1 min-w-[180px] py-1 rounded-lg shadow-lg ${align === "right" ? "right-0" : "left-0"}`}
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className="w-full text-left px-3 py-2 text-[12px] font-medium disabled:opacity-40 hover:bg-black/[0.04]"
              style={{ color: item.danger ? T.danger : T.ink }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
