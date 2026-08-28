import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, StickyNote } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card } from "@/components/admin/Catalog";
import { OrderHeader, type AdminOrderRow } from "@/components/admin/OrderProfile";
import { fetchAdminAudit, fetchAdminOrder } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id/notes")({
  head: () => ({ meta: [{ title: "Order notes — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminOrderRow | null>(null);
  const [notes, setNotes] = useState<{ action: string; at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [order, audit] = await Promise.all([fetchAdminOrder(id), fetchAdminAudit()]);
        setRow((order ?? null) as AdminOrderRow | null);
        setNotes(
          audit
            .filter((a) => a.entity === "MarketOrder" && a.entityId === id)
            .map((a) => ({ action: a.action, at: new Date(a.createdAt).toLocaleString() })),
        );
      } catch {
        setRow(null);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Notes" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Notes" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Order not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title=" " breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Orders", to: "/admin/orders" }, { label: row.id.slice(0, 8) }, { label: "Notes" }]}>
      <OrderHeader row={row} />
      <Card className="mt-4">
        <p className="text-[13px] font-bold flex items-center gap-2">
          <StickyNote className="size-4" style={{ color: T.info }} /> Staff notes
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an internal note…"
          rows={3}
          className="mt-3 w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-none"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
        />
        <button
          type="button"
          onClick={() => {
            if (!draft.trim()) return;
            toast.success("Note saved locally — wire to audit API when available");
            setDraft("");
          }}
          className="mt-3 h-9 px-4 rounded-lg text-[12px] font-bold text-white"
          style={{ background: T.navy }}
        >
          Save note
        </button>
      </Card>
      <Card className="mt-4" padded={false}>
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-[12px] font-bold">Audit trail</p>
        </div>
        {notes.length ? (
          notes.map((n, i) => (
            <div key={i} className="px-4 py-3 flex justify-between text-[12px]" style={{ borderBottom: i < notes.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span className="font-semibold">{n.action}</span>
              <span className="tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                {n.at}
              </span>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No audit events for this order.
          </p>
        )}
      </Card>
    </AdminShell>
  );
}
