import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import {
  canCancelOrder,
  OrderHeader,
  OrderItemsTable,
  OrderKPIs,
  OrderLinkedEntities,
  toneForOrderStatus,
  type AdminOrderRow,
} from "@/components/admin/OrderProfile";
import { cancelAdminOrder, fetchAdminOrder } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id/")({
  head: () => ({ meta: [{ title: "Order detail — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminOrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrder(id);
      setRow((data ?? null) as AdminOrderRow | null);
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
      await cancelAdminOrder(row.id);
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
      <AdminShell title="Order" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Order" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Order not found.</p>
      </AdminShell>
    );
  }

  const status = String(row.status);

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: row.id.slice(0, 8) }]}
    >
      <OrderHeader
        row={row}
        actions={
          <>
            <Pill tone={toneForOrderStatus(status)}>{status}</Pill>
            {canCancelOrder(status) ? (
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
      />
      <OrderKPIs row={row} />
      <OrderLinkedEntities row={row} />
      <OrderItemsTable row={row} />
    </AdminShell>
  );
}
