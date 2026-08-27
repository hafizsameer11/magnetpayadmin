import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminDisputes, fmtMoney, type AdminDispute } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/disputes/")({
  head: () => ({ meta: [{ title: "Disputes — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminDisputes();
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load disputes");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const open = rows.filter((d) => !d.outcome).length;

  return (
    <AdminShell
      title="Disputes"
      description="Escrow disputes opened by buyers or sellers."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Disputes" }]}
      actions={
        <Link
          to="/admin/disputes/sla"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          SLA board
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Total
          </p>
          <p className="mt-1.5 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {loading ? "…" : rows.length}
          </p>
        </div>
        <div className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
            Unresolved
          </p>
          <p className="mt-1.5 text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.danger }}>
            {loading ? "…" : open}
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1fr 1.4fr 1.2fr 1.2fr 1fr 1.2fr",
          }}
        >
          <span>ID</span>
          <span>Reason</span>
          <span>Opened by</span>
          <span>Escrow</span>
          <span>Outcome</span>
          <span>Opened</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No disputes.
          </p>
        ) : (
          rows.map((d, i) => (
            <Link
              key={d.id}
              to="/admin/disputes/$id"
              params={{ id: d.id }}
              className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
              style={{
                gridTemplateColumns: "1fr 1.4fr 1.2fr 1.2fr 1fr 1.2fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <span className="tabular-nums font-semibold" style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}>
                {d.id.slice(0, 8)}
              </span>
              <span className="truncate">{d.reason}</span>
              <span className="truncate">{d.openedBy?.name ?? "—"}</span>
              <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {d.escrow ? fmtMoney(d.escrow.currency, d.escrow.amountMinor) : d.escrowId.slice(0, 8)}
              </span>
              <span>
                {d.outcome ? <Pill tone="success">{d.outcome}</Pill> : <Pill tone="warn">Open</Pill>}
              </span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(d.createdAt).toLocaleString()}
              </span>
            </Link>
          ))
        )}
      </div>
    </AdminShell>
  );
}
