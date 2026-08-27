import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminEscrows, fmtMoney, type AdminEscrow } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/escrow/disputed")({
  head: () => ({ meta: [{ title: "Disputed escrow — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<AdminEscrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminEscrows();
        const filtered = data.filter(
          (e) => (e.disputes?.length ?? 0) > 0 || e.status.toUpperCase() === "DISPUTED",
        );
        if (!cancelled) setRows(filtered);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load escrows");
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

  return (
    <AdminShell
      title="Disputed escrow"
      description="Contracts with open or recorded disputes. Funds stay locked until resolved."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow", to: "/admin/escrow" }, { label: "Disputed" }]}
    >
      <EscrowTable rows={rows} loading={loading} empty="No disputed escrows." />
    </AdminShell>
  );
}

function EscrowTable({ rows, loading, empty }: { rows: AdminEscrow[]; loading: boolean; empty: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <div
        className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{
          color: T.muted,
          background: T.bg,
          borderBottom: `1px solid ${T.border}`,
          gridTemplateColumns: "1fr 1fr 1.2fr 0.8fr 1.2fr",
        }}
      >
        <span>ID</span>
        <span>Status</span>
        <span>Amount</span>
        <span>Disputes</span>
        <span>Date</span>
      </div>
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
          {empty}
        </p>
      ) : (
        rows.map((e, i) => (
          <div
            key={e.id}
            className="grid items-center px-4 h-[52px] text-[12px]"
            style={{
              gridTemplateColumns: "1fr 1fr 1.2fr 0.8fr 1.2fr",
              borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <Link
              to="/admin/escrow/$id"
              params={{ id: e.id }}
              className="tabular-nums font-semibold hover:underline"
              style={{ color: T.navy, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {e.id.slice(0, 8)}
            </Link>
            <Pill tone="danger">{e.status}</Pill>
            <span className="tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtMoney(e.currency, e.amountMinor)}
            </span>
            <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {e.disputes?.length ?? 0}
            </span>
            <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date(e.createdAt).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
