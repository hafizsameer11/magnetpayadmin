import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { OrderDetailView, type AdminOrderRow } from "@/components/admin/OrderProfile";
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

  const displayId = row ? (row.id.startsWith("ORD-") ? row.id : `ORD-${row.id.slice(0, 6).toUpperCase()}`) : id.slice(0, 8);

  if (loading) {
    return (
      <AdminShell
        title="Order"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: displayId }]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell
        title="Order"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: displayId }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Order not found.
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: displayId }]}
    >
      <OrderDetailView row={row} onCancel={() => void cancel()} busy={busy} />
    </AdminShell>
  );
}
