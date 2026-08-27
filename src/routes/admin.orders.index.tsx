import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, XCircle } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { cancelAdminOrder, fetchAdminOrders, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/")({
  head: () => ({ meta: [{ title: "All orders — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

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

function canCancel(status: string) {
  const s = status.toUpperCase();
  return s !== "CANCELLED" && s !== "DELIVERED" && s !== "REFUNDED";
}

function Page() {
  const [rows, setRows] = useState<unknown[]>([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setRows(await fetchAdminOrders());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load orders");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = rows.filter((raw) => {
    if (!query) return true;
    const r = raw as Record<string, unknown>;
    const user = (r.user ?? {}) as Record<string, unknown>;
    const q = query.toLowerCase();
    return (
      str(r.id).toLowerCase().includes(q) ||
      str(user.name).toLowerCase().includes(q) ||
      str(r.supplier).toLowerCase().includes(q) ||
      str(r.status).toLowerCase().includes(q)
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
      description="Every marketplace order from the API."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Marketplace" }, { label: "Orders" }]}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Orders", val: rows.length },
          {
            label: "Pending / draft",
            val: rows.filter((raw) => {
              const s = str((raw as Record<string, unknown>).status).toUpperCase();
              return s === "PENDING" || s === "DRAFT";
            }).length,
            tone: T.warn,
          },
          {
            label: "Processing",
            val: rows.filter((raw) => str((raw as Record<string, unknown>).status).toUpperCase() === "PROCESSING").length,
            tone: T.info,
          },
          {
            label: "Cancelled",
            val: rows.filter((raw) => str((raw as Record<string, unknown>).status).toUpperCase() === "CANCELLED").length,
            tone: T.danger,
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

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg w-[280px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID, buyer, supplier…"
            className="bg-transparent text-[12px] outline-none flex-1"
            style={{ color: T.ink }}
          />
        </div>
      </div>

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
        {!filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No orders yet.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}
