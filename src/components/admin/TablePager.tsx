import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { T } from "./AdminShell";

const DEFAULT_SIZE = 20;

export function useTablePage<T>(rows: T[], pageSize = DEFAULT_SIZE) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    if (page > pageCount - 1) setPage(Math.max(0, pageCount - 1));
  }, [rows.length, page, pageCount]);

  const slice = useMemo(
    () => rows.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [rows, safePage, pageSize],
  );

  return {
    page: safePage,
    setPage,
    pageCount,
    slice,
    total: rows.length,
    pageSize,
    from: rows.length ? safePage * pageSize + 1 : 0,
    to: Math.min(rows.length, safePage * pageSize + slice.length),
  };
}

export function TablePagerFooter({
  from,
  to,
  total,
  page,
  pageCount,
  onPrev,
  onNext,
}: {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!total) return null;
  return (
    <div className="px-4 py-3 flex items-center justify-between text-[11px]" style={{ color: T.sub, borderTop: `1px solid ${T.border}` }}>
      <span className="tabular-nums">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 0}
          onClick={onPrev}
          className="h-7 px-2.5 rounded-md font-medium disabled:opacity-40 flex items-center gap-1"
          style={{ border: `1px solid ${T.border}`, background: T.surface }}
        >
          <ChevronLeft className="size-3.5" /> Prev
        </button>
        <span className="h-7 min-w-7 px-2 grid place-items-center rounded-md text-[11px] font-bold text-white tabular-nums" style={{ background: T.navy }}>
          {page + 1}
        </span>
        <button
          type="button"
          disabled={page >= pageCount - 1}
          onClick={onNext}
          className="h-7 px-2.5 rounded-md font-medium disabled:opacity-40 flex items-center gap-1"
          style={{ border: `1px solid ${T.border}`, background: T.surface }}
        >
          Next <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
