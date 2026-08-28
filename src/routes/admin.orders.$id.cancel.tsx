import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card } from "@/components/admin/Catalog";
import {
  canCancelOrder,
  OrderHeader,
  type AdminOrderRow,
} from "@/components/admin/OrderProfile";
import { cancelAdminOrder, fetchAdminOrder } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id/cancel")({
  head: () => ({ meta: [{ title: "Cancel order — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminOrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    void fetchAdminOrder(id)
      .then((d) => setRow((d ?? null) as AdminOrderRow | null))
      .catch(() => setRow(null))
      .finally(() => setLoading(false));
  }, [id]);

  const cancel = async () => {
    if (!row || busy) return;
    setBusy(true);
    try {
      await cancelAdminOrder(row.id);
      toast.success(reason.trim() ? `Order cancelled — ${reason}` : "Order cancelled");
      setRow({ ...row, status: "CANCELLED" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Cancel order" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Cancel order" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Order not found.</p>
      </AdminShell>
    );
  }

  const allowed = canCancelOrder(String(row.status));

  return (
    <AdminShell title=" " breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: row.id.slice(0, 8) }, { label: "Cancel" }]}>
      <OrderHeader row={row} />
      <Card className="mt-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" style={{ color: T.danger }} />
          <div className="flex-1">
            <p className="text-[13px] font-bold">Cancel order</p>
            <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
              This releases the buyer from the order commitment. Escrow handling depends on current payment state.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Internal reason (optional)…"
              rows={3}
              className="mt-3 w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-none"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
            />
            <button
              type="button"
              disabled={!allowed || busy}
              onClick={() => void cancel()}
              className="mt-3 h-9 px-4 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: T.danger }}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
              {allowed ? "Confirm cancel" : "Cannot cancel this status"}
            </button>
          </div>
        </div>
      </Card>
    </AdminShell>
  );
}
