import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminOrders, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

const STATUS_GROUPS: Record<string, string[]> = {
  pending: ["PENDING", "DRAFT", "AWAITING_PAYMENT"],
  processing: ["PROCESSING", "PAID", "CONFIRMED"],
  shipped: ["SHIPPED", "IN_TRANSIT"],
  delivered: ["DELIVERED", "COMPLETED"],
  cancelled: ["CANCELLED"],
  refunded: ["REFUNDED"],
};

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "DELIVERED" || s === "COMPLETED" || s === "PAID") return "success";
  if (s === "PENDING" || s === "PROCESSING" || s === "DRAFT" || s === "SHIPPED") return "warn";
  if (s === "CANCELLED" || s === "REFUNDED" || s === "FAILED") return "danger";
  return "info";
}

function matchesStatus(rawStatus: string, group: string) {
  const allowed = STATUS_GROUPS[group] ?? [group.toUpperCase()];
  return allowed.includes(rawStatus.toUpperCase());
}

export function OrderStatusPage({
  status,
  title,
  description,
}: {
  status: keyof typeof STATUS_GROUPS;
  title: string;
  description: string;
}) {
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const all = await fetchAdminOrders();
        setRows(all.filter((raw) => matchesStatus(str((raw as Record<string, unknown>).status), status)));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load orders");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const totalMinor = rows.reduce((sum, raw) => {
    const n = Number((raw as Record<string, unknown>).totalMinor ?? 0);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const currency = str((rows[0] as Record<string, unknown> | undefined)?.currency, "NGN");

  return (
    <AdminShell
      title={title}
      description={description}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: title }]}
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            {[
              { label: "Count", val: rows.length },
              { label: "Total value", val: fmtMoney(currency, totalMinor), tone: T.success },
              {
                label: "Latest",
                val: rows[0]
                  ? new Date(String((rows[0] as Record<string, unknown>).createdAt)).toLocaleDateString()
                  : "—",
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
                  {s.label}
                </p>
                <p className="mt-2 text-[20px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.tone ?? T.ink }}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div
              className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{
                color: T.muted,
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                gridTemplateColumns: "1.1fr 1.4fr 1.2fr 1fr 1fr 1.1fr",
              }}
            >
              <span>Order</span>
              <span>Buyer</span>
              <span>Supplier</span>
              <span className="text-right">Total</span>
              <span>Status</span>
              <span>When</span>
            </div>
            {rows.map((raw, i) => {
              const r = raw as Record<string, unknown>;
              const user = (r.user ?? {}) as Record<string, unknown>;
              const id = str(r.id);
              const orderStatus = str(r.status);
              const items = Array.isArray(r.items) ? r.items : [];
              return (
                <div
                  key={id}
                  className="grid items-center px-4 h-[58px] text-[12px]"
                  style={{
                    gridTemplateColumns: "1.1fr 1.4fr 1.2fr 1fr 1fr 1.1fr",
                    borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <div>
                    <Link
                      to="/admin/orders/$id"
                      params={{ id }}
                      className="font-bold tabular-nums hover:underline"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: T.navy }}
                    >
                      {id.slice(0, 8)}
                    </Link>
                    <p className="text-[10px]" style={{ color: T.muted }}>
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="truncate">{str(user.name)}</span>
                  <span className="truncate" style={{ color: T.sub }}>
                    {str(r.supplier, "—")}
                  </span>
                  <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtMoney(str(r.currency, "USD"), r.totalMinor as string | number)}
                  </span>
                  <Pill tone={toneFor(orderStatus)}>{orderStatus}</Pill>
                  <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.createdAt ? new Date(String(r.createdAt)).toLocaleString() : "—"}
                  </span>
                </div>
              );
            })}
            {!rows.length ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
                No orders in this status.
              </p>
            ) : null}
          </div>
        </>
      )}
    </AdminShell>
  );
}
