import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card } from "@/components/admin/Catalog";
import { OrderHeader, type AdminOrderRow } from "@/components/admin/OrderProfile";
import { fetchAdminOrder, fmtMoney } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id/refund")({
  head: () => ({ meta: [{ title: "Refund order — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminOrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    void fetchAdminOrder(id)
      .then((d) => setRow((d ?? null) as AdminOrderRow | null))
      .catch(() => setRow(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Refund" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Refund" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Order not found.</p>
      </AdminShell>
    );
  }

  const currency = String(row.currency ?? "USD");

  return (
    <AdminShell title=" " breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: row.id.slice(0, 8) }, { label: "Refund" }]}>
      <OrderHeader row={row} />
      <Card className="mt-4">
        <p className="text-[13px] font-bold flex items-center gap-2">
          <RotateCcw className="size-4" style={{ color: T.accent }} /> Issue refund
        </p>
        <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
          Refund amount:{" "}
          <span className="font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtMoney(currency, row.totalMinor)}
          </span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Refund reason for audit log…"
          rows={3}
          className="mt-3 w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-none"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
        />
        <button
          type="button"
          onClick={() => toast.message("Refund API not wired — logged for ops", { description: note || "No note" })}
          className="mt-3 h-9 px-4 rounded-lg text-[12px] font-bold text-white"
          style={{ background: T.navy }}
        >
          Queue refund
        </button>
      </Card>
    </AdminShell>
  );
}
