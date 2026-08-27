import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminEscrows, fmtMoney, type AdminEscrow } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/escrow/")({
  head: () => ({ meta: [{ title: "Escrow contracts — MagnetPay Admin" }] }),
  component: Page,
});

function statusTone(status: string): "success" | "warn" | "danger" | "info" | "neutral" {
  const s = status.toUpperCase();
  if (s === "RELEASED" || s === "COMPLETED") return "success";
  if (s === "DISPUTED") return "danger";
  if (s === "FUNDED" || s === "PENDING" || s === "ACTIVE") return "warn";
  if (s === "REFUNDED" || s === "CANCELLED") return "neutral";
  return "info";
}

function Page() {
  const [rows, setRows] = useState<AdminEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminEscrows();
        if (!cancelled) setRows(data);
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

  const statuses = useMemo(() => {
    const set = new Set(rows.map((r) => r.status));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (tab === "all") return rows;
    return rows.filter((r) => r.status === tab);
  }, [rows, tab]);

  const tabs = [
    { id: "all", label: "All", count: rows.length },
    ...statuses.map((s) => ({
      id: s,
      label: s,
      count: rows.filter((r) => r.status === s).length,
    })),
  ];

  return (
    <AdminShell
      title="Escrow contracts"
      description="All escrow agreements — funds held, released, refunded, and disputed."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Escrow" }]}
    >
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
              style={{
                background: active ? T.navy : T.surface,
                color: active ? "#fff" : T.ink,
                border: `1px solid ${active ? T.navy : T.border}`,
              }}
            >
              {t.label}
              <span className="text-[10px] tabular-nums opacity-80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

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
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No escrows found.
          </p>
        ) : (
          filtered.map((e, i) => (
            <div
              key={e.id}
              className="grid items-center px-4 h-[52px] text-[12px]"
              style={{
                gridTemplateColumns: "1fr 1fr 1.2fr 0.8fr 1.2fr",
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
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
              <Pill tone={statusTone(e.status)}>{e.status}</Pill>
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
    </AdminShell>
  );
}
