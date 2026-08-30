import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Package, Clock, Truck, XCircle, CheckCircle2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { FilterTabs, KpiStrip, ListEmpty, ListToolbar } from "@/components/admin/ListPageKit";
import { Pill } from "@/components/admin/UserProfile";
import { cancelAdminOrder, fetchAdminOrders, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/")({
  head: () => ({ meta: [{ title: "All orders — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";
type StatusTab = "all" | "pending" | "processing" | "delivered" | "cancelled";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function statusOf(raw: unknown) {
  return str((raw as Record<string, unknown>).status).toUpperCase();
}

function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "DELIVERED" || s === "COMPLETED" || s === "PAID") return "success";
  if (s === "PENDING" || s === "PROCESSING" || s === "DRAFT" || s === "SHIPPED") return "warn";
  if (s === "CANCELLED" || s === "REFUNDED" || s === "FAILED") return "danger";
  return "info";
}

function canCancel(status: string) {
  const s = status.toUpperCase();
  return s !== "CANCELLED" && s !== "DELIVERED" && s !== "REFUNDED";
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminOrders());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const pending = rows.filter((r) => {
      const s = statusOf(r);
      return s === "PENDING" || s === "DRAFT";
    }).length;
    const processing = rows.filter((r) => statusOf(r) === "PROCESSING" || statusOf(r) === "SHIPPED").length;
    const delivered = rows.filter((r) => {
      const s = statusOf(r);
      return s === "DELIVERED" || s === "COMPLETED" || s === "PAID";
    }).length;
    const cancelled = rows.filter((r) => statusOf(r) === "CANCELLED").length;
    return { total: rows.length, pending, processing, delivered, cancelled };
  }, [rows]);

  const filtered = rows.filter((raw) => {
    const s = statusOf(raw);
    if (tab === "pending" && s !== "PENDING" && s !== "DRAFT") return false;
    if (tab === "processing" && s !== "PROCESSING" && s !== "SHIPPED") return false;
    if (tab === "delivered" && s !== "DELIVERED" && s !== "COMPLETED" && s !== "PAID") return false;
    if (tab === "cancelled" && s !== "CANCELLED" && s !== "REFUNDED") return false;
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const user = (r.user ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return (
      str(r.id).toLowerCase().includes(q) ||
      str(user.name).toLowerCase().includes(q) ||
      str(r.supplier).toLowerCase().includes(q) ||
      s.toLowerCase().includes(q)
    );
  });

  const cancel = async (id: string) => {
    setBusyId(id);
    try {
      await cancelAdminOrder(id);
      toast.success("Order cancelled");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell
      title="All orders"
      description="Marketplace orders across the NG–CN corridor — track fulfillment and cancel when needed."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Orders" }]}
    >
      <KpiStrip
        items={[
          { label: "Total orders", value: loading ? "…" : counts.total, Icon: Package, tone: T.navy, delta: "Live from API" },
          { label: "Pending / draft", value: loading ? "…" : counts.pending, Icon: Clock, tone: T.warn, delta: "Awaiting payment or confirmation" },
          { label: "In fulfillment", value: loading ? "…" : counts.processing, Icon: Truck, tone: T.info, delta: "Processing or shipped" },
          { label: "Delivered", value: loading ? "…" : counts.delivered, Icon: CheckCircle2, tone: T.success, delta: `${counts.cancelled} cancelled` },
        ]}
      />

      <ListToolbar query={query} onQueryChange={setQuery} placeholder="Order ID, buyer, supplier…" onRefresh={() => void load()} refreshing={loading}>
        <FilterTabs
          active={tab}
          onChange={(id) => setTab(id as StatusTab)}
          tabs={[
            { id: "all", label: "All", count: counts.total },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "processing", label: "Processing", count: counts.processing },
            { id: "delivered", label: "Delivered", count: counts.delivered },
            { id: "cancelled", label: "Cancelled", count: counts.cancelled },
          ]}
        />
      </ListToolbar>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.1fr 1.4fr 1.2fr 1fr 1fr 1.1fr 1fr",
          }}
        >
          <span>Order</span>
          <span>Buyer</span>
          <span>Supplier</span>
          <span className="text-right">Total</span>
          <span>Status</span>
          <span>When</span>
          <span>Actions</span>
        </div>
        {filtered.map((raw, i) => {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const id = str(r.id);
          const status = str(r.status);
          const items = Array.isArray(r.items) ? r.items : [];
          return (
            <div
              key={id}
              className="grid items-center px-4 h-[58px] text-[12px]"
              style={{
                gridTemplateColumns: "1.1fr 1.4fr 1.2fr 1fr 1fr 1.1fr 1fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
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
              <Pill tone={toneFor(status)}>{status}</Pill>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.createdAt ? new Date(String(r.createdAt)).toLocaleString() : "—"}
              </span>
              <div>
                {canCancel(status) ? (
                  <button
                    disabled={busyId === id}
                    onClick={() => void cancel(id)}
                    className="h-7 px-2 rounded-md text-[10.5px] font-bold flex items-center gap-1 disabled:opacity-50"
                    style={{ background: `${T.danger}14`, color: T.danger }}
                  >
                    <XCircle className="size-3" /> Cancel
                  </button>
                ) : (
                  <span style={{ color: T.muted }}>—</span>
                )}
              </div>
            </div>
          );
        })}
        {!filtered.length ? <ListEmpty message="No orders match this filter." /> : null}
      </div>
    </AdminShell>
  );
}
