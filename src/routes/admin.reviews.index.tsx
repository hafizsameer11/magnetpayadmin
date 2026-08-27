import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminReviews } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews/")({
  head: () => ({ meta: [{ title: "Reviews — MagnetPay Admin" }] }),
  component: Page,
});

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className="size-3" style={{ color: i <= n ? T.warn : T.border, fill: i <= n ? T.warn : "transparent" }} />
      ))}
    </div>
  );
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);

  useEffect(() => {
    void fetchAdminReviews()
      .then(setRows)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load reviews"));
  }, []);

  const avg =
    rows.length === 0
      ? 0
      : rows.reduce((s, raw) => {
          const r = raw as Record<string, unknown>;
          return s + (typeof r.rating === "number" ? r.rating : Number(r.rating) || 0);
        }, 0) / rows.length;

  return (
    <AdminShell
      title="Reviews"
      description="Buyer product reviews from the API."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Reviews" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Reviews
          </p>
          <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {rows.length}
          </p>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Avg rating
          </p>
          <p className="mt-2 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.info }}>
            {rows.length ? avg.toFixed(2) : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((raw) => {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const product = (r.product ?? {}) as Record<string, unknown>;
          const rating = typeof r.rating === "number" ? r.rating : Number(r.rating) || 0;
          const id = str(r.id);
          return (
            <div key={id} className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className="flex items-start gap-3">
                <div
                  className="size-9 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
                  style={{ background: `${T.navy}10`, color: T.navy }}
                >
                  {str(user.name, "?")
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[13px]">{str(user.name)}</p>
                    <Stars n={rating} />
                    <Pill tone="info">{rating}/5</Pill>
                    <span className="ml-auto text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {r.createdAt ? new Date(String(r.createdAt)).toLocaleString() : "—"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px]" style={{ color: T.muted }}>
                    on{" "}
                    <Link to="/admin/reviews/$id" params={{ id }} className="hover:underline" style={{ color: T.sub }}>
                      {str(product.title, "Product")}
                    </Link>
                    <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {" "}
                      · {str(product.id, id).slice(0, 8)}
                    </span>
                  </p>
                  <p className="mt-2 text-[12.5px]" style={{ color: T.ink }}>
                    {str(r.comment, "No comment")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {!rows.length ? (
          <p className="p-6 text-center text-[12px] rounded-xl" style={{ color: T.muted, background: T.surface, border: `1px solid ${T.border}` }}>
            No reviews yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
