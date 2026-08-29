import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminOrders, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/exceptions")({
  head: () => ({ meta: [{ title: "Order exceptions — MagnetPay Admin" }] }),
  component: Page,
});

function isException(raw: Record<string, unknown>) {
  const status = String(raw.status ?? "").toUpperCase();
  const logistics = String(raw.logisticsStatus ?? "").toUpperCase();
  if (["CANCELLED", "REFUNDED", "FAILED"].includes(status)) return true;
  if (["TOP_UP_REQUIRED", "QUOTE_PENDING", "DISPUTED"].includes(logistics)) return true;
  if (status === "IN_ESCROW" && logistics && !["BOOKED", "DELIVERED", "IN_TRANSIT"].includes(logistics)) return true;
  return false;
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminOrders()
      .then((all) => setRows(all.filter((raw) => isException(raw as Record<string, unknown>))))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell
      title="Order exceptions"
      description="Orders needing ops attention — logistics gaps, top-ups, or bad statuses."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: "Exceptions" }]}
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div
            className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: T.muted, background: T.bg, borderBottom: `1px solid ${T.border}`, gridTemplateColumns: "1fr 1.2fr 1fr 1fr 1fr" }}
          >
            <span>Order</span>
            <span>Buyer</span>
            <span>Status</span>
            <span>Logistics</span>
            <span className="text-right">Total</span>
          </div>
          {rows.map((raw, i) => {
            const r = raw as Record<string, unknown>;
            const user = (r.user ?? {}) as Record<string, unknown>;
            const id = String(r.id);
            return (
              <div
                key={id}
                className="grid items-center px-4 h-[52px] text-[12px]"
                style={{ gridTemplateColumns: "1fr 1.2fr 1fr 1fr 1fr", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none" }}
              >
                <Link to="/admin/orders/$id" params={{ id }} className="font-bold tabular-nums hover:underline" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                  {id.slice(0, 8)}
                </Link>
                <span className="truncate">{String(user.name ?? "—")}</span>
                <span>{String(r.status ?? "—")}</span>
                <span style={{ color: T.warn }}>{String(r.logisticsStatus ?? "—")}</span>
                <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtMoney(String(r.currency ?? "NGN"), r.totalMinor as string | number)}
                </span>
              </div>
            );
          })}
          {!rows.length ? <p className="p-8 text-center text-[12px]" style={{ color: T.muted }}>No exceptions right now.</p> : null}
        </div>
      )}
    </AdminShell>
  );
}
