import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { T } from "./AdminShell";

/** Sticky action column cell for CSS grid table rows */
export function TableActionCell({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky right-0 z-[1] flex justify-end shrink-0 pl-2"
      style={{ background: T.surface }}
    >
      {children}
    </div>
  );
}

/** Sticky action column cell for HTML table rows */
export function TableActionTd({ children }: { children: ReactNode }) {
  return (
    <td className="px-2 py-3 sticky right-0 z-[1]" style={{ background: T.surface }}>
      <div className="flex justify-end shrink-0">{children}</div>
    </td>
  );
}

/** Sticky action column header for HTML tables */
export function TableActionTh() {
  return (
    <th
      className="px-2 py-2.5 w-[52px] sticky right-0 z-[1] text-right"
      style={{ background: T.bg }}
    />
  );
}

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
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const left = align === "right" ? rect.right - menuWidth : rect.left;
    const maxLeft = window.innerWidth - menuWidth - 8;
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(left, maxLeft)),
    });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu =
    open && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[200] min-w-[180px] py-1 rounded-lg shadow-lg"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              background: T.surface,
              border: `1px solid ${T.border}`,
            }}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="size-9 grid place-items-center rounded-lg shrink-0"
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
      >
        <MoreHorizontal className="size-4" strokeWidth={2.4} />
      </button>
      {menu}
    </div>
  );
}
