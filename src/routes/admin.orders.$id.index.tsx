import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, XCircle } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { cancelAdminOrder, fetchAdminOrder, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id/")({
  head: () => ({ meta: [{ title: "Order detail — MagnetPay Admin" }] }),
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
  const { id } = Route.useParams();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrder(id);
      setRow((data ?? null) as Record<string, unknown> | null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load order");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const cancel = async () => {
    if (!row || busy) return;
    setBusy(true);
    try {
      await cancelAdminOrder(str(row.id));
      toast.success("Order cancelled");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Order" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Order" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>
          Order not found.
        </p>
      </AdminShell>
    );
  }

  const user = (row.user ?? {}) as Record<string, unknown>;
  const status = str(row.status);
  const currency = str(row.currency, "USD");
  const items = Array.isArray(row.items) ? (row.items as Record<string, unknown>[]) : [];

  return (
    <AdminShell
      title={`Order ${str(row.id).slice(0, 8)}`}
      description={`${str(user.name)} · ${fmtMoney(currency, row.totalMinor as string | number)}`}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: str(row.id).slice(0, 8) }]}
      actions={
        <>
          <Pill tone={toneFor(status)}>{status}</Pill>
          {canCancel(status) ? (
            <button
              disabled={busy}
              onClick={() => void cancel()}
              className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: T.danger }}
            >
              <XCircle className="size-3.5" /> Cancel
            </button>
          ) : null}
        </>
      }
    >
      <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-[12.5px] mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <KV label="Total" v={<span className="font-bold tabular-nums text-[14px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtMoney(currency, row.totalMinor as string | number)}</span>} />
        <KV label="Buyer" v={str(user.name)} />
        <KV label="Phone" v={<span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{str(user.phone)}</span>} />
        <KV label="Supplier" v={str(row.supplier, "—")} />
        <KV label="Escrow" v={<span className="tabular-nums text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{str(row.escrowId, "—")}</span>} />
        <KV label="Created" v={row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : "—"} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[12.5px] font-bold">Items</p>
        </div>
        {items.length ? (
          items.map((it, i) => {
            const product = (it.product ?? {}) as Record<string, unknown>;
            return (
              <div
                key={str(it.id, String(i))}
                className="px-4 py-3 flex items-center justify-between gap-3 text-[12px]"
                style={{ borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none" }}
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{str(it.title, str(product.title))}</p>
                  <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {str(it.productId, str(product.id)).slice(0, 8)} · qty {str(it.qty)}
                  </p>
                </div>
                <span className="tabular-nums font-bold shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtMoney(currency, it.priceMinor as string | number)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No line items.
          </p>
        )}
      </div>

      <Link to="/admin/orders" className="mt-4 inline-flex text-[11px] font-semibold items-center gap-1" style={{ color: T.sub }}>
        <ArrowLeft className="size-3" /> Back to orders
      </Link>
    </AdminShell>
  );
}

function KV({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </p>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}
